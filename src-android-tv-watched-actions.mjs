import stableStoryOrderVideos from "./src-android-contract-reference.mjs";

// Pure Android TV / Fire TV client integration reference. Does not contact Stremio.
function validMeta(meta, expectedMetaId) {
  if (!meta || meta.type !== "series" || typeof meta.id !== "string"
      || meta.id !== expectedMetaId || !Array.isArray(meta.videos) || meta.videos.length === 0) {
    return false;
  }
  const ids = meta.videos.map((video) => video?.id);
  return ids.every((id) => typeof id === "string" && id.length > 0)
      && new Set(ids).size === ids.length
      && meta.videos.every((video) => Number.isInteger(video.season) && video.season >= 0);
}

function released(video, when) {
  if (typeof video.released !== "string" || !/(?:Z|[+-]\d{2}:\d{2})$/.test(video.released)) {
    return false;
  }
  const instant = Date.parse(video.released);
  return Number.isFinite(instant) && instant <= when;
}

function storyMembers(meta) {
  const story = stableStoryOrderVideos(meta.videos, meta.behaviorHints);
  return story || meta.videos.filter((video) => video.season > 0);
}

// Prepare a remote-friendly, explicit confirmation rather than immediately mutating an account.
export function prepareTvWatchedAction({
  meta, expectedMetaId, metaReady, libraryReady, scope, season, isWatched, now
}) {
  if (metaReady !== true || libraryReady !== true
      || typeof isWatched !== "boolean" || !validMeta(meta, expectedMetaId)
      || typeof now !== "string" || !/(?:Z|[+-]\d{2}:\d{2})$/.test(now)) {
    return null;
  }
  const when = Date.parse(now);
  if (!Number.isFinite(when)) return null;

  let videos, payload;
  if (scope === "series" && season == null) {
    videos = storyMembers(meta).filter((video) => released(video, when));
    payload = { action: "MetaDetails", args: { action: "MarkAsWatched", args: isWatched } };
  } else if (scope === "season" && Number.isInteger(season) && season > 0) {
    videos = meta.videos.filter((video) => video.season === season);
    // The existing Core MarkSeasonAsWatched acts on every listed season video.
    // For a watched operation it must therefore be refused if ANY could be future/TBC.
    if (isWatched && !videos.every((video) => released(video, when))) return null;
    payload = {
      action: "MetaDetails",
      args: { action: "MarkSeasonAsWatched", args: [season, isWatched] }
    };
  } else {
    return null;
  }

  if (videos.length === 0) return null;
  const selectedIds = videos.map((video) => video.id).sort();
  const allMetadata = meta.videos.map((video) => [
    video.id, video.season, video.episode ?? null, video.released ?? null
  ]).sort((a, b) => a[0].localeCompare(b[0]));
  const fingerprint = JSON.stringify([
    meta.id, scope, season ?? null, isWatched, selectedIds, allMetadata
  ]);
  const label = (isWatched ? "Mark " : "Remove watched status from ")
    + videos.length + " episodes "
    + (scope === "season" ? "in season " + season : "in this series");

  return {
    fingerprint,
    confirmationLabel: label,
    selectedIds,
    requiresUnwatchAcknowledgement: !isWatched,
    action: payload
  };
}

// Only an explicit, focused remote activation after a fresh metadata recheck can dispatch.
// Arrow navigation, stale details, aborted confirmation and removed-watched without a
// separate acknowledgement must have zero effects.
export function confirmTvWatchedAction(prepared, liveInputs, confirmation) {
  if (!prepared || !confirmation || confirmation.focused !== true
      || !["DPAD_CENTER", "ENTER"].includes(confirmation.remoteKey)
      || confirmation.fingerprint !== prepared.fingerprint) {
    return null;
  }
  const fresh = prepareTvWatchedAction(liveInputs);
  if (!fresh || fresh.fingerprint !== prepared.fingerprint) return null;
  if (fresh.requiresUnwatchAcknowledgement
      && confirmation.unwatchAcknowledged !== true) return null;
  return fresh.action;
}
