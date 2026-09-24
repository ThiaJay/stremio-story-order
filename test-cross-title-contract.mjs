import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import validateCrossTitleStoryReferences, { crossTitlePlaybackRequest } from "./src-cross-title-contract-reference.mjs";

const fixture=JSON.parse(await readFile(new URL("./docs/cross-title-story.fixture.json",import.meta.url),"utf8"));
const parent=structuredClone(fixture.parentVideos);
const refs=validateCrossTitleStoryReferences(fixture.parentVideos,fixture.valid);

assert.deepEqual(fixture.parentVideos,parent,"cross-title validation must never mutate parent canonical videos");
assert.deepEqual(refs,[{
  type:"movie",
  metaId:"tt7654321",
  videoId:"tt7654321",
  placement:"after",
  anchorId:"tt1234567:2:4",
  label:"The Story Film"
}]);

assert.deepEqual(crossTitlePlaybackRequest(refs[0]),{
  type:"movie",
  metaId:"tt7654321",
  videoId:"tt7654321"
});

for(const [name,hints] of Object.entries(fixture.invalid)){
  assert.equal(validateCrossTitleStoryReferences(fixture.parentVideos,hints),null,name+" must fail closed");
}

const duplicate=structuredClone(fixture.valid);
duplicate.storyReferences.push(structuredClone(duplicate.storyReferences[0]));
assert.equal(validateCrossTitleStoryReferences(fixture.parentVideos,duplicate),null,"duplicate reference must fail closed");

assert.equal(
  validateCrossTitleStoryReferences(fixture.parentVideos,{storyReferencesVersion:2,storyReferences:fixture.valid.storyReferences}),
  null,
  "unsupported contract version must fail closed"
);

assert.equal(crossTitlePlaybackRequest({type:"podcast",metaId:"x"}),null);

console.log("PASS: cross-title Story Order reference contract");
