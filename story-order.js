const SHORT_FORM = /\b(prequel|minisode|webisode|tardisode|extra|short|trailer|preview|recap|prologue|behind[ -]the[ -]scenes|after[ -]?show|bloopers?|outtakes?|deleted scenes?|table read|interview|panel)\b/i;
const NON_STORY = /\b(?:making of|best of|confidential|unleashed|commentary|documentary|concert|prom|reaction|retrospective|awards?|red carpet|episode insider)\b|\binside\b.{0,80}\b(?:season|series)\s*\d+\b/i;

export const DEFAULT_ORDER_OPTIONS = Object.freeze({
  fullLength: true,
  shortForm: "exclude",
  includeInsignificant: false,
  includeNonStory: false,
  providerRegularRepairs: true,
  upstreamFallback: true,
  minRuntimeRatio: 0.5,
  minFullLengthMinutes: 20,
  future: "leave"
});

export function normalizeTitle(value) {
  return String(value || "").toLowerCase().normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ").trim();
}

export function titleScore(a, b) {
  const left = normalizeTitle(a);
  const right = normalizeTitle(b);
  if (!left || !right) return 0;
  if (left === right) return 1;
  if (` ${left} `.includes(` ${right} `) || ` ${right} `.includes(` ${left} `)) return 0.9;
  const la = new Set(left.split(" "));
  const rb = new Set(right.split(" "));
  const common = [...la].filter(x => rb.has(x)).length;
  return common / new Set([...la, ...rb]).size;
}export function parseRuntimeMinutes(value) {
  if (Number.isFinite(Number(value))) return Number(value);
  const text = String(value || "").toLowerCase();
  const hours = Number(text.match(/(\d+(?:\.\d+)?)\s*h/)?.[1] || 0);
  const mins = Number(text.match(/(\d+)\s*(?:m|min)/)?.[1] || 0);
  return hours * 60 + mins || null;
}

export function timeOf(value) {
  if (!value) return NaN;
  const ms = Date.parse(value instanceof Date ? value.toISOString() : String(value));
  return Number.isFinite(ms) ? ms : NaN;
}

function videoTitle(video) {
  return video?.title || video?.name || "";
}

function videoTime(video) {
  return timeOf(video?.released || video?.firstAired || video?.airdate);
}

function median(values) {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
  return sorted.length ? sorted[Math.floor(sorted.length / 2)] : null;
}

function classifyTitle(title) {
  return { shortForm: SHORT_FORM.test(title || ""), nonStory: NON_STORY.test(title || "") };
}

function resolveOptions(input = {}) {
  return { ...DEFAULT_ORDER_OPTIONS, ...input };
}

function isFuture(item, nowMs, options) {
  if (options.future === "include") return false;
  if (item?.available === false) return true;
  const when = timeOf(item?.released || item?.firstAired || item?.airdate || item?.airstamp);
  return Number.isFinite(when) && when > nowMs + 6 * 3600_000;
}function regularRuntime(videos) {
  return median(videos.filter(v => Number(v.season) > 0).map(v => parseRuntimeMinutes(v.runtime)));
}

function fullLengthThreshold(videos, options) {
  const normal = regularRuntime(videos) || 30;
  return Math.max(Number(options.minFullLengthMinutes) || 20, normal * (Number(options.minRuntimeRatio) || 0.5));
}

export function upstreamFallbackCandidates(videos, orderOptions = {}, nowMs = Date.now()) {
  const options = resolveOptions(orderOptions);
  if (!options.upstreamFallback) return [];
  const threshold = fullLengthThreshold(videos, options);
  return videos.filter(video => {
    if (Number(video.season) !== 0 || isFuture(video, nowMs, options)) return false;
    const kind = classifyTitle(videoTitle(video));
    if (kind.nonStory && !options.includeNonStory) return false;
    if (kind.shortForm && options.shortForm === "exclude") return false;
    const runtime = parseRuntimeMinutes(video.runtime);
    if (!Number.isFinite(runtime) || runtime < threshold || !Number.isFinite(videoTime(video))) return false;
    return options.fullLength !== false;
  });
}

function providerCandidateAllowed(ep, videos, options, nowMs) {
  if (isFuture(ep, nowMs, options)) return false;
  const type = String(ep.type || "").toLowerCase();
  const titleKind = classifyTitle(ep.name);
  if (titleKind.nonStory && !options.includeNonStory) return false;

  if (type === "regular") return options.providerRegularRepairs === true && Number(ep.season) > 0;
  if (type === "insignificant_special" && !options.includeInsignificant) return false;
  if (type !== "significant_special" && type !== "insignificant_special") return false;

  const threshold = fullLengthThreshold(videos, options);
  const runtime = parseRuntimeMinutes(ep.runtime);
  const looksShort = titleKind.shortForm || (Number.isFinite(runtime) && runtime < threshold);
  if (!looksShort) return options.fullLength !== false;
  if (options.shortForm === "all") return true;
  return options.shortForm === "significant" && type === "significant_special";
}

function providerCandidates(episodes, videos, options, nowMs) {
  return (episodes || []).filter(ep => providerCandidateAllowed(ep, videos, options, nowMs));
}function dayDistance(a, b) {
  const left = timeOf(a);
  const right = timeOf(b);
  return Number.isFinite(left) && Number.isFinite(right) ? Math.abs(left - right) / 86400_000 : Infinity;
}

function runtimeCloseness(a, b) {
  const left = parseRuntimeMinutes(a);
  const right = parseRuntimeMinutes(b);
  if (!Number.isFinite(left) || !Number.isFinite(right)) return 0;
  const diff = Math.abs(left - right);
  const scale = Math.max(left, right, 1);
  if (diff <= 2) return 1;
  if (diff / scale <= 0.1) return 0.8;
  if (diff / scale <= 0.2) return 0.4;
  return 0;
}

function matchProviderEpisodes(episodes, seasonZero, videos, options, nowMs) {
  const candidates = providerCandidates(episodes, videos, options, nowMs);
  const used = new Set();
  const matches = [];
  for (const ep of candidates) {
    let best = null;
    for (const video of seasonZero) {
      if (used.has(video.id) || isFuture(video, nowMs, options)) continue;
      const distance = dayDistance(ep.airstamp || ep.airdate, video.released || video.firstAired || video.airdate);
      const title = titleScore(ep.name, videoTitle(video));
      const runtime = runtimeCloseness(ep.runtime, video.runtime);
      let score = title * 5 + runtime * 2;
      if (distance === 0) score += 6;
      else if (distance <= 1) score += 4;
      else if (distance <= 3) score += 1;
      const providerType = String(ep.type || "").toLowerCase();
      const videoKind = classifyTitle(videoTitle(video));
      if (providerType !== "regular") {
        const epKind = classifyTitle(ep.name);
        const effectiveRuntime = parseRuntimeMinutes(ep.runtime) ?? parseRuntimeMinutes(video.runtime);
        const effectiveShort = epKind.shortForm || videoKind.shortForm || (Number.isFinite(effectiveRuntime) && effectiveRuntime < fullLengthThreshold(videos, options));
        if (effectiveShort && options.shortForm === "exclude") continue;
        if (effectiveShort && options.shortForm === "significant" && providerType !== "significant_special") continue;
      }
      let acceptable;
      if (providerType === "regular") {
        if (videoKind.shortForm || videoKind.nonStory) continue;
        acceptable = (distance <= 1 && title >= 0.72) || (distance <= 3 && title >= 0.9) || (!Number.isFinite(distance) && title === 1 && runtime >= 0.8);
      } else {
        acceptable = (distance <= 3 && title >= 0.15) || (distance <= 31 && title >= 0.9) || (!Number.isFinite(distance) && title === 1 && runtime >= 0.8);
      }
      if (acceptable && (!best || score > best.score)) best = { ep, video, score, title, runtime, distance };
    }
    if (best) {
      used.add(best.video.id);
      matches.push(best);
    }
  }
  return matches;
}function regularGroups(videos) {
  const groups = new Map();
  videos.filter(v => Number(v.season) > 0).forEach((video, sourceIndex) => {
    const season = Number(video.season);
    if (!groups.has(season)) groups.set(season, []);
    groups.get(season).push({ ...video, __sourceIndex: sourceIndex });
  });
  for (const items of groups.values()) {
    items.sort((a, b) => Number(a.episode || a.number || 0) - Number(b.episode || b.number || 0));
  }
  return groups;
}

function providerRanks(episodes) {
  const regular = new Map();
  const other = new Map();
  (episodes || []).forEach((ep, index) => {
    if (String(ep.type || "").toLowerCase() === "regular" && ep.season != null && ep.number != null) {
      regular.set(`${Number(ep.season)}:${Number(ep.number)}`, index);
    }
    if (ep.id != null) other.set(ep.id, index);
  });
  return { regular, other };
}

function targetSeason(when, explicitSeason, groups) {
  const explicit = Number(explicitSeason);
  if (Number.isFinite(explicit) && groups.has(explicit)) return explicit;
  const seasons = [...groups.keys()].sort((a, b) => a - b);
  if (!seasons.length || !Number.isFinite(when)) return null;
  let choice = seasons[0];
  for (const season of seasons) {
    const dates = groups.get(season).map(videoTime).filter(Number.isFinite);
    const first = dates.length ? Math.min(...dates) : NaN;
    if (Number.isFinite(first) && when >= first) choice = season;
  }
  return choice;
}

function cleanInternal(video) {
  const copy = { ...video };
  for (const key of Object.keys(copy)) if (key.startsWith("__storyOrder")) delete copy[key];
  delete copy.__sourceIndex;
  return copy;
}function buildAccepted(videos, providerEpisodes, options, override, nowMs) {
  const seasonZero = videos.filter(v => Number(v.season) === 0);
  const providerMatches = matchProviderEpisodes(providerEpisodes || [], seasonZero, videos, options, nowMs);
  const acceptedById = new Map();

  for (const match of providerMatches) {
    acceptedById.set(match.video.id, {
      video: match.video,
      provider: match.ep,
      source: "provider",
      score: match.score,
      when: timeOf(match.ep.airstamp || match.ep.airdate) || videoTime(match.video),
      explicitSeason: match.ep.season
    });
  }

  for (const video of upstreamFallbackCandidates(videos, options, nowMs)) {
    if (acceptedById.has(video.id)) continue;
    acceptedById.set(video.id, {
      video, provider: null, source: "upstream-fallback", score: null,
      when: videoTime(video), explicitSeason: null
    });
  }

  const includeRules = Array.isArray(override?.include) ? override.include : [];
  for (const rule of includeRules) {
    const video = seasonZero.find(v => v.id === rule.id);
    if (!video || isFuture(video, nowMs, options)) continue;
    const current = acceptedById.get(video.id) || {
      video, provider: null, source: "manual-override", score: null,
      when: videoTime(video), explicitSeason: null
    };
    current.source = current.source === "provider" ? "provider+override" : "manual-override";
    current.manual = rule;
    if (rule.targetSeason) current.explicitSeason = rule.targetSeason;
    acceptedById.set(video.id, current);
  }

  const excluded = new Set(Array.isArray(override?.exclude) ? override.exclude : []);
  for (const id of excluded) acceptedById.delete(id);
  return [...acceptedById.values()];
}function targetSeasonForItem(item, videos, groups) {
  const anchorId = item.manual?.beforeId || item.manual?.afterId;
  if (anchorId) {
    const anchor = videos.find(v => v.id === anchorId);
    if (anchor && Number(anchor.season) > 0 && groups.has(Number(anchor.season))) return Number(anchor.season);
  }
  return targetSeason(item.when, item.explicitSeason, groups);
}

function applyManualPlacements(items, acceptedForSeason) {
  const rules = acceptedForSeason.filter(x => x.manual?.beforeId || x.manual?.afterId);
  for (const accepted of rules) {
    const from = items.findIndex(x => x.id === accepted.video.id);
    if (from < 0) continue;
    const [entry] = items.splice(from, 1);
    const anchorId = accepted.manual.beforeId || accepted.manual.afterId;
    const anchorIndex = items.findIndex(x => x.id === anchorId);
    if (anchorIndex < 0) {
      items.splice(from, 0, entry);
      continue;
    }
    const insertAt = accepted.manual.beforeId ? anchorIndex : anchorIndex + 1;
    items.splice(insertAt, 0, entry);
  }
  return items;
}

export function planStoryOrder(videos, providerEpisodes = [], config = {}) {
  if (!Array.isArray(videos) || !videos.length) {
    return { ids: [], inserted: [], mode: "unchanged" };
  }
  const options = resolveOptions(config.order || config);
  const override = config.override || {};
  const nowMs = Number.isFinite(config.nowMs) ? config.nowMs : Date.now();
  const groups = regularGroups(videos);
  const seasonZero = videos.filter(v => Number(v.season) === 0);
  if (!groups.size || !seasonZero.length) {
    return { ids: [], inserted: [], mode: "unchanged" };
  }

  const ranks = providerRanks(providerEpisodes);
  const candidates = buildAccepted(videos, providerEpisodes, options, override, nowMs);
  const accepted = [];
  for (const item of candidates) {
    if (!Number.isFinite(item.when) && !item.explicitSeason && !item.manual?.targetSeason && !item.manual?.beforeId && !item.manual?.afterId) continue;
    const season = targetSeasonForItem(item, videos, groups);
    if (!groups.has(season)) continue;
    accepted.push({ ...item, targetSeason: season });
  }
  if (!accepted.length) return { ids: [], inserted: [], mode: "unchanged" };

  const ids = [];
  const seasons = [...groups.keys()].sort((a, b) => a - b);
  for (const season of seasons) {
    const regularItems = groups.get(season).map(video => ({
      ...video,
      __storyOrderInserted: false,
      __storyOrderTime: videoTime(video),
      __storyOrderRank: ranks.regular.get(`${season}:${Number(video.episode || video.number)}`) ?? Infinity
    }));
    const acceptedForSeason = accepted.filter(x => x.targetSeason === season);
    const insertedItems = acceptedForSeason.map(item => ({
      ...item.video,
      __storyOrderInserted: true,
      __storyOrderTime: item.when,
      __storyOrderRank: item.provider?.id != null ? (ranks.other.get(item.provider.id) ?? Infinity) : Infinity,
      __storyOrderSource: item.source
    }));
    const items = [...regularItems, ...insertedItems];

    items.sort((a, b) => {
      if (Number.isFinite(a.__storyOrderTime) && Number.isFinite(b.__storyOrderTime) && a.__storyOrderTime !== b.__storyOrderTime) {
        return a.__storyOrderTime - b.__storyOrderTime;
      }
      if (Number.isFinite(a.__storyOrderRank) && Number.isFinite(b.__storyOrderRank) && a.__storyOrderRank !== b.__storyOrderRank) {
        return a.__storyOrderRank - b.__storyOrderRank;
      }
      if (a.__storyOrderInserted !== b.__storyOrderInserted) return a.__storyOrderInserted ? 1 : -1;
      return Number(a.__sourceIndex || 0) - Number(b.__sourceIndex || 0);
    });

    applyManualPlacements(items, acceptedForSeason);
    ids.push(...items.map(item => String(item.id)));
  }

  if (new Set(ids).size !== ids.length || ids.some(id => !id)) {
    return { ids: [], inserted: [], mode: "invalid-plan" };
  }

  const regularIds = videos.filter(video => Number(video.season) > 0).map(video => String(video.id));
  if (regularIds.some(id => !ids.includes(id))) {
    return { ids: [], inserted: [], mode: "invalid-plan" };
  }

  return {
    ids,
    mode: providerEpisodes?.length ? "provider+fallback" : "upstream-fallback",
    inserted: accepted.map(item => ({
      id: String(item.video.id),
      title: videoTitle(item.video),
      targetSeason: item.targetSeason,
      source: item.source,
      score: Number.isFinite(item.score) ? Number(item.score.toFixed(2)) : null,
      released: item.video.released || item.provider?.airstamp || item.provider?.airdate || null
    }))
  };
}

export function integrateStoryOrder(videos, providerEpisodes = [], config = {}) {
  if (!Array.isArray(videos) || !videos.length) return { videos, inserted: [], mode: "unchanged" };
  const options = resolveOptions(config.order || config);
  const override = config.override || {};
  const nowMs = Number.isFinite(config.nowMs) ? config.nowMs : Date.now();
  const groups = regularGroups(videos);
  const seasonZero = videos.filter(v => Number(v.season) === 0);
  if (!groups.size || !seasonZero.length) return { videos, inserted: [], mode: "unchanged" };

  const ranks = providerRanks(providerEpisodes);
  const candidates = buildAccepted(videos, providerEpisodes, options, override, nowMs);
  const accepted = [];
  for (const item of candidates) {
    if (!Number.isFinite(item.when) && !item.explicitSeason && !item.manual?.targetSeason && !item.manual?.beforeId && !item.manual?.afterId) continue;
    const season = targetSeasonForItem(item, videos, groups);
    if (!groups.has(season)) continue;
    accepted.push({ ...item, targetSeason: season });
  }
  if (!accepted.length) return { videos, inserted: [], mode: "unchanged" };
  const acceptedIds = new Set(accepted.map(x => x.video.id));
  const ordered = seasonZero.filter(v => !acceptedIds.has(v.id));
  const seasons = [...groups.keys()].sort((a, b) => a - b);

  for (const season of seasons) {
    const regularItems = groups.get(season).map(video => ({
      ...video,
      __storyOrderInserted: false,
      __storyOrderTime: videoTime(video),
      __storyOrderRank: ranks.regular.get(`${season}:${Number(video.episode || video.number)}`) ?? Infinity
    }));
    const acceptedForSeason = accepted.filter(x => x.targetSeason === season);
    const insertedItems = acceptedForSeason.map(item => ({
      ...item.video,
      season,
      __storyOrderInserted: true,
      __storyOrderTime: item.when,
      __storyOrderRank: item.provider?.id != null ? (ranks.other.get(item.provider.id) ?? Infinity) : Infinity,
      __storyOrderSource: item.source
    }));
    const items = [...regularItems, ...insertedItems];

    items.sort((a, b) => {
      if (Number.isFinite(a.__storyOrderTime) && Number.isFinite(b.__storyOrderTime) && a.__storyOrderTime !== b.__storyOrderTime) {
        return a.__storyOrderTime - b.__storyOrderTime;
      }
      if (Number.isFinite(a.__storyOrderRank) && Number.isFinite(b.__storyOrderRank) && a.__storyOrderRank !== b.__storyOrderRank) {
        return a.__storyOrderRank - b.__storyOrderRank;
      }
      if (a.__storyOrderInserted !== b.__storyOrderInserted) return a.__storyOrderInserted ? 1 : -1;
      return Number(a.__sourceIndex || 0) - Number(b.__sourceIndex || 0);
    });

    applyManualPlacements(items, acceptedForSeason);
    items.forEach((item, index) => {
      ordered.push(cleanInternal({
        ...item,
        season,
        episode: index + 1,
        number: index + 1,
        title: item.title || item.name || `Episode ${index + 1}`
      }));
    });
  }

  const other = videos.filter(video => {
    const season = Number(video.season);
    return season !== 0 && !(season > 0);
  });
  ordered.push(...other);
  const proposed = {
    videos: ordered,
    mode: providerEpisodes?.length ? "provider+fallback" : "upstream-fallback",
    inserted: accepted.map(item => ({
      id: item.video.id,
      title: videoTitle(item.video),
      targetSeason: item.targetSeason,
      source: item.source,
      score: Number.isFinite(item.score) ? Number(item.score.toFixed(2)) : null,
      released: item.video.released || item.provider?.airstamp || item.provider?.airdate || null
    }))
  };
  const watchedIdentitySafe = verifyWatchedIdentityOrder(videos, proposed.videos);
  const canonicalCoordinatesSafe = verifyCanonicalVideoCoordinatesInvariant(videos, proposed.videos);
  if (!watchedIdentitySafe || !canonicalCoordinatesSafe) {
    return {
      videos,
      mode: "watched-state-safe-passthrough",
      inserted: [],
      blocked: proposed.inserted,
      blockedReason: !watchedIdentitySafe
        ? "STREMIO_WATCHED_IDENTITY_ORDER_WOULD_CHANGE"
        : "STREMIO_CANONICAL_VIDEO_COORDINATES_WOULD_CHANGE"
    };
  }
  return proposed;
}

function stableVideoIds(videos) {
  return (videos || []).map(video => String(video?.id || ""));
}

export function verifyIdentityInvariant(before, after) {
  const left = stableVideoIds(before);
  const right = stableVideoIds(after);
  if (left.length !== right.length || left.some(id => !id) || right.some(id => !id)) return false;
  if (new Set(left).size !== left.length || new Set(right).size !== right.length) return false;
  const sortedLeft = [...left].sort();
  const sortedRight = [...right].sort();
  return sortedLeft.every((id, index) => id === sortedRight[index]);
}

function coordinateValue(value) {
  if (value == null || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : String(value);
}

function canonicalVideoCoordinates(video) {
  const nested = video?.seriesInfo || video?.series_info || {};
  return {
    season: coordinateValue(video?.season ?? nested?.season),
    episode: coordinateValue(video?.episode ?? nested?.episode),
    number: coordinateValue(video?.number)
  };
}

export function verifyCanonicalVideoCoordinatesInvariant(before, after) {
  if (!verifyIdentityInvariant(before, after)) return false;
  const expected = new Map((before || []).map(video => [String(video.id), canonicalVideoCoordinates(video)]));
  return (after || []).every(video => {
    const left = expected.get(String(video.id));
    const right = canonicalVideoCoordinates(video);
    return left &&
      left.season === right.season &&
      left.episode === right.episode &&
      left.number === right.number;
  });
}

export function watchedIdentityOrder(videos) {
  return [...(videos || [])]
    .map((video, sourceIndex) => ({video, sourceIndex}))
    .sort((a, b) => {
      const as = Number(a.video?.season ?? a.video?.seriesInfo?.season ?? a.video?.series_info?.season ?? -1);
      const bs = Number(b.video?.season ?? b.video?.seriesInfo?.season ?? b.video?.series_info?.season ?? -1);
      const ae = Number(a.video?.episode ?? a.video?.seriesInfo?.episode ?? a.video?.series_info?.episode ?? -1);
      const be = Number(b.video?.episode ?? b.video?.seriesInfo?.episode ?? b.video?.series_info?.episode ?? -1);
      const ar = timeOf(a.video?.released);
      const br = timeOf(b.video?.released);
      return as - bs || ae - be || ((Number.isFinite(ar) ? ar : -Infinity) - (Number.isFinite(br) ? br : -Infinity)) || a.sourceIndex - b.sourceIndex;
    })
    .map(({video}) => String(video?.id || ""));
}

export function verifyWatchedIdentityOrder(before, after) {
  if (!verifyIdentityInvariant(before, after)) return false;
  const left = watchedIdentityOrder(before);
  const right = watchedIdentityOrder(after);
  return left.length === right.length && left.every((id, index) => id === right[index]);
}

export function showOverrideFor(configOverrides, imdbId) {
  if (!imdbId || !configOverrides || typeof configOverrides !== "object") return {};
  return configOverrides[imdbId] || {};
}