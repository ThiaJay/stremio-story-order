# Contributing

Issues and pull requests are welcome.

For ordering bugs, please include the series title, IMDb ID if known, the affected episode/special names, the current order and the expected order. Do not post Stremio AuthKeys, debrid credentials, private metadata configuration URLs or other secrets.

Before opening a pull request:

1. Run `node test-engine.mjs`, `node test-security.mjs`, `node test-worker.mjs` and `node test-customization.mjs`.
2. Run `node test-live.mjs` when internet access is available.
3. Add a regression test for any ordering or security change.
4. Preserve the video-ID identity invariant unless a future protocol extension explicitly documents otherwise.

Contributions are licensed under the MIT licence.