# Story Order 1.0.1 Release Checklist

## Automated gates

- [x] syntax checks pass for Worker and core modules
- [x] deterministic adversarial engine suite passes
- [x] security/outage suite passes
- [x] Worker/configuration API suite passes
- [x] profile/manual-override suite passes
- [x] live standalone Cinemeta suite passes
- [x] AIOMetadata compatibility smoke test passes without persisting a private manifest URL in the repository
- [x] GitHub CI passes on the public repository

## Behaviour gates

- [x] full-length special between seasons
- [x] post-series feature-length continuation (`Jonathan Creek: Daemons' Roost`)
- [x] high-confidence normal episode misclassified as Season 0
- [x] significant minisode excluded in Safe and available when explicitly opted in
- [x] insignificant/non-story extra excluded by default
- [x] future/unaired entry remains untouched by default
- [x] manual include/exclude and before/after positioning preserve the original video ID
- [x] TVmaze outage -> cached enrichment or conservative upstream-only inference
- [x] metadata-source 5xx outage -> safe cache or Cinemeta fallback where supported
- [x] metadata-source 4xx/configuration error is not hidden by stale data
- [x] video-ID multiset unchanged after every automatic transformation
- [x] no duplicate positive-season episode numbers in tested transformations
- [x] ordinary movie metadata remains unchanged

## Privacy and security gates

- [x] no Stremio AuthKey or account login required by Story Order
- [x] encrypted stateless configuration token
- [x] custom upstream disabled by default and allowlisted when enabled
- [x] localhost, IP literals, URL credentials, non-HTTPS, path traversal and redirects rejected
- [x] oversized response and request limits tested
- [x] non-public/personal catalogue responses are not persisted
- [x] no analytics or advertising code
- [x] source scan contains no private deployment/configuration identifiers
- [x] `CONFIG_SECRET` stored as a Cloudflare Worker secret and absent from repository
- [x] GitHub Private Vulnerability Reporting enabled

## Publication gates

- [x] MIT licence present
- [x] README, CHANGELOG, CONTRIBUTING, SECURITY, PRIVACY and ARCHITECTURE present
- [x] Stremio logo/background assets present
- [x] public GitHub repository created
- [x] hosted production Worker deployed under `stremio-story-order`
- [x] hosted `/manifest.json`, `/configure`, Doctor Who and Jonathan Creek smoke checks pass
- [x] configuration API creates working tokenised manifest/install URLs
- [x] versioned GitHub release prepared
- [x] Stremio central publish request accepted (`success: true`)
- [ ] confirm visibility after Stremio's indexing delay
- [ ] optional stremio-addons.net curated-directory submission (requires submitter's Stremio-account login)
