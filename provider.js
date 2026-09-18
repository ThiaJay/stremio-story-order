import { readCache, writeCache, cacheAgeMs } from "./cache.js";
import { readJsonResponse } from "./upstream.js";

const TVMAZE = "https://api.tvmaze.com";
const FRESH_MS = 7 * 86400_000;
const STALE_MS = 180 * 86400_000;

function safeTvMazeRedirect(response) {
  if (![301,302,307,308].includes(response.status)) return null;
  const location = response.headers.get("location");
  if (!location) return null;
  let target;
  try { target = new URL(location); } catch { return null; }
  if (target.protocol !== "https:" || target.username || target.password || target.hash || target.search) return null;
  if (target.port && target.port !== "443") return null;
  if (target.hostname.toLowerCase() !== "api.tvmaze.com") return null;
  if (!/^\/shows\/\d+$/.test(target.pathname)) return null;
  return target.toString();
}

async function fetchJson(url, fetchImpl = fetch, timeoutMs = 4500) {
  const init = {
    redirect: "manual",
    signal: AbortSignal.timeout(timeoutMs),
    headers: { "user-agent": "StremioStoryOrder/0.2 (+community addon; TVmaze attributed)" }
  };
  let response = await fetchImpl(url, init);
  const redirected = safeTvMazeRedirect(response);
  if (redirected) {
    try { await response.body?.cancel?.(); } catch {}
    response = await fetchImpl(redirected, init);
  }
  if (!response.ok) throw new Error(`TVmaze ${response.status}`);
  return readJsonResponse(response, 4 * 1024 * 1024);
}

export { safeTvMazeRedirect };

function cacheKey(ids) {
  if (ids.imdbId) return `enrichment:tvmaze:v2:imdb:${ids.imdbId}`;
  if (ids.tvdbId) return `enrichment:tvmaze:v2:tvdb:${ids.tvdbId}`;
  return null;
}

async function fetchTvMaze(ids, fetchImpl) {
  const query = ids.imdbId
    ? `imdb=${encodeURIComponent(ids.imdbId)}`
    : `thetvdb=${encodeURIComponent(ids.tvdbId)}`;
  const show = await fetchJson(`${TVMAZE}/lookup/shows?${query}`, fetchImpl);
  const episodes = await fetchJson(`${TVMAZE}/shows/${show.id}/episodes?specials=1`, fetchImpl);
  return { show, episodes };
}export async function getEpisodeEnrichment(ids, env = {}, ctx = null, fetchImpl = fetch) {
  const key = cacheKey(ids);
  if (!key) return { source: "none", show: null, episodes: [], error: "No TVmaze lookup identifier" };
  const cached = await readCache(env, key);
  const age = cacheAgeMs(cached);

  if (cached && age <= FRESH_MS) {
    if (ctx?.waitUntil) {
      ctx.waitUntil(fetchTvMaze(ids, fetchImpl)
        .then(payload => writeCache(env, key, payload, 180 * 86400)).catch(() => {}));
    }
    return { source: "cache-fresh", show: cached.payload?.show || null, episodes: cached.payload?.episodes || [] };
  }

  try {
    const live = await fetchTvMaze(ids, fetchImpl);
    const write = writeCache(env, key, live, 180 * 86400);
    if (ctx?.waitUntil) ctx.waitUntil(write); else await write;
    return { source: "live", show: live.show, episodes: live.episodes || [] };
  } catch (error) {
    if (cached && age <= STALE_MS) {
      return {
        source: "cache-stale", show: cached.payload?.show || null,
        episodes: cached.payload?.episodes || [], error: String(error?.message || error)
      };
    }
    return { source: "unavailable", show: null, episodes: [], error: String(error?.message || error) };
  }
}