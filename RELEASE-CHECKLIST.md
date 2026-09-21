# Story Order 1.0.9 Release Checklist

## Purpose

v1.0.9 fixes current private ElfHosted AIOMetadata manifest validation without weakening Story Order's source allowlist or watched-identity safety mode.

## Automated gates

- [x] syntax and README encoding checks pass
- [x] deterministic watched-state-safe engine suite passes
- [x] security and outage suite passes
- [x] private AIOMetadata manifest regressions cover public, private, regional and compressed configuration routes
- [x] malformed and lookalike manifest routes fail closed
- [x] dependency audit includes development dependencies and reports no high-severity vulnerabilities
- [ ] public CI passes on Linux, Windows and macOS for the exact v1.0.9 candidate

## Behaviour gates

- [x] hosted series ordering remains in watched-identity safety passthrough
- [x] no watched-state, stream or account mutation is introduced
- [x] existing Cinemeta behaviour remains unchanged
- [x] valid existing ElfHosted AIOMetadata routes remain accepted
- [x] current private regional ElfHosted AIOMetadata route shapes are accepted
- [x] encoded path separators are rejected before route validation

## Publication gates

- [ ] exact v1.0.9 candidate passes cross-platform CI
- [ ] production Worker deploy succeeds from the exact candidate
- [ ] hosted manifest reports 1.0.9
- [ ] hosted configuration API accepts the private regional AIOMetadata synthetic contract
- [ ] live Cinemeta safety suite passes
- [ ] merge the exact deployed candidate to main
- [ ] publish immutable GitHub v1.0.9 release
- [ ] update Foundation publication truth
- [ ] re-submit the stable manifest to Stremio central if appropriate

## Release rule

Do not publish the GitHub release or advance Foundation publication truth until the live Worker is proven to match the exact candidate. A deployment credential or live-verification failure leaves this branch as a release candidate only.
