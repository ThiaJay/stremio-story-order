const CINEMETA_MANIFEST = "https://v3-cinemeta.strem.io/manifest.json";
const ELFHOSTED_SUFFIXES = new Set(["com", "cc", "party", "cafe", "surf", "wine", "beer", "haus"]);
const AIOMETA_SEGMENT = /^[A-Za-z0-9_-]{1,2048}$/;

function aiometadataHostAllowed(hostname) {
  const host = String(hostname || "").toLowerCase();
  for (const suffix of ELFHOSTED_SUFFIXES) {
    const root = `elfhosted.${suffix}`;
    if (host === `aiometadata.${root}`) return true;
    if (host.endsWith(`-aiometadata.${root}`)) {
      const prefix = host.slice(0, -`-aiometadata.${root}`.length);
      if (/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(prefix)) return true;
    }
  }
  return false;
}

function aiometadataPathAllowed(pathname) {
  const parts = String(pathname || "").split("/").filter(Boolean);
  if (parts[0] !== "stremio" || parts.at(-1) !== "manifest.json") return false;
  const configParts = parts.slice(1, -1);
  return (configParts.length === 1 || configParts.length === 2)
    && configParts.every(part => AIOMETA_SEGMENT.test(part));
}
const BLOCKED_HOST = /(^localhost$|\.localhost$|\.local$|\.internal$|\.home\.arpa$)/i;

function safeUrl(input) {
  const url = new URL(String(input || "").trim());
  if (url.protocol !== "https:" || url.username || url.password) throw new Error("Metadata source must use HTTPS");
  if (url.port && url.port !== "443") throw new Error("Metadata source must use the standard HTTPS port");
  if (url.search || url.hash) throw new Error("Manifest URL must not contain query or fragment data");
  if (BLOCKED_HOST.test(url.hostname) || /^\[.*\]$/.test(url.hostname) || /^\d+(?:\.\d+){3}$/.test(url.hostname)) {
    throw new Error("Local and IP-address metadata sources are not allowed");
  }
  if (/%2f|%5c/i.test(url.pathname)) throw new Error("Encoded path separators are not allowed");
  const decodedPath = decodeURIComponent(url.pathname);
  if (decodedPath.includes("..") || decodedPath.includes("\\") || !decodedPath.endsWith("/manifest.json")) {
    throw new Error("Use a Stremio manifest.json URL");
  }
  return url;
}

function rootFromManifest(url) {
  return `${url.origin}${url.pathname.slice(0, -"/manifest.json".length)}`;
}
function customHostAllowed(hostname, env = {}) {
  if (String(env.ENABLE_CUSTOM_UPSTREAM || "").toLowerCase() !== "true") return false;
  const suffixes = String(env.ALLOWED_UPSTREAM_HOSTS || "")
    .split(",").map(x => x.trim().toLowerCase()).filter(Boolean);
  const host = String(hostname || "").toLowerCase();
  return suffixes.some(rule => host === rule || (rule.startsWith("*.") && host.endsWith(rule.slice(1))));
}

export function resolveSource(source = {}, env = {}) {
  const kind = String(source.kind || "cinemeta").toLowerCase();
  if (kind === "cinemeta") {
    const url = new URL(CINEMETA_MANIFEST);
    return { kind, label: "Cinemeta", manifestUrl: CINEMETA_MANIFEST, root: rootFromManifest(url), configureUrl: null };
  }
  const url = safeUrl(source.manifestUrl);
  if (kind === "aiometadata") {
    if (!aiometadataHostAllowed(url.hostname) || !aiometadataPathAllowed(decodeURIComponent(url.pathname))) {
      throw new Error("Use a valid ElfHosted AIOMetadata manifest URL");
    }
    return {
      kind, label: "AIOMetadata", manifestUrl: url.href,
      root: rootFromManifest(url), configureUrl: `${url.origin}/configure/`
    };
  }
  if (kind === "custom") {
    if (!customHostAllowed(url.hostname, env)) throw new Error("This hosted instance does not allow that custom metadata host");
    return { kind, label: url.hostname, manifestUrl: url.href, root: rootFromManifest(url), configureUrl: null };
  }
  throw new Error("Unsupported metadata source");
}

export function publicSourceChoices(env = {}) {
  const choices = ["cinemeta", "aiometadata"];
  if (String(env.ENABLE_CUSTOM_UPSTREAM || "").toLowerCase() === "true") choices.push("custom");
  return choices;
}

export { CINEMETA_MANIFEST };