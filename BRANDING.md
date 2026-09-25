# Story Order branding

The public graphics are stored in the repository so the configure page, Stremio surfaces, contributors and community posts can use the same identity.

## Core identity

**Story Order**

*Puts TV episodes, specials and one-offs in the right watch order.*

Supporting brand line

**Correct order. Complete stories.**

The supporting line reinforces the visual identity. It does not replace the functional description above.

## Canonical public assets

- `public/logo.png` is the compact Stremio addon icon.
- `public/background.jpg` is the Stremio background artwork.
- `public/branding/app-icon.png` must remain byte-identical to `public/logo.png`.
- `public/branding/marketplace-background.jpg` must remain byte-identical to `public/background.jpg`.
- `public/branding/story-order-social-preview.jpg` is the raster social sharing artwork.

## Configure page assets

The `public/branding/v2` directory contains compact vector interface symbols and the favicon. The former schematic hero path remains only as a compatibility alias.

The primary configure hero is `public/branding/v3/story-order-hero.svg`. It embeds the approved panoramic Story Order master showing unordered episode and special cards flowing through the Story Order portal into one coherent narrative sequence. It must not be replaced by a cropped portal-only image, schematic or placeholder diagram.

- `story-order-glyph.svg` is the compact vector favicon.
- `public/logo.png`, `public/branding/app-icon.png` and `public/branding/v3/story-order-app-icon.png` are the approved cinematic addon icon and must remain byte-identical.
- `public/branding/v2/story-order-order-flow.svg` must remain byte-identical to the v3 panoramic hero for backward compatibility.
- Approved v1.0.17 hero Git blob SHA: `4665a9c1cf5ec5bb861632d4964f90187b5f8659`.
- `step-1-source.svg` through `step-4-install.svg` support the setup sequence.
- `profile-safe.svg`, `profile-balanced.svg`, `profile-complete.svg` and `profile-custom.svg` identify ordering profiles.
- `feature-ids-preserved.svg`, `feature-stream-independent.svg`, `feature-outage-aware.svg` and `feature-private.svg` support the trust and behaviour cards.

## Meaning

The visual system must communicate ordering rather than recommendation. Story Order keeps the same programme and the same underlying episode identities while publishing a narrative presentation order for episodes, specials and one-offs.

Do not use the line "Pick a show. We find what's next." It describes a recommendation product and is not what Story Order does.

The small app icon is preferred at compact Stremio addon sizes. The vector glyph and interface artwork should be used wherever scaling, responsive layout or high density output matters.

## Public surface consistency

The configure page must use the canonical icon and the v2 scalable assets. The manifest, configure page and addon listing must retain the same product name and functional description. The footer must not introduce a competing functional tagline.

Worker tests compare `public/logo.png` with `public/branding/app-icon.png` and `public/background.jpg` with `public/branding/marketplace-background.jpg`. Those aliases must stay byte-identical.
