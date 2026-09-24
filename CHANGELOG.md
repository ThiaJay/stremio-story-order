# Changelog

## 1.0.10 - 2026-09-24

Story Mode watched-state safety hardening.

Production acceptance completed on 24 September 2026. The public Story Order hostname and the Cloudflare account hostname both served version 1.0.10 after deployment, and the deployed Worker bundle matched SHA-256 `487aa6f1806e2d89ebfaf45494a48c5944db7f96a246fa580cf07ab3c7b4766f`.

- Removes the unreachable episode-relocation path from the hosted Worker so production cannot be re-enabled accidentally by deleting an early return.
- Treats canonical season, episode and number coordinates as immutable while Stremio watched identity remains coupled to episode ordering.
- Rejects missing or duplicate stable video IDs as ambiguous rather than attempting an unsafe watched-order comparison.
- Keeps the ordering engine available for development while requiring fail-safe passthrough whenever watched identity or canonical coordinates would change.
- Adds regressions for same-order coordinate mutation, duplicate IDs and input immutability.
- Adds a source-level production gate proving the hosted Worker does not call the relocation engine.


## 1.0.9 - 2026-09-21

Private AIOMetadata compatibility and release hardening.

- Accepts current ElfHosted AIOMetadata manifest routes with one user or alias segment and an optional compressed configuration segment.
- Accepts the public AIOMetadata host and private AIOMetadata hosts on the supported ElfHosted regional domains.
- Keeps the allowlist AIOMetadata-specific and rejects lookalike domains, wrong app hosts, excessive route depth and encoded path separators.
- Adds cross-platform regressions for the expanded manifest contract and malformed route cases.
- Upgrades Wrangler to 4.135.0 and keeps high-severity dependency auditing plus Dependabot monitoring enabled.
- Adds live production verification so source and hosted Worker divergence fails visibly.


## 1.0.8 - 2026-09-19

Ancillary-special classification hardening.

- Treats explicit `Episode Insider` entries as non-story material.
- Treats titles of the form `Inside ... Season/Series N` as non-story material, covering behind-the-scenes season retrospectives without broadly rejecting narrative titles beginning with "Inside".
- Adds a Dead City-shaped regression proving full-length Insider/Inside-season extras are excluded while genuine narrative full-length specials remain eligible to the ordering engine.
- Keeps the hosted production path in watched-state-safe passthrough; no season/episode coordinates or watched identity order are changed.

## 1.0.7 - 2026-09-18

Emergency watched-state/autoplay safety release.

- Temporarily disables series episode relocation in the hosted Worker and returns upstream series video arrays unchanged.
- Adds a Stremio watched-bitfield identity-order invariant: changing video IDs' season/episode coordinates is treated as unsafe even when the set of IDs is unchanged.
- Adds Jonathan Creek and Doctor Who live regressions proving the wrapped video array and watched identity order remain identical to Cinemeta.
- Prevents specials relocation from changing watched/blur interpretation or native next-video/autoplay semantics while a native alternate-order representation is pursued.
- The ordering engine remains in source/tests for redesign work, but the production hosted path is fail-safe passthrough.

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