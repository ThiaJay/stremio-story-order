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

## Scalable configure page assets

The `public/branding/v2` directory is the current scalable interface asset set.

- `story-order-glyph.svg` is the compact vector mark and favicon.
- `story-order-order-flow.svg` is the configure page hero. It shows mixed episode metadata becoming one narrative watch path.
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
