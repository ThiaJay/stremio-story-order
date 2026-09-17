const encoder = new TextEncoder();
const decoder = new TextDecoder();
const TOKEN_PREFIX = "v2.";
const MAX_TOKEN = 8192;
const ID_PATTERN = /^[A-Za-z0-9._:-]{1,180}$/;

export const DEFAULT_ORDER = Object.freeze({
  profile: "safe",
  fullLength: true,
  shortForm: "exclude",
  includeNonStory: false,
  includeInsignificant: false,
  providerRegularRepairs: true,
  upstreamFallback: true,
  minRuntimeRatio: 0.5,
  minFullLengthMinutes: 20,
  future: "leave"
});

function bytesToBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(text) {
  const normalized = text.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - normalized.length % 4) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, ch => ch.charCodeAt(0));
}async function importKey(secret) {
  const raw = base64UrlToBytes(String(secret || ""));
  if (raw.length !== 32) throw new Error("CONFIG_SECRET must decode to 32 bytes");
  return crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["encrypt", "decrypt"]);
}

function clampNumber(value, min, max, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
}

function normalizeOrder(input = {}) {
  const profile = ["safe", "balanced", "complete", "custom"].includes(input.profile) ? input.profile : "safe";
  const presets = {
    safe: { shortForm: "exclude", minRuntimeRatio: 0.5, minFullLengthMinutes: 20 },
    balanced: { shortForm: "significant", minRuntimeRatio: 0.45, minFullLengthMinutes: 15 },
    complete: { shortForm: "all", minRuntimeRatio: 0.35, minFullLengthMinutes: 8 },
    custom: {}
  };
  const preset = presets[profile];
  const shortForm = ["exclude", "significant", "all"].includes(input.shortForm) ? input.shortForm : (preset.shortForm || "exclude");
  return {
    profile,
    fullLength: input.fullLength !== false,
    shortForm,
    includeNonStory: input.includeNonStory === true,
    includeInsignificant: input.includeInsignificant === true,
    providerRegularRepairs: input.providerRegularRepairs !== false,
    upstreamFallback: input.upstreamFallback !== false,
    minRuntimeRatio: clampNumber(input.minRuntimeRatio, 0.2, 1, preset.minRuntimeRatio ?? 0.5),
    minFullLengthMinutes: clampNumber(input.minFullLengthMinutes, 3, 180, preset.minFullLengthMinutes ?? 20),
    future: input.future === "include" ? "include" : "leave"
  };
}function cleanId(value) {
  const text = String(value || "").trim();
  return ID_PATTERN.test(text) ? text : null;
}

function normalizeOverrides(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {};
  const out = {};
  for (const [showId, raw] of Object.entries(input).slice(0, 25)) {
    if (!/^tt\d{5,12}$/.test(showId) || !raw || typeof raw !== "object") continue;
    const exclude = [...new Set((Array.isArray(raw.exclude) ? raw.exclude : []).map(cleanId).filter(Boolean))].slice(0, 40);
    const include = (Array.isArray(raw.include) ? raw.include : []).slice(0, 40).map(item => {
      if (typeof item === "string") item = { id: item };
      const id = cleanId(item?.id);
      if (!id) return null;
      const result = { id };
      const season = Number(item.targetSeason);
      if (Number.isInteger(season) && season > 0 && season < 1000) result.targetSeason = season;
      const beforeId = cleanId(item.beforeId);
      const afterId = cleanId(item.afterId);
      if (beforeId) result.beforeId = beforeId;
      else if (afterId) result.afterId = afterId;
      return result;
    }).filter(Boolean);
    if (exclude.length || include.length) out[showId] = { exclude, include };
  }
  return out;
}

export function normalizeConfig(input = {}) {
  const source = input.source && typeof input.source === "object" ? input.source : {};
  const kind = ["cinemeta", "aiometadata", "custom"].includes(source.kind) ? source.kind : "cinemeta";
  const manifestUrl = kind === "cinemeta" ? undefined : String(source.manifestUrl || "").trim().slice(0, 2048);
  return {
    source: manifestUrl ? { kind, manifestUrl } : { kind },
    order: normalizeOrder(input.order),
    overrides: normalizeOverrides(input.overrides)
  };
}export async function encodeConfig(input, env) {
  const config = normalizeConfig(input);
  const key = await importKey(env.CONFIG_SECRET);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = encoder.encode(JSON.stringify(config));
  const cipher = new Uint8Array(await crypto.subtle.encrypt(
    { name: "AES-GCM", iv, additionalData: encoder.encode(TOKEN_PREFIX) }, key, plaintext
  ));
  const packed = new Uint8Array(iv.length + cipher.length);
  packed.set(iv, 0);
  packed.set(cipher, iv.length);
  const token = TOKEN_PREFIX + bytesToBase64Url(packed);
  if (token.length > MAX_TOKEN) throw new Error("Configuration is too large; reduce manual overrides");
  return token;
}

export async function decodeConfig(token, env) {
  const text = String(token || "");
  if (!text.startsWith(TOKEN_PREFIX) || text.length > MAX_TOKEN) throw new Error("Invalid configuration token");
  const packed = base64UrlToBytes(text.slice(TOKEN_PREFIX.length));
  if (packed.length < 29) throw new Error("Invalid configuration token");
  const iv = packed.slice(0, 12);
  const cipher = packed.slice(12);
  const key = await importKey(env.CONFIG_SECRET);
  let plain;
  try {
    plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv, additionalData: encoder.encode(TOKEN_PREFIX) }, key, cipher
    );
  } catch {
    throw new Error("Invalid configuration token");
  }
  return normalizeConfig(JSON.parse(decoder.decode(plain)));
}

export function defaultConfig() {
  return normalizeConfig({ source: { kind: "cinemeta" }, order: { profile: "safe" } });
}