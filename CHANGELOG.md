# Changelog

## 1.0.6 - 2026-09-18

Dependability and transport-hardening update.

- Safely follows Cinemeta's current catalogue redirect only to the exact expected HTTPS catalogue host/path; arbitrary redirects remain blocked.
- Safely follows TVmaze's IMDb lookup redirect only to the exact same-service numeric show target.
- Bounds TVmaze JSON responses and rejects unexpected content types/oversized bodies.
- Makes HEAD responses execute the same validated resource path as GET while returning no body.
- Adds live coverage for redirected Cinemeta catalogues and HEAD semantics.
- Expands CI to Linux, Windows and macOS with dependency audit on every platform.
- No stream/debrid ownership, account access or watched-state behaviour is introduced.

## 1.0.5 - 2026-09-18

stremio-addons.net ownership-claim update.

- Added the public `stremioAddonsConfig` ownership proof requested by stremio-addons.net.
- Allows the Story Order listing to be claimed by the submitting developer account without exposing Stremio credentials.
- No episode-ordering, privacy or stream-addon behaviour changed.

## 1.0.4 — 2026-09-17

Display-encoding hardening update.

- Removed fragile decorative Unicode characters from the configure-page source.
- Replaced text glyphs with CSS-drawn icons and ASCII-safe copy.
- Added a regression test that prevents non-ASCII UI glyphs and mojibake from returning.
- No episode-ordering or stream-addon behaviour changed.

## 1.0.3 — 2026-09-17

Public hostname migration and release hygiene update.

- Moved the hosted addon to the branded `storyorder.workers.dev` account subdomain.
- Updated public install/configuration links to `stremio-story-order.storyorder.workers.dev`.
- Kept production Cloudflare resource IDs out of the public repository.
- No ordering, privacy or stream-addon behaviour changed.

## 1.0.2 — 2026-09-17

Usability/documentation update.

- Added a plain-English five-step installation path for ordinary Stremio users.
- Added clear instructions for existing AIOMetadata/metadata-addon users.
- Clarified that stream addons stay installed and do not need reconfiguration.
- Explained what happens after installation and when addon ordering matters.

## 1.0.1 — 2026-09-17

Branding and clarity update.

- Clearer description: Story Order fixes TV episode order and places specials, feature-length one-offs and other misplaced episodes into the proper autoplay sequence.
- New film/play Story Order logo designed to remain recognisable at small Stremio addon sizes.
- Refreshed matching background artwork and README branding.
- Configure page now explains the addon in plain language and makes its independence from stream addons explicit.

## 1.0.0 — 2026-09-17

First community release.

- Provider-neutral Story Order overlay with standalone Cinemeta and AIOMetadata modes.
- Safe, Balanced, Complete and Custom ordering profiles.
- Full-length specials, post-series one-offs and high-confidence Season-0 misclassification repairs.
- Optional provider-confirmed short-form sequencing and per-series manual overrides.
- Original video-ID preservation with fail-safe identity verification.
- TVmaze enrichment with stale-cache and upstream-only fallback behaviour.
- Metadata-source outage recovery with privacy-scoped caching and Cinemeta fallback for IMDb movie/series metadata.
- Stateless AES-GCM configuration URLs with no Stremio AuthKey requirement.
- SSRF controls, response-size limits, redirect refusal and privacy-conscious cache policy.
- Public configuration page, self-host template and automated adversarial test suites.