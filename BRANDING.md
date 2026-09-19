# Story Order branding

The public graphics are deliberately stored in the repository so addon directories, contributors and community posts can use the same current identity.

## Final assets

- `public/branding/app-icon.png` — square addon/app icon.
- `public/branding/marketplace-background.jpg` — Stremio background artwork.
- `public/branding/story-order-lockup.png` — wide logo, wordmark and strapline.
- `public/branding/story-order-social-preview.jpg` — repository/social sharing artwork.
- `public/branding/story-order-brand-board.jpg` — overview of the final release identity.
- `public/screenshots/configure-desktop.png` — live Story Order configure page.

## Core wording

**Story Order**

*Puts TV episodes, specials and one-offs in the right watch order.*

The small app icon should be preferred anywhere the mark is displayed at compact Stremio-addon sizes. The wide lockup is intended for documentation, repository headers and community posts.

These files represent the current public branding. Earlier exploratory concept boards are not release assets and should not be used in addon listings.

## Public surface consistency

The configure page uses the exact canonical app icon. The manifest, configure page and existing directory listing share the core strapline. The footer must not introduce a competing tagline.

`public/logo.png` must remain identical to `public/branding/app-icon.png`. `public/background.jpg` must remain identical to `public/branding/marketplace-background.jpg`. Worker tests compare their bytes and check the configure page, manifest and exact permitted image URL.
