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
- `public/branding/v2/story-order-order-flow.svg` and `public/branding/v3/story-order-hero.svg` are compatibility wrappers that point to the canonical WebP.
- Approved v1.0.17 hero Git blob SHA: `4665a9c1cf5ec5bb861632d4964f90187b5f8659`.
- `step-1-source.svg` through `step-4-install.svg` support the setup sequence.
- `profile-safe.svg`, `profile-balanced.svg`, `profile-complete.svg` and `profile-custom.svg` identify ordering profiles.
- `feature-ids-preserved.svg`, `feature-stream-independent.svg`, `feature-outage-aware.svg` and `feature-private.svg` support the trust and behaviour cards.

- Approved hero size is 28,482 bytes. Approved hero Git blob is `cddde00199bc6f2a26a0903d01d2564856e896e9`.
- Approved hero SHA-256 is `884e53a7965c3a706beaa52b508f305a19604533af86a8af0d090164410763a5`.

- Optically centred v1.0.19 icon Git blob: `ed91dc7c10b5454482e562c4d085effc7d0e0bc0`. SHA-256: `65a1dfa2d6fe5c896cd4cd43f0ea4c70ec64d25d5f95783f611b260cbfd93866`. The portal artwork is translated left within the unchanged square master to correct its visual centre.

- `public/logo.png`, `public/branding/app-icon.png` and `public/branding/v3/story-order-app-icon.png` use the optically centred v1.0.21 portal master. Git blob `8d50c42091c24fc80ef5e1a200359f8e4cfce2ac`.\n
The configure hero uses the approved Breaking Bad journey artwork from the signed-off mockup. It must show the viewer moving with the story world toward the corrected sequence and desert caravan, not a generic landscape or abstract episode ribbon.

The live configure hero is delivered as five seamless verified WebP tiles under `public/branding/v4/`. Together they reproduce the approved Breaking Bad caravan journey without relying on a single oversized repository transfer.\n\n## Meaning

The visual system must communicate ordering rather than recommendation. Story Order keeps the same programme and the same underlying episode identities while publishing a narrative presentation order for episodes, specials and one-offs.

Do not use the line "Pick a show. We find what's next." It describes a recommendation product and is not what Story Order does.

The small app icon is preferred at compact Stremio addon sizes. The vector glyph and interface artwork should be used wherever scaling, responsive layout or high density output matters.

## Public surface consistency

The configure page must use the canonical icon and the v2 scalable assets. The manifest, configure page and addon listing must retain the same product name and functional description. The footer must not introduce a competing functional tagline.

Worker tests compare `public/logo.png` with `public/branding/app-icon.png` and `public/background.jpg` with `public/branding/marketplace-background.jpg`. Those aliases must stay byte-identical.
