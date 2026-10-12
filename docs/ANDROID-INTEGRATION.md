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

For both manual Next Episode and autoplay, resolve the continuation from the current stable video ID against the validated Story Order sequence. Use the original canonical video object returned by that mapping. If the current ID is absent from Story Order, the hint is invalid or there is no later Story Order item, fail closed and leave the existing continuation logic unchanged.

The public reference exports `nextStoryVideo(videos, behaviorHints, currentVideoId)` for this identity mapping. It does not decide whether a source is directly playable and it must not bypass the player's existing continuation, readiness or failure gates.

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
9. manual Next Episode and autoplay continuation by stable Story Order video ID
10. fail closed continuation for ancillary, unknown, terminal or malformed Story Order state

Private Android client acceptance still needs device coverage for remote focus, autoplay, Continue Watching and cross device account state.

## TV bulk watched controls and account safety

The public pure reference `src-android-tv-watched-actions.mjs` provides exact Core
action payloads and a separate remote confirmation stage. The companion
`test-android-tv-watched-actions.mjs` tests them using only synthetic metadata.

**Series action** `MetaDetails.MarkAsWatched(true|false)` requires a matching
loaded `MetaDetails` identity and watched state, never a preview-only library
item. Core selects currently released story videos and excludes future/TBC
episodes and non-story Season 0 material.

**Season action** `MetaDetails.MarkSeasonAsWatched([season, true|false])` uses
the canonical integer season number from the ordinary season view, not Story
Order display position. The existing Core season action applies to *every*
listed episode in that season. Until Core has a released-only season mutation,
the reference **refuses Mark Season Watched** when even one listed episode is
unreleased or its release date is unknown. Existing released seasons can
produce a confirmed payload. The existing Core action can also mark released
episodes in a series independently of season view. Explicit season zero
operations require separate design and are not issued by this reference.

Controls remain inactive unless metadata and LibraryItem readiness are both
confirmed and the exact media ID matches. The client must provide a freshly
computed SHA-256 fingerprint of the authenticated account identity and of the
complete relevant LibraryItem watched/resume record. Both must be refreshed
at confirmation time. The reference refuses missing or changed fingerprints;
these values are not credentials and must not be logged or embedded in a
public release. A selected TV remote action is
prepared as an explicit scope/count confirmation. Only focused Enter or D-pad
centre activation with a fresh metadata fingerprint dispatches it. Removing
watched status requires a separate affirmative acknowledgement. Merely moving
focus, opening the menu, a stale snapshot or changing the selected series does
not dispatch any action.

The reference has **no account credentials, network calls, player commands or
production Stremio installation effects**. It is not a running Android client,
an APK, a patch to the signed official `com.stremio.one` application or proof
of TV remote acceptance. The official Android UI remains outside the
repositories that this project controls. Adoption requires the maintainer to
bind these actions to a focusable native menu, apply the current Core and
verify real device behaviour. The private Foundation tracker remains
`ThiaJay/stremio-development-foundation#31`.

Routine production account playback testing is prohibited unless the native
account safety requirements in Foundation draft PR 66 are satisfied. Account
writes resulting from a user's deliberate bulk watched choice require an
accurate scope confirmation and must not be conflated with test playback.
