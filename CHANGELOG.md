# Changelog

## Interface refinement - 2026-09-25

Breaking Bad example and cinematic interface refinement.

- Replaces the Doctor Who preview with Breaking Bad.
- Adds a more distinctive Story Order visual language to cards, selected profiles, the setup journey and narrative preview.
- Preserves the roomy layout and all existing functionality.

## 1.0.18 - 2026-09-25

Direct panoramic hero repair.

Production acceptance completed on 25 September 2026. The live Worker bundle matched SHA-256 `9d1cc00b5113c791f394c121fea9252b709387348e980da80ba551e97384ed70` and the public manifest reported 1.0.18.

- Publishes the exact 1000 by 375 panoramic Story Order artwork generated from the approved cinematic master.
- Serves the hero directly as WebP instead of relying on an SVG embedded image path.
- Locks the hero to 28,482 bytes and Git blob `cddde00199bc6f2a26a0903d01d2564856e896e9` so degraded substitutes fail CI.
- Keeps the legacy hero SVG paths as lightweight compatibility wrappers pointing to the canonical WebP.
- Retains the spacious 1.0.17 configure layout and all Story Order ordering behaviour unchanged.


## 1.0.17 - 2026-09-25

Panoramic Story Order presentation refresh.

Production acceptance completed on 25 September 2026. The live Worker bundle matched SHA-256 `9cd46ad021984f72769bc740fa1e46e170954c2537fab68550ac644172d7cd1b` and the public manifest reported 1.0.17.

- Replaces the cropped configure hero with the approved panoramic artwork showing unordered episode and special cards becoming one coherent narrative sequence.\n- Stores the approved panorama in the SVG compatibility asset itself so the release cannot silently substitute an undersized WebP derivative.
- Keeps the legacy `story-order-order-flow.svg` URL as a compatibility wrapper for the new cinematic WebP hero.
- Widens the configure page, turns the duplicated four-card setup row into a concise three-step journey and gives each configuration step its own spacious card.
- Changes the profile grid from four compressed columns to a readable two-by-two layout.
- Simplifies the right-hand preview and trust rail while retaining service status, privacy and stable-ID safety messaging.
- Preserves the approved compact addon icon and all Story Order ordering behaviour.


## 1.0.16 - 2026-09-24

Reconciled branding and integrity release.

Production acceptance completed on 24 September 2026. The live Worker bundle matched SHA-256 `1769bb461ccf0bc14055d076be0565d6d42bbbdee4329404be15e0a4f51a6db6` and the public manifest reported 1.0.16.

- Carries forward explainable Story Order decision diagnostics and the approved cinematic branding.
- Replaces the incorrect file-size heuristic for the compact 320x320 logo with an exact Git blob integrity check for approved master `92068e099691bae94f1b1636c7ad8b3a5d012bc8`.
- Keeps PNG signature and 320x320 dimension checks in addition to exact byte identity.
- Cache-busts the approved icon and hero URLs to the 1.0.16 release.
- Extends live smoke to verify decision reason and confidence diagnostics.
- Includes the public Android client contract and the disabled-by-default cross-title reference contract.
- Does not change Story Order acceptance thresholds, canonical videos or watched identity.

## 1.0.15 - 2026-09-24

Explainable Story Order decisions and brand asset restoration.

- Adds a compact confidence class and stable reason to each inserted-item diagnostic.
- Distinguishes provider regular episode repairs, significant and insignificant specials, upstream date/runtime inference and manual overrides.
- Manual overrides remain explicitly identified rather than being presented as automatic confidence.
- Provider confidence uses the existing matching evidence and score without changing acceptance thresholds.
- Diagnostic explanations do not alter the published stable-ID storyOrder sequence, canonical videos or watched identity.
- Restores the approved cinematic addon icon after a degraded derivative was published.
- Replaces the superseded schematic metadata-flow hero with the approved cinematic Story Order journey artwork.
- Cache busts public branding URLs and adds image integrity gates so placeholder or undersized release assets fail tests.

## 1.0.14 - 2026-09-24

Guarded per-series override helper.

Production acceptance completed on 24 September 2026. The live Worker bundle matched SHA-256 `d9a646227ba34547279d25040452db7ad81e49ceb00af4d36628f9a63c4ac414` and the public manifest reported 1.0.14.

- Adds a form-based helper for Include and Exclude rules so users do not need to hand-write override JSON.
- Validates the series IMDb ID and stable video ID input before changing the generated configuration.
- Supports optional target season and before or after stable-ID anchors for include rules.
- Rejects conflicting before and after anchors and invalid target seasons.
- Deduplicates repeated exclusions and identical inclusion rules.
- Keeps the generated advanced JSON visible and editable before installation.
- Stores only the same existing override structure inside the encrypted configuration token.
- Preserves the 1.0.13 Story Order identity and configure page refresh.
- Does not fetch account data, watched state or private catalogue contents and does not change Story Order matching semantics.

## 1.0.13 - 2026-09-24

Story Order identity and configure page refresh.

- Rebuilds the configure page around what Story Order actually does, turning mixed episode metadata into one clear narrative path.
- Adds a scalable vector hero, favicon, setup icons, profile icons and trust icons using the new cyan, blue and gold Story Order visual system.
- Refreshes the canonical Stremio addon icon while preserving the existing public asset URL and alias byte equality.
- Adds the supporting brand line "Correct order. Complete stories." without replacing the functional public description.
- Preserves the existing live capability status and corrects stale Story Mode wording to Story Order.


## 1.0.12 - 2026-09-24

Privacy-safe Story Order capability status.

Production acceptance completed on 24 September 2026. The live Worker bundle matched SHA-256 `cd0e1d8b2e9170b0aa1b73fcece2253f4b27e76680e69f1ead317a8a98960df1` and the public manifest reported 1.0.12.

- Adds `/_story/status.json` with the live Story Order version and versioned stable-ID presentation contract.
- Explicitly reports that canonical video IDs and season/episode coordinates are preserved and that the service does not mutate watched identity.
- Adds a compact live status card to the configuration page.
- Exposes no Stremio AuthKey, account state, catalogue contents, title history or user configuration.
- Keeps the endpoint cache short and supports HEAD consistently with the rest of the hosted service.
- Adds deterministic endpoint, privacy and configuration-page regression coverage.
- Does not change Story Order classification, planning, metadata source behaviour or canonical video arrays.

## 1.0.11 - 2026-09-24

Stable-ID Story Order presentation contract.

Production acceptance completed on 24 September 2026. The live Worker bundle matched SHA-256 `137c59b2112bb181e2bc9cda0234dc1cffbf1b3a5af7c0ed0bc94120d2a83c06`, the public manifest reported 1.0.11 and the live stable-ID safety integration suite passed.

- Publishes an additive `behaviorHints.storyOrder` list of stable video IDs with `storyOrderVersion: 1` when a meaningful narrative ordering is available.
- Keeps the canonical upstream video array, video IDs and season/episode coordinates unchanged.
- Excludes ancillary Season 0 material from the narrative sequence unless it independently qualifies as story material.
- Preserves all ordinary regular episodes in the story sequence and fails closed on duplicate or incomplete plans.
- Expands deterministic coverage for Christmas specials, short-form profile boundaries, misclassified regular episodes, future entries, manual placement and post-series feature-length episodes.
- Keeps legacy clients safe because unknown behavior hints are additive and optional.


## 1.0.10 - 2026-09-24

Story Order watched-state safety hardening.

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