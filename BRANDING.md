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

The live configure hero is the approved Breaking Bad journey artwork delivered as five seamless verified WebP tiles under `public/branding/v4/`. The `public/branding/v3/story-order-hero.svg` path remains a compatibility wrapper and must not replace the live tiled hero with a generic landscape, schematic or placeholder.

- `story-order-glyph.svg` is the compact vector favicon.
- `public/logo.png`, `public/branding/app-icon.png` and `public/branding/v3/story-order-app-icon.png` are the approved cinematic addon icon and must remain byte-identical.
- `public/branding/v2/story-order-order-flow.svg` and `public/branding/v3/story-order-hero.svg` are compatibility wrappers that point to the canonical WebP.
- `step-1-source.svg` through `step-4-install.svg` support the setup sequence.
- `profile-safe.svg`, `profile-balanced.svg`, `profile-complete.svg` and `profile-custom.svg` identify ordering profiles.
- `feature-ids-preserved.svg`, `feature-stream-independent.svg`, `feature-outage-aware.svg` and `feature-private.svg` support the trust and behaviour cards.


- The canonical optically centred PNG master is Git blob `ed91dc7c10b5454482e562c4d085effc7d0e0bc0` with SHA-256 `65a1dfa2d6fe5c896cd4cd43f0ea4c70ec64d25d5f95783f611b260cbfd93866`. The portal artwork is translated 17 pixels left within the unchanged 320 by 320 square.
- `story-order-glyph.svg` uses the equivalent seven viewBox unit left translation so scalable surfaces match the PNG master.

The configure hero must show the viewer moving with the Breaking Bad story world toward the corrected sequence and desert caravan. The five live tiles reproduce that signed off composition without relying on a single oversized repository transfer.

## Meaning

The visual system must communicate ordering rather than recommendation. Story Order keeps the same programme and the same underlying episode identities while publishing a narrative presentation order for episodes, specials and one-offs.

Do not use the line "Pick a show. We find what's next." It describes a recommendation product and is not what Story Order does.

The small app icon is preferred at compact Stremio addon sizes. The vector glyph and interface artwork should be used wherever scaling, responsive layout or high density output matters.

## Public surface consistency

The configure page must use the canonical icon and the v2 scalable assets. The manifest, configure page and addon listing must retain the same product name and functional description. The footer must not introduce a competing functional tagline.

Worker tests compare `public/logo.png` with `public/branding/app-icon.png` and `public/background.jpg` with `public/branding/marketplace-background.jpg`. Those aliases must stay byte-identical.
