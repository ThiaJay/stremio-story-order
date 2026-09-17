const encoder = new TextEncoder();
const CACHE_ORIGIN = "https://story-order-cache.invalid/";

async function digestKey(raw) {
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(String(raw))));
  return [...digest].map(x => x.toString(16).padStart(2, "0")).join("");
}

async function kvGet(env, key) {
  if (!env?.STORY_CACHE) return null;
  try { return await env.STORY_CACHE.get(key, "json"); } catch { return null; }
}

async function kvPut(env, key, value, ttl) {
  if (!env?.STORY_CACHE) return false;
  try {
    await env.STORY_CACHE.put(key, JSON.stringify(value), { expirationTtl: ttl });
    return true;
  } catch { return false; }
}

async function edgeGet(key) {
  if (typeof caches === "undefined" || !caches.default) return null;
  try {
    const response = await caches.default.match(new Request(`${CACHE_ORIGIN}${key}`));
    return response ? await response.json() : null;
  } catch { return null; }
}
async function edgePut(key, value, ttl) {
  if (typeof caches === "undefined" || !caches.default) return false;
  try {
    const response = new Response(JSON.stringify(value), {
      headers: { "content-type": "application/json", "cache-control": `public, max-age=${ttl}` }
    });
    await caches.default.put(new Request(`${CACHE_ORIGIN}${key}`), response);
    return true;
  } catch { return false; }
}

export async function readCache(env, rawKey) {
  const key = await digestKey(rawKey);
  return (await kvGet(env, key)) || (await edgeGet(key));
}

export async function writeCache(env, rawKey, payload, ttlSeconds = 90 * 86400) {
  const key = await digestKey(rawKey);
  const value = { savedAt: Date.now(), payload };
  const kv = await kvPut(env, key, value, ttlSeconds);
  if (!kv) await edgePut(key, value, ttlSeconds);
  return value;
}

export function cacheAgeMs(entry) {
  return entry?.savedAt ? Math.max(0, Date.now() - Number(entry.savedAt)) : Infinity;
}