# Story Order 1.0.7 Release Checklist

## Purpose

v1.0.7 is an emergency watched-state/autoplay safety release. The hosted Worker must not relocate series episodes until Stremio has a representation that can preserve watched identity independently from display/story order.

## Automated gates

- [x] syntax and README encoding checks pass
- [x] deterministic watched-state-safe engine suite passes
- [x] security/outage suite passes
- [x] Worker/configuration API suite passes
- [x] profile/override emergency-safety suite passes
- [x] live Cinemeta emergency-safety suite passes
- [x] dependency audit reports zero vulnerabilities
- [ ] public CI passes on Linux, Windows and macOS for the v1.0.7 commit

## Behaviour gates

- [x] hosted series metadata returns the upstream video array unchanged
- [x] watched identity order remains identical to upstream
- [x] Doctor Who regression proves a Season 0 special is not relocated
- [x] Jonathan Creek regression proves a post-series special is not relocated
- [x] movie metadata remains unchanged
- [x] Story Order still exposes its independent manifest/configuration surface
- [x] debug diagnostics identify emergency watched-state safety passthrough
- [x] no watched/account writes or stream/debrid behaviour introduced

## Privacy and security gates

- [x] no Stremio AuthKey or account login required
- [x] encrypted stateless configuration token
- [x] custom upstream remains restricted
- [x] response/request bounds and redirect restrictions remain covered
- [x] no analytics or advertising
- [x] public source contains no private deployment/configuration identifiers

## Publication gates

- [ ] commit and push exact v1.0.7 source
- [ ] cross-platform CI passes for that commit
- [ ] deploy production Worker from that source
- [ ] verify hosted manifest reports 1.0.7
- [ ] verify live Doctor Who and Jonathan Creek passthrough
- [ ] publish immutable GitHub v1.0.7 release
- [ ] update Foundation publication truth
- [ ] re-submit stable manifest to central directory if appropriate

## Native follow-up

Story Order's long-term narrative ordering requires a native/display-order contract that does not repurpose season/episode coordinates used by watched-state identity. That work belongs in a separate Stremio native-fix workstream.
