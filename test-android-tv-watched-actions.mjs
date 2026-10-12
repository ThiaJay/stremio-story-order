import assert from "node:assert/strict";
import { prepareTvWatchedAction, confirmTvWatchedAction } from "./src-android-tv-watched-actions.mjs";

const meta = {
  id: "tt1234567", type: "series",
  videos: [
    { id: "tt1234567:1:1", season: 1, episode: 1, released: "2025-01-01T00:00:00Z" },
    { id: "tt1234567:1:2", season: 1, episode: 2, released: "2025-01-08T00:00:00Z" },
    { id: "tt1234567:2:1", season: 2, episode: 1, released: "2025-02-01T00:00:00Z" },
    { id: "tt1234567:2:2", season: 2, episode: 2, released: "2025-02-08T00:00:00Z" },
    { id: "tt1234567:3:1", season: 3, episode: 1, released: "2035-01-01T00:00:00Z" },
    { id: "tt1234567:0:1", season: 0, episode: 1, released: "2024-12-01T00:00:00Z" }
  ],
  behaviorHints: {
    storyOrderVersion: 1,
    storyOrder: [
      "tt1234567:1:1", "tt1234567:1:2", "tt1234567:2:1",
      "tt1234567:2:2", "tt1234567:3:1"
    ]
  }
};
const inputs = {
  meta, expectedMetaId: meta.id, metaReady: true, libraryReady: true,
  scope: "series", isWatched: true, now: "2026-10-12T12:00:00Z"
};
const before = structuredClone(meta);
const title = prepareTvWatchedAction(inputs);
assert.ok(title);
assert.equal(title.selectedIds.length, 4, "future episode and ancillary special excluded");
assert.deepEqual(title.action,
  { action: "MetaDetails", args: { action: "MarkAsWatched", args: true } });
assert.equal(confirmTvWatchedAction(title, inputs, {
  remoteKey: "DPAD_DOWN", focused: true, fingerprint: title.fingerprint
}), null, "focus navigation may not mutate watched state");
assert.equal(confirmTvWatchedAction(title, inputs, {
  remoteKey: "ENTER", focused: false, fingerprint: title.fingerprint
}), null);
assert.equal(confirmTvWatchedAction(title, inputs, {
  remoteKey: "DPAD_CENTER", focused: true, fingerprint: "wrong"
}), null);
assert.deepEqual(confirmTvWatchedAction(title, inputs, {
  remoteKey: "DPAD_CENTER", focused: true, fingerprint: title.fingerprint
}), title.action);

const seasonInputs = { ...inputs, scope: "season", season: 2 };
const season = prepareTvWatchedAction(seasonInputs);
assert.equal(season.selectedIds.length, 2);
assert.deepEqual(season.action,
  { action: "MetaDetails", args: { action: "MarkSeasonAsWatched", args: [2, true] } });
assert.deepEqual(confirmTvWatchedAction(season, seasonInputs, {
  remoteKey: "ENTER", focused: true, fingerprint: season.fingerprint
}), season.action);
assert.equal(prepareTvWatchedAction({ ...seasonInputs, season: 3 }), null,
  "Core's existing season action would wrongly include future episodes");
assert.equal(prepareTvWatchedAction({ ...seasonInputs, season: 0 }), null);
assert.equal(prepareTvWatchedAction({ ...seasonInputs, season: 99 }), null);
assert.equal(prepareTvWatchedAction({ ...seasonInputs, season: 2.5 }), null);
assert.equal(prepareTvWatchedAction({ ...seasonInputs, scope: "storyOrder" }), null);
assert.equal(prepareTvWatchedAction({ ...seasonInputs, metaReady: false }), null);
assert.equal(prepareTvWatchedAction({ ...seasonInputs, libraryReady: false }), null);
assert.equal(prepareTvWatchedAction({ ...seasonInputs, expectedMetaId: "tt9999" }), null);
assert.equal(prepareTvWatchedAction({ ...seasonInputs, isWatched: "false" }), null);
assert.equal(prepareTvWatchedAction({ ...seasonInputs, now: "invalid" }), null);
assert.equal(prepareTvWatchedAction({ ...seasonInputs, meta: {
  ...meta, videos: [...meta.videos, meta.videos[0]]
} }), null, "duplicate canonical episode identity is unsafe");

const unknownDate = {
  ...meta, videos: meta.videos.map((v) => v.season === 2 && v.episode === 2
    ? { ...v, released: null } : v)
};
assert.equal(prepareTvWatchedAction({ ...seasonInputs, meta: unknownDate }), null,
  "unverified release date cannot mark full season watched");
const stale = { ...meta, videos: meta.videos.map((v) => v.season === 2 && v.episode === 2
  ? { ...v, released: "2025-02-09T00:00:00Z" } : v) };
assert.equal(confirmTvWatchedAction(season, { ...seasonInputs, meta: stale }, {
  remoteKey: "ENTER", focused: true, fingerprint: season.fingerprint
}), null, "metadata drift after confirmation must fail closed");

const removeInputs = { ...seasonInputs, isWatched: false };
const remove = prepareTvWatchedAction(removeInputs);
assert.deepEqual(remove.action,
  { action: "MetaDetails", args: { action: "MarkSeasonAsWatched", args: [2, false] } });
assert.equal(confirmTvWatchedAction(remove, removeInputs, {
  remoteKey: "ENTER", focused: true, fingerprint: remove.fingerprint
}), null, "removing watched state requires separate acknowledgement");
assert.deepEqual(confirmTvWatchedAction(remove, removeInputs, {
  remoteKey: "ENTER", focused: true, fingerprint: remove.fingerprint,
  unwatchAcknowledged: true
}), remove.action);

assert.deepEqual(meta, before, "preparation and confirmation never mutate metadata");
console.log("PASS: Fire TV bulk watched action payload and fail closed UI contract");
