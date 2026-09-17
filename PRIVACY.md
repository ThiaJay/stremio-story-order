# Privacy

Story Order is designed to require as little user data as possible.

## Configuration

The configuration page can accept a metadata-source manifest URL and ordering preferences. The server normalises the configuration and encrypts it into the Stremio install URL using AES-GCM. There is no application configuration database.

An encrypted token still travels through the hosting/CDN infrastructure as part of the request URL. It is designed to conceal the source URL from casual disclosure and application logs; users should still treat their generated install URL as private when it wraps a private metadata configuration.

## Stremio account data

Story Order does not request a Stremio AuthKey, email address, password or account session. Reordering installed addons is not part of the community addon itself.

## Metadata caching

TVmaze ordering data is public enrichment data and may be cached for resilience.

Movie/series metadata responses may be cached to keep title pages usable during a metadata-source outage. Story Order deliberately does not persist catalogue responses from non-public/custom configurations because catalogues may represent Trakt lists, collections or other personalised data.

Subtitles are pass-through and are not placed in persistent Story Order cache.

## Analytics

The application implements no analytics, advertising identifiers or behavioural telemetry. The hosting provider may retain standard infrastructure/security logs according to the operator's hosting configuration and provider policy.