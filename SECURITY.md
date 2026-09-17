# Security

## Security goals

Story Order is designed as a metadata-ordering service with no Stremio account privileges. A compromise of Story Order should not grant access to a user's Stremio account or stream-provider credentials because those credentials are never requested.

Core invariants:

1. Automatic ordering must preserve the exact multiset of upstream video IDs.
2. User configuration is encrypted at rest inside the install URL and is not stored in an application database.
3. The hosted service must not act as an unrestricted server-side request proxy.
4. Personal catalogue responses must not be persisted by Story Order.
5. Enrichment-provider failure must degrade to cached/public or conservative local inference rather than corrupting ordering.

## Source-request controls

Hosted source adapters enforce HTTPS, standard port 443, no URL credentials, no IP literals, no localhost/internal hostnames and no path traversal. Upstream redirects are not followed.

Cinemeta is a built-in source. ElfHosted AIOMetadata uses a constrained hostname and manifest-path pattern. Generic custom sources are disabled unless the operator explicitly enables them and supplies an allowlist.

Only Stremio manifest/catalog/meta/subtitles resource paths are proxied. Arbitrary paths are rejected.

## Resource limits

Upstream requests use finite timeouts. JSON response size is bounded even when `Content-Length` is absent. Configuration request and token sizes are bounded. Manual overrides are capped by show and rule counts.

## Fail-safe ordering

Every transformed series response is checked after transformation. If its video-ID multiset differs from the original, Story Order returns the unmodified metadata response rather than the transformed sequence.

Safe mode excludes short-form and non-story material by default. Fuzzy matching for normal-episode repairs requires close dates and title agreement and rejects entries labelled as prequels, minisodes, tardisodes or extras.
## Known boundary: stream availability

Story Order does not receive the list of streams returned by other installed addons. It therefore cannot safely skip an episode because a particular stream source is unavailable. Preserving the original video ID is the interoperability mechanism: all installed stream addons remain free to answer the same episode request.

A future availability-aware feature must remain optional and must not require Stremio account credentials. It will not be merged until it can avoid coupling ordering to one stream provider.

## Cross-title media

Automatic synthesis of a film or TV movie that is absent from the upstream series metadata is intentionally blocked. A Stremio series stream request and a movie stream request are not guaranteed to be interchangeable. Cross-title sequencing requires a proven protocol-level representation before release.

## Secrets

`CONFIG_SECRET` is a deployment secret and must never be committed. Operators should use a random 32-byte value encoded as base64url. Cloudflare account credentials and API tokens are deployment concerns and are not read by application code.

The public repository must not contain a user's configured AIOMetadata manifest URL, Stremio AuthKey, Cloudflare account identifier or private deployment hostname.

## Reporting

Before public stable release, a dedicated security contact/reporting route should be added to the repository. Until then this beta tree should not be advertised as security-audited software.