# Changelog

## 1.0.33 - 2026-09-25

Fixed geometry alignment.

- Replaces text-character setup arrows with drawn CSS chevrons so their position is independent of font baselines.
- Uses fixed 68 pixel setup rows with number badges, copy and icons sharing the same geometric centre.
- Aligns profile radio selectors to the centre of their profile icons instead of the top padding of the card.
- Locks section numbers, sequence numbers and comparison arrows to fixed centred geometry.
- Keeps the cinematic Breaking Bad rail and continuous hero unchanged.
- Leaves ordering logic, canonical IDs, privacy and stream addon independence unchanged.

## 1.0.32 - 2026-09-25

Alignment lock.

- Removes the manual one pixel numeral shift introduced in 1.0.31.
- Centres complete number, icon and text boxes instead of nudging individual glyphs.
- Locks setup badges, section numbers, profile icons, sequence numbers and directional arrows to explicit centre alignment.
- Keeps the accepted cinematic narrative-path background in the Breaking Bad example rail unchanged.
- Keeps the continuous 1114 by 305 hero unchanged.
- Leaves ordering logic, canonical IDs, privacy and stream addon independence unchanged.

## 1.0.31 - 2026-09-25

Visual alignment and cinematic example rail.

- Applies the approved optical-centre treatment across setup badges, section numbers and profile icon frames.
- Wraps setup and section numerals so their glyphs can be optically centred rather than relying on font baseline placement.
- Gives the Breaking Bad example rail its own Story Order narrative-path artwork with a glowing route, story nodes and framed silhouettes instead of the generic gradient background.
- Keeps the continuous 1114 by 305 hero, single campervan and full composition from 1.0.30 unchanged.
- Keeps the plain Breaking Bad identification and does not reproduce the programme's periodic-table title treatment.
- Leaves ordering logic, canonical IDs, privacy and stream addon independence unchanged.

## 1.0.30 - 2026-09-25

Continuous hero and optical alignment correction.

- Retires the stitched live hero that could create a visually impossible double-ended campervan across tile joins.
- Publishes one continuous approved 1114 by 305 WebP hero with a single campervan and the complete composition visible.
- Renders the hero at its native ratio with contain framing so none of the signed-off artwork is deliberately cropped.
- Rebuilds the setup strip alignment around fixed 36 pixel icon frames and a centred database source symbol so number badges, copy and icons share one optical centre.
- Centres the numbered section headings vertically as well.
- Keeps the plain Breaking Bad identification in the example rail and does not reproduce the programme's periodic-table title treatment.
- Leaves ordering logic, canonical IDs, privacy and stream addon independence unchanged.

## 1.0.29 - 2026-09-25

Atomic hero rendering and full-composition framing.

- Stops rendering the desktop hero through an SVG containing five independently decoded WebP images.
- Preloads the five repaired hero tiles directly and reveals them only after every tile has loaded and decoded, preventing the intermittent black final section seen in Chromium.
- Uses the artwork's native 1000 by 375 aspect ratio on desktop instead of object-fit cover, so the complete composition is shown rather than cropping its top and bottom.
- Removes the duplicate live episode-card overlay from the hero while retaining the crisp Story Order copy and plain Breaking Bad identification.
- Keeps a lower-detail fallback behind the tiles until the complete hero is ready.
- Leaves ordering logic, canonical IDs, privacy and stream addon independence unchanged.

## 1.0.28 - 2026-09-25

Production UI rebuild and hero integrity repair.

- Reframes the live hero for the actual wide container rather than forcing a 1000 by 375 composition into a much wider box.
- Keeps the cinematic artwork as atmosphere while rendering the Story Order title, badges, programme label and Granite State to Felina to El Camino sequence as crisp live HTML.
- Repairs the fifth WebP source tile by removing 389 trailing corrupt bytes and adds RIFF length integrity checks so a malformed hero asset cannot silently ship again.
- Rebuilds the three-step setup strip as one clean component with consistent icons and directional cues instead of competing divider lines.
- Refines source and profile cards, spacing, selected states and the Breaking Bad example rail to match the approved production mockup.
- Keeps the safer plain Breaking Bad identification and does not reproduce the programme's periodic-table title treatment.
- Leaves ordering logic, canonical IDs, privacy and stream addon independence unchanged.

## 1.0.27 - 2026-09-25

Hero reliability and setup strip cleanup.

- Replaces five separate browser hero image requests with one self-contained SVG master that embeds all five verified Breaking Bad journey tiles.
- Prevents a missing fifth request from leaving the right side of the cinematic hero blank.
- Simplifies the three-step setup strip by removing the stray connector rule and inconsistent internal divider treatment.
- Keeps the safer plain Breaking Bad example label introduced in 1.0.26.
- Leaves ordering logic, canonical IDs, privacy and stream addon independence unchanged.

## 1.0.26 - 2026-09-25

Safer programme example branding.

- Replaces the periodic-table style Breaking Bad title treatment in the example card with a plain Story Order branded series label.
- Keeps the Breaking Bad narrative example and Granite State to Felina to El Camino sequence unchanged.
- Adds regression checks preventing the previous Br and Ba tile treatment from returning.
- Leaves the approved cinematic hero, ordering logic, canonical IDs, privacy and stream addon independence unchanged.

## 1.0.25 - 2026-09-25

Canonical icon centring consistency.

- Removes the page-only three pixel left shift now that the canonical 320 by 320 Story Order icon is already optically centred.
- Applies the equivalent optical centring to the scalable Story Order glyph so the favicon and vector surfaces match the PNG master.
- Locks both behaviours in deterministic and live smoke tests.
- Reconciles public release metadata and the package lock root version with the actual release.
- Leaves the approved Breaking Bad journey hero, ordering logic, stable episode IDs, privacy and stream addon independence unchanged.

## 1.0.24 - 2026-09-25

Approved hero delivery hardening.

- Publishes the signed-off Breaking Bad caravan journey as five seamless verified WebP tiles, avoiding the repository transfer truncation that blocked the full single-file master.
- Reassembles the five tiles into the full cinematic 1000 by 375 hero in the browser with no visible gaps.
- Keeps the connected three-stage setup journey and the visible Breaking Bad before-and-after Felina to El Camino explanation.
- Leaves ordering logic, stable episode IDs, privacy and stream-addon independence unchanged.

## 1.0.23 - 2026-09-25

Approved Breaking Bad cinematic concept.

- Replaces the remaining generic panorama with the approved Breaking Bad journey artwork from the signed-off mockup, including the viewer, cast-led portal, corrected sequence path and desert caravan destination.
- Converts the three setup cards into a connected journey strip rather than three disconnected generic panels.
- Fixes the Breaking Bad explanation panel stacking so its before-and-after Felina to El Camino sequence is visible immediately.
- Keeps the stable episode-ID contract, existing stream-addon independence and privacy behaviour unchanged.

## 1.0.22 - 2026-09-25

Approved cinematic concept implementation.

- Replaces the generic hero with the Breaking Bad narrative journey artwork showing misplaced story items resolving into S05E15, Felina and El Camino on the path to the desert caravan.
- Compresses the three setup stages into a deliberate journey strip instead of three oversized generic cards.
- Pulls the Breaking Bad explanation up into a compact, visible right rail with a clear before and Story Order comparison.
- Reduces generic dashboard styling, tightens the information hierarchy and gives the cinematic artwork more visual authority.
- Keeps the stable-ID contract, existing stream addon independence and the validated Story Order behaviour unchanged.

## 1.0.21 - 2026-09-25

Breaking Bad narrative journey and centred emblem.

- Replaces the generic narrative example with a clear Breaking Bad sequence showing Granite State, Felina and El Camino in the intended story order.
- Makes the right rail explicitly compare a misplaced follow-on with the corrected Story Order path.
- Strengthens the page identity with a connected journey treatment, cinematic section spine and Breaking Bad themed example panel.
- Optically centres the Story Order portal in the live page containers while retaining the last byte-verified canonical icon master.
- Keeps the caravan journey hero, viewer-led story concept, existing stream addon independence and stable-ID safety contract.

## 1.0.20 - 2026-09-25

Full concept page implementation.

- Implements the approved cinematic mockup more completely with a branded navigation bar, three large setup stages, stronger installation emphasis and a more editorial Story Order page rhythm.
- Keeps Breaking Bad as the narrative example while preserving Story Order owned hero artwork rather than depending on third party promotional artwork.
- Preserves the spacious responsive layout, accessibility, existing configuration behaviour and stable episode identity contract.

## 1.0.19 - 2026-09-25

Optically centred Story Order emblem.

- Corrects the canonical play portal artwork being visually biased to the right inside its square.
- Translates the existing artwork left without redesigning or restyling it.
- Publishes the same corrected bytes to the canonical logo, app icon alias and v3 icon.
- Cache busts public branding references and locks the corrected icon by Git blob hash.
- Carries forward the Breaking Bad example and cinematic interface refinement.

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