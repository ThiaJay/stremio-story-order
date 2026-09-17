 / stale enrichment / upstream-only inference
- [ ] metadata-source 5xx outage -> safe cache or Cinemeta fallback where supported
- [ ] metadata-source 4xx/configuration error is not hidden by stale data
- [ ] video-ID multiset unchanged after every transformation
- [ ] no duplicate positive-season episode numbers
- [ ] ordinary movie metadata remains unchanged

## Privacy and security gates

- [ ] no Stremio AuthKey or account login required
- [ ] encrypted stateless configuration token
- [ ] custom upstream disabled by default and allowlisted when enabled
- [ ] localhost, IP literals, URL credentials, non-HTTPS, path traversal and redirects rejected
- [ ] oversized response and request limits tested
- [ ] non-public/personal catalogue responses are not persisted
- [ ] no analytics or advertising code
- [ ] source tree scan contains no private deployment/configuration identifiers
- [ ] CONFIG_SECRET is deployment-secret only and absent from repository

## Publication gates

- [ ] MIT licence present
- [ ] README, SECURITY, PRIVACY and ARCHITECTURE present
- [ ] Stremio logo/background assets present
- [ ] public GitHub repository created
- [ ] hosted production Worker deployed under a community-specific service
- [ ] hosted `/manifest.json`, `/configure`, Doctor Who and Jonathan Creek smoke checks pass
- [ ] configuration page creates working Stremio install links
- [ ] GitHub CI green
- [ ] versioned GitHub release created
- [ ] Stremio central publish request accepted
- [ ] community listing visibility checked after Stremio indexing delay