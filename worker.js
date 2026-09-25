import { encodeConfig, decodeConfig, defaultConfig, normalizeConfig } from "./config-token.js";
import { resolveSource, publicSourceChoices } from "./source-registry.js";
import { getEpisodeEnrichment } from "./provider.js";
import { fetchJsonResilient } from "./upstream.js";
import { planStoryOrder, showOverrideFor } from "./story-order.js";
import { configurationPage, BRAND_ICON_URL, BRAND_PUBLIC_BASE } from "./config-page.js";

const VERSION = "1.0.20";
const STREMIO_ADDONS_CONFIG = Object.freeze({
  issuer: "https://stremio-addons.net",
  signature: "eyJhbGciOiJkaXIiLCJlbmMiOiJBMTI4Q0JDLUhTMjU2In0..FaDf7hoYiC8hvtwSmN30PQ.mtnxarf04PR-5yTg-14UxmLYcnOJFn8ATQsLvlOX47JouFo9xSVwebh8_OCptIRD9i7uJBKn2b7iPaQ11duUzEKe_uIS9tKNYL5o6zb_ENxs_qn1r4lrHFWg40w6Mt9D.sLJQDol-6J0cvZqrJdBKBw"
});
const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "content-type",
  "access-control-allow-methods": "GET,HEAD,POST,OPTIONS",
  "x-content-type-options": "nosniff",
  "referrer-policy": "no-referrer"
};

function headers(extra = {}) {
  return new Headers({ ...CORS, ...extra });
}

function json(data, status = 200, cache = "no-store") {
  return new Response(JSON.stringify(data), {
    status,
    headers: headers({ "content-type": "application/json; charset=utf-8", "cache-control": cache })
  });
}

function headless(response) {
  return new Response(null, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers
  });
}

function errorResponse(error, status = 400) {
  return json({ error: String(error?.message || error || "Request failed") }, status);
}function htmlResponse(page) {
  return new Response(page.html, {
    headers: headers({
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "content-security-policy": `default-src 'none'; script-src 'nonce-${page.nonce}'; style-src 'unsafe-inline'; connect-src 'self'; img-src 'self' data: ${BRAND_PUBLIC_BASE}/; base-uri 'none'; form-action 'self'; frame-ancestors 'none'`,
      "permissions-policy": "camera=(), microphone=(), geolocation=(), payment=()"
    })
  });
}

function imdbIdFromMeta(meta, requestedId) {
  const candidates = [meta?.imdb_id, meta?._imdbId, meta?.behaviorHints?.imdbId, requestedId];
  return candidates.find(value => /^tt\d+$/.test(String(value || ""))) || null;
}

function tvdbIdFromMeta(meta) {
  const candidates = [meta?.tvdb_id, meta?._tvdbId, meta?.behaviorHints?.tvdbId];
  const value = candidates.find(x => /^\d+$/.test(String(x || "")));
  return value ? String(value) : null;
}

function configuredManifest(upstreamManifest, source) {
  const manifest = structuredClone(upstreamManifest);
  manifest.id = "org.stremio.story-order";
  manifest.name = "Story Order";
  manifest.version = VERSION;
  manifest.description = "Puts TV episodes, specials and one-offs in the right watch order. Story Order fixes TV episode order in Stremio so misplaced narrative episodes appear and autoplay in the proper sequence. Works independently of your stream addons.";
  manifest.logo = BRAND_ICON_URL;
  manifest.background = "https://raw.githubusercontent.com/ThiaJay/stremio-story-order/main/public/background.jpg";
  manifest.stremioAddonsConfig = { ...STREMIO_ADDONS_CONFIG };
  manifest.behaviorHints = { ...(manifest.behaviorHints || {}), adult: false, p2p: false, configurable: true, configurationRequired: false };
  return manifest;
}async function configForToken(token, env) {
  return token ? await decodeConfig(token, env) : defaultConfig();
}

async function manifestFor(config, env, ctx, request) {
  const source = resolveSource(config.source, env);
  const result = await fetchJsonResilient(source, "/manifest.json", request, env, ctx);
  if (!result.payload) throw new Error(`Metadata source unavailable: ${result.error || result.status}`);
  return { manifest: configuredManifest(result.payload, source), source, upstream: result };
}

async function readRequestJson(request, max = 32768) {
  const declared = Number(request.headers.get("content-length") || 0);
  if (declared > max) throw new Error("Configuration request is too large");
  const text = await request.text();
  if (text.length > max) throw new Error("Configuration request is too large");
  return JSON.parse(text || "{}");
}

function installUrls(request, token) {
  const url = new URL(request.url);
  const path = token ? `/${token}/manifest.json` : "/manifest.json";
  const manifestUrl = `${url.origin}${path}`;
  return { manifestUrl, installUrl: `stremio://${url.host}${path}` };
}

async function createConfiguration(request, env) {
  const input = normalizeConfig(await readRequestJson(request));
  resolveSource(input.source, env);
  const token = await encodeConfig(input, env);
  return { token, ...installUrls(request, token), config: input };
}async function seriesPayload(config, source, pathAndQuery, requestedId, request, env, ctx) {
  const upstream = await fetchJsonResilient(source, pathAndQuery, request, env, ctx);
  if (!upstream.payload) return { payload: null, status: upstream.status, diagnostics: { upstream } };
  const payload = structuredClone(upstream.payload);
  const meta = payload?.meta;
  const diagnostics = {
    upstream: { source: upstream.source, stale: upstream.stale },
    enrichment: null,
    inserted: [],
    storyOrder: [],
    mode: "canonical-video-passthrough",
    reason: "CANONICAL_VIDEO_COORDINATES_PRESERVED"
  };
  if (!meta || !Array.isArray(meta.videos)) return { payload, status: 200, diagnostics };

  const canonicalVideos = structuredClone(meta.videos);
  const imdbId = imdbIdFromMeta(meta, requestedId);
  const tvdbId = tvdbIdFromMeta(meta);
  const enrichment = await getEpisodeEnrichment({ imdbId, tvdbId }, env, ctx);
  diagnostics.enrichment = { source: enrichment.source, error: enrichment.error || null };

  const plan = planStoryOrder(meta.videos, enrichment.episodes, {
    order: config.order,
    override: showOverrideFor(config.overrides, imdbId)
  });
  diagnostics.inserted = plan.inserted;
  diagnostics.storyOrder = plan.ids;
  diagnostics.planMode = plan.mode;

  if (plan.ids.length) {
    payload.meta.behaviorHints = {
      ...(meta.behaviorHints || {}),
      storyOrder: plan.ids,
      storyOrderVersion: 1
    };
    diagnostics.mode = "stable-id-story-order-hint";
    diagnostics.reason = "PRESENTATION_ORDER_PUBLISHED_WITH_CANONICAL_IDENTITIES";
  }

  // The stable-ID hint is additive metadata only. Canonical videos, IDs and
  // season/episode coordinates must remain byte-for-byte equivalent.
  if (JSON.stringify(payload.meta.videos) !== JSON.stringify(canonicalVideos)) {
    throw new Error("Story Order canonical video invariant failed");
  }
  return { payload, status: 200, diagnostics };
}

async function genericPayload(source, pathAndQuery, request, env, ctx) {
  return fetchJsonResilient(source, pathAndQuery, request, env, ctx);
}function configuredRoute(pathname) {
  if (pathname === "/manifest.json" || /^\/(?:catalog|meta|subtitles|_story)\//.test(pathname)) return { token: "", resource: pathname };
  const match = pathname.match(/^\/(v2\.[A-Za-z0-9_-]{20,8190})(\/.+)$/);
  return match ? { token: match[1], resource: match[2] } : null;
}

function cachePolicy(resource, degraded = false) {
  if (degraded) return "public, max-age=60";
  if (resource === "/manifest.json") return "public, max-age=900";
  if (resource.startsWith("/catalog/")) return "public, max-age=1800";
  if (resource.startsWith("/subtitles/")) return "public, max-age=900";
  return "public, max-age=3600";
}

function validResource(resource) {
  return resource === "/manifest.json" || /^\/(catalog|meta|subtitles)\//.test(resource);
}

function serviceStatus(sourceKind = "cinemeta") {
  return {
    service: "Story Order",
    version: VERSION,
    status: "live",
    source: String(sourceKind || "unknown"),
    storyOrderContract: {
      version: 1,
      representation: "stable-video-id-presentation-hint",
      canonicalVideoCoordinatesPreserved: true,
      canonicalVideoIdsPreserved: true,
      watchedIdentityMutation: false
    },
    privacy: {
      stremioAuthKeyRequired: false,
      accountAccess: false,
      analytics: false
    }
  };
}

function configPageFor(token, env) {
  return htmlResponse(configurationPage({ token, choices: publicSourceChoices(env) }));
}

async function handleConfigApi(request, env, url) {
  if (request.method === "POST" && url.pathname === "/api/config") {
    return json(await createConfiguration(request, env), 200);
  }
  const match = url.pathname.match(/^\/api\/config\/(v2\.[A-Za-z0-9_-]{20,8190})$/);
  if (request.method === "GET" && match) {
    const config = await decodeConfig(match[1], env);
    resolveSource(config.source, env);
    return json(config, 200);
  }
  return null;
}export default {
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: headers() });
    const url = new URL(request.url);
    try {
      if (url.pathname === "/") return Response.redirect(`${url.origin}/configure`, 302);
      if (request.method === "GET" && url.pathname === "/configure") return configPageFor("", env);
      const tokenConfigure = url.pathname.match(/^\/(v2\.[A-Za-z0-9_-]{20,8190})\/configure\/?$/);
      if (request.method === "GET" && tokenConfigure) return configPageFor(tokenConfigure[1], env);

      if (url.pathname.startsWith("/api/config")) {
        const response = await handleConfigApi(request, env, url);
        return response || errorResponse("Not found", 404);
      }
      if (request.method !== "GET" && request.method !== "HEAD") return errorResponse("Method not allowed", 405);

      const isHead = request.method === "HEAD";
      const resourceRequest = isHead
        ? new Request(request.url, { method: "GET", headers: request.headers })
        : request;
      const finish = response => isHead ? headless(response) : response;

      const route = configuredRoute(url.pathname);
      if (!route) return errorResponse("Not found", 404);
      const config = await configForToken(route.token, env);
      const source = resolveSource(config.source, env);

      if (route.resource === "/manifest.json") {
        const built = await manifestFor(config, env, ctx, resourceRequest);
        const degraded = built.upstream.source !== "live";
        return finish(json(built.manifest, 200, cachePolicy(route.resource, degraded)));
      }

      if (route.resource === "/_story/status.json") {
        return finish(json(serviceStatus(source.kind), 200, "public, max-age=60"));
      }

      const debugMatch = route.resource.match(/^\/_story\/debug\/series\/(.+)\.json$/);
      if (debugMatch) {
        const id = decodeURIComponent(debugMatch[1]);
        const result = await seriesPayload(config, source, `/meta/series/${encodeURIComponent(id)}.json`, id, resourceRequest, env, ctx);
        return finish(json(result.diagnostics, result.payload ? 200 : result.status || 502));
      }
      if (!validResource(route.resource)) return errorResponse("Unsupported resource", 404);
      const seriesMatch = route.resource.match(/^\/meta\/series\/(.+)\.json$/);
      if (seriesMatch) {
        const id = decodeURIComponent(seriesMatch[1]);
        const result = await seriesPayload(config, source, `${route.resource}${url.search}`, id, resourceRequest, env, ctx);
        if (!result.payload) return finish(errorResponse("Metadata source unavailable", result.status || 502));
        const degraded = result.diagnostics?.upstream?.source !== "live";
        return finish(json(result.payload, 200, cachePolicy(route.resource, degraded)));
      }

      const upstream = await genericPayload(source, `${route.resource}${url.search}`, resourceRequest, env, ctx);
      if (!upstream.payload) return finish(errorResponse("Metadata source unavailable", upstream.status || 502));
      return finish(json(upstream.payload, 200, cachePolicy(route.resource, upstream.source !== "live")));
    } catch (error) {
      return errorResponse(error, 400);
    }
  }
};

export { seriesPayload, manifestFor, configuredManifest, serviceStatus };
