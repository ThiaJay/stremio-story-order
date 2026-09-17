import { readCache, writeCache, cacheAgeMs } from "./cache.js";
import { CINEMETA_MANIFEST } from "./source-registry.js";

const RESOURCE_PATH = /^\/(?:manifest\.json|(?:catalog|meta|subtitles)\/[A-Za-z0-9._:-]+\/.+\.json)$/;
const MAX_JSON_BYTES = 6 * 1024 * 1024;
const CINEMETA_ROOT = CINEMETA_MANIFEST.slice(0, -"/manifest.json".length);

export function assertResourcePath(path) {
  const decoded = decodeURIComponent(String(path || ""));
  if (decoded.includes("..") || decoded.includes("\\") || !RESOURCE_PATH.test(decoded)) {
    throw new Error("Unsupported metadata resource path");
  }
  return decoded;
}

function staleWindow(path) {
  if (path === "/manifest.json") return 30 * 86400_000;
  if (path.startsWith("/catalog/")) return 14 * 86400_000;
  if (path.startsWith("/subtitles/")) return 3 * 86400_000;
  return 180 * 86400_000;
}

function cacheTtl(path) {
  if (path === "/manifest.json") return 30 * 86400;
  if (path.startsWith("/catalog/")) return 14 * 86400;
  if (path.startsWith("/subtitles/")) return 3 * 86400;
  return 180 * 86400;
}


function cacheablePath(source, path) {
  if (/^\/meta\/(series|movie)\//.test(path)) return true;
  return source.kind === "cinemeta" && path === "/manifest.json";
}

function shouldUseStale(status) {
  return !status || status === 408 || status === 425 || status === 429 || status >= 500;
}export async function readJsonResponse(response, maxBytes = MAX_JSON_BYTES) {
  const declared = Number(response.headers.get("content-length") || 0);
  if (declared > maxBytes) throw new Error("Metadata response too large");
  const type = response.headers.get("content-type") || "";
  if (!type.toLowerCase().includes("json")) throw new Error("Metadata source did not return JSON");

  if (!response.body?.getReader) return response.json();
  const reader = response.body.getReader();
  const chunks = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      try { await reader.cancel(); } catch {}
      throw new Error("Metadata response too large");
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return JSON.parse(new TextDecoder().decode(bytes));
}

async function liveFetch(source, pathAndQuery, request, fetchImpl) {
  const parsed = new URL(pathAndQuery, "https://local.invalid");
  const path = assertResourcePath(parsed.pathname);
  const target = `${source.root}${path}${parsed.search}`;
  const headers = new Headers();
  const accept = request?.headers?.get("accept");
  if (accept) headers.set("accept", accept);
  headers.set("user-agent", "StremioStoryOrder/0.2");
  const response = await fetchImpl(target, {
    method: request?.method === "HEAD" ? "HEAD" : "GET",
    headers,
    redirect: "manual",
    signal: AbortSignal.timeout(6500)
  });
  return { response, path, target };
}function cinemetaFallbackPath(path) {
  const match = path.match(/^\/meta\/(series|movie)\/(tt\d+)\.json$/);
  return match ? path : null;
}

async function fetchCinemetaFallback(path, fetchImpl) {
  const fallbackPath = cinemetaFallbackPath(path);
  if (!fallbackPath) return null;
  try {
    const response = await fetchImpl(`${CINEMETA_ROOT}${fallbackPath}`, {
      headers: { "user-agent": "StremioStoryOrder/0.2" },
      redirect: "manual",
      signal: AbortSignal.timeout(4500)
    });
    if (!response.ok) return null;
    return await readJsonResponse(response);
  } catch {
    return null;
  }
}

export async function fetchJsonResilient(source, pathAndQuery, request, env = {}, ctx = null, fetchImpl = fetch) {
  const parsed = new URL(pathAndQuery, "https://local.invalid");
  const path = assertResourcePath(parsed.pathname);
  const key = `upstream:v2:${source.manifestUrl}:${path}${parsed.search}`;
  const mayCache = cacheablePath(source, path);
  const cached = mayCache ? await readCache(env, key) : null;
  let failure = null;

  try {
    const { response } = await liveFetch(source, pathAndQuery, request, fetchImpl);
    if (!response.ok) {
      failure = new Error(`metadata source ${response.status}`);
      failure.status = response.status;
    } else {
      const payload = await readJsonResponse(response);
      if (mayCache) {
        const write = writeCache(env, key, payload, cacheTtl(path));
        if (ctx?.waitUntil) ctx.waitUntil(write); else await write;
      }
      return { payload, source: "live", stale: false, status: 200, cacheAgeMs: 0 };
    }
  } catch (error) {
    failure = error;
  }

  const status = Number(failure?.status || 0);
  if (cached && shouldUseStale(status) && cacheAgeMs(cached) <= staleWindow(path)) {
    return { payload: cached.payload, source: "stale-cache", stale: true, status: 200, cacheAgeMs: cacheAgeMs(cached), error: String(failure?.message || failure) };
  }

  if (source.kind !== "cinemeta" && shouldUseStale(status)) {
    const fallback = await fetchCinemetaFallback(path, fetchImpl);
    if (fallback) return { payload: fallback, source: "cinemeta-fallback", stale: false, status: 200, cacheAgeMs: 0, error: String(failure?.message || failure) };
  }

  return { payload: null, source: "failed", stale: false, status: status || 502, error: String(failure?.message || failure || "metadata source unavailable") };
}