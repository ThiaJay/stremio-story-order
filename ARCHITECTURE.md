# Architecture

## Request path

```text
Stremio
  -> Story Order configured manifest/catalog/meta endpoint
      -> selected metadata source (Cinemeta / AIOMetadata / allowlisted custom)
      -> ordering enrichment (TVmaze, cached when available)
      -> deterministic Story Order engine
  -> unchanged video IDs
  -> any installed stream addons resolve those IDs
```

Story Order operates before stream discovery. It does not proxy Torrentio, AIOStreams, Maelstrom or Real-Debrid traffic.

## Source adapters

`source-registry.js` resolves a user configuration into a constrained upstream source. Cinemeta is built in. AIOMetadata URLs are validated against the expected ElfHosted hostname/path shape. Custom sources require an operator allowlist.

`upstream.js` performs bounded, redirect-free metadata requests and optional privacy-scoped cache/fallback handling.

## Ordering provider

`provider.js` retrieves TVmaze show/episode data using IMDb or TVDB identifiers when available. Public enrichment can be served from fresh or stale cache. Provider failure is non-fatal.

## Ordering engine

`story-order.js` never invents a video ID. It considers existing Season 0 videos as repair candidates and can classify them through:

- provider-confirmed significant specials;
- provider-confirmed regular episodes that the upstream source misclassified;
- conservative full-length upstream-only fallback inference;
- explicit per-series user overrides.

Accepted entries are assigned to a season using an explicit provider/manual season when reliable, otherwise chronology. Display episode numbers are regenerated while original video IDs remain unchanged.
## Confidence model

Safe mode treats a normal-episode repair as higher risk than a special-to-special match. A Season 0 extra whose title merely contains a regular episode title is not sufficient. Explicit ancillary labels such as `Episode Insider`, panels, behind-the-scenes material and `Inside ... Season/Series N` retrospectives are classified as non-story by default. Regular repair also requires close chronology and rejects known extra/prequel/minisode labels.

Provider-special matching tolerates small date differences and title formatting differences. Runtime is cross-checked against both provider and upstream values when available.

Upstream-only fallback requires a released date, a sufficiently long runtime relative to the show's normal episodes and a title that does not look like short-form/non-story material.

## Manual ordering

Manual rules can force an existing Season 0 ID into a target season or position it before/after another existing ID. An exclusion rule leaves a candidate in Season 0 even if automatic logic would insert it.

Manual rules cannot synthesize missing media. This keeps stream-resolution semantics stable.

## Failure hierarchy

1. live metadata + live ordering enrichment;
2. live metadata + cached ordering enrichment;
3. live metadata + upstream-only ordering inference;
4. stale safe movie/series metadata + cached/inferred ordering;
5. Cinemeta movie/series fallback for IMDb IDs when a non-Cinemeta metadata source is unavailable;
6. explicit failure when no safe source exists.

At every stage the video-ID identity invariant remains mandatory.