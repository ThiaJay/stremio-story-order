# Android client integration

Story Order already publishes a watched identity safe presentation sequence through an additive metadata hint.

Android mobile and Android TV or Fire TV clients can consume that hint without changing canonical episode identity.

## Metadata contract

A valid series may contain

```json
{
  "behaviorHints": {
    "storyOrderVersion": 1,
    "storyOrder": [
      "tt1234567:1:1",
      "tt1234567:0:2",
      "tt1234567:1:2"
    ]
  }
}
```

The IDs are stable canonical video IDs.

The client must not rewrite season, episode, number or video ID.

## Validation

A Story Order view may be shown only when all of these are true.

1. `storyOrderVersion` is exactly `1`.
2. `storyOrder` is a non empty array.
3. Every listed ID exists in the canonical video array.
4. No ID is repeated.
5. Every canonical regular episode with season greater than zero is represented.

If any check fails, use the ordinary canonical season view.

Season 0 entries omitted from `storyOrder` remain available through the ordinary metadata view and are not required story progression.

## Reference implementation

```js
function stableStoryOrderVideos(videos, behaviorHints) {
  if (!Array.isArray(videos) || videos.length === 0) return null;
  if (Number(behaviorHints?.storyOrderVersion) !== 1) return null;
  if (!Array.isArray(behaviorHints?.storyOrder) || behaviorHints.storyOrder.length === 0) return null;

  const byId = new Map(videos.map(video => [String(video?.id || ""), video]));
  if (byId.size !== videos.length || byId.has("")) return null;

  const seen = new Set();
  const ordered = [];

  for (const rawId of behaviorHints.storyOrder) {
    const id = String(rawId || "");
    if (!id || seen.has(id) || !byId.has(id)) return null;
    seen.add(id);
    ordered.push(byId.get(id));
  }

  const regularIds = videos
    .filter(video => Number(video?.season) > 0)
    .map(video => String(video.id));

  if (regularIds.some(id => !seen.has(id))) return null;
  return ordered;
}
```

This is presentation only. Watched state remains attached to canonical identity.

## Title level watched actions

The Core reference is implemented in ThiaJay/stremio-core PR 37.

For a series, wait until MetaDetails has complete episode metadata and dispatch

```json
{
  "action": "MetaDetails",
  "args": {
    "action": "MarkAsWatched",
    "args": true
  }
}
```

Use `false` for Mark all released unwatched.

Do not use a LibraryItem only title mutation for a series. Core intentionally fails closed when the canonical episode list is unavailable.

## Android mobile

Expose an optional Story Order view on the series details page when the hint validates.

Expose Mark all released episodes watched and Mark all released episodes unwatched in the title action menu.

If the action starts from Library or Continue Watching before MetaDetails is ready, navigate to details, wait for ready metadata and dispatch once.

## Android TV and Fire TV

The same semantics apply.

The Story Order selector and title watched actions must be reachable by remote focus.

Enter or centre select must activate them.

Malformed or unsupported hints must fall back to ordinary canonical presentation.

Next Episode and autoplay must preserve stable video identity.

## Acceptance

The public regression fixture is `docs/android-story-order.fixture.json`.

The root test `test-android-contract.mjs` proves

1. narrative Season 0 insertion without canonical mutation
2. ancillary Season 0 exclusion from Story Order view
3. fail closed duplicate IDs
4. fail closed unknown IDs
5. fail closed missing regular episodes
6. unsupported version fallback
7. exact title watched action payloads
8. deferred series title actions until MetaDetails is ready

Private Android client acceptance still needs device coverage for remote focus, autoplay, Continue Watching and cross device account state.
