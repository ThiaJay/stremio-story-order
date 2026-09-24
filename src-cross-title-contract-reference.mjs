const SUPPORTED_TYPES = new Set(["movie","series"]);

export default function validateCrossTitleStoryReferences(videos, behaviorHints) {
  if (!Array.isArray(videos) || videos.length === 0) return null;
  if (Number(behaviorHints?.storyReferencesVersion) !== 1) return null;
  if (!Array.isArray(behaviorHints?.storyReferences) || behaviorHints.storyReferences.length === 0) return null;

  const parentIds = new Set(videos.map(video => String(video?.id || "")));
  if (parentIds.has("") || parentIds.size !== videos.length) return null;

  const seen = new Set();
  const refs = [];

  for (const raw of behaviorHints.storyReferences) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
    const type = String(raw.type || "").trim();
    const metaId = String(raw.metaId || "").trim();
    const videoId = raw.videoId == null ? null : String(raw.videoId).trim();
    const beforeId = raw.beforeId == null ? "" : String(raw.beforeId).trim();
    const afterId = raw.afterId == null ? "" : String(raw.afterId).trim();
    const label = raw.label == null ? null : String(raw.label).trim();

    if (!SUPPORTED_TYPES.has(type) || !metaId) return null;
    if (videoId != null && !videoId) return null;
    if ((beforeId ? 1 : 0) + (afterId ? 1 : 0) !== 1) return null;

    const anchorId = beforeId || afterId;
    if (!parentIds.has(anchorId)) return null;

    const placement = beforeId ? "before" : "after";
    const key = [type, metaId, videoId || "", placement, anchorId].join("|");
    if (seen.has(key)) return null;
    seen.add(key);

    refs.push({
      type,
      metaId,
      videoId,
      placement,
      anchorId,
      label
    });
  }

  return refs;
}

export function crossTitlePlaybackRequest(reference) {
  if (!reference || !SUPPORTED_TYPES.has(reference.type) || !reference.metaId) return null;
  return {
    type: reference.type,
    metaId: reference.metaId,
    videoId: reference.videoId || null
  };
}
