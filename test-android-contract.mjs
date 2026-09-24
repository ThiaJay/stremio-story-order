import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import stableStoryOrderVideos from "./src-android-contract-reference.mjs";

const fixture=JSON.parse(await readFile(new URL("./docs/android-story-order.fixture.json",import.meta.url),"utf8"));

function titleWatchedAction(isWatched){
  return {action:"MetaDetails",args:{action:"MarkAsWatched",args:Boolean(isWatched)}};
}

function deferredSeriesTitleAction({type,metaReady,libraryItemReady,isWatched}){
  if(type!=="series"||!metaReady||!libraryItemReady)return null;
  return titleWatchedAction(isWatched);
}

const canonical=structuredClone(fixture.meta.videos);
const ordered=stableStoryOrderVideos(fixture.meta.videos,fixture.meta.behaviorHints);
assert.ok(ordered);
assert.deepEqual(ordered.map(video=>video.id),fixture.expectedStoryOrder);
assert.deepEqual(fixture.meta.videos,canonical,"Story Order presentation must not mutate canonical videos");
assert.equal(ordered[1].id,"tt1234567:0:2");
assert.equal(ordered[1].season,0);
assert.equal(ordered[1].episode,2);
assert.ok(!ordered.some(video=>video.id==="tt1234567:0:99"));

for(const key of ["duplicate","unknown","missingRegular"]){
  assert.equal(
    stableStoryOrderVideos(fixture.meta.videos,{storyOrderVersion:1,storyOrder:fixture.invalid[key]}),
    null,
    key+" hint must fail closed"
  );
}

assert.equal(
  stableStoryOrderVideos(fixture.meta.videos,{storyOrderVersion:2,storyOrder:fixture.expectedStoryOrder}),
  null
);

assert.deepEqual(titleWatchedAction(true),{action:"MetaDetails",args:{action:"MarkAsWatched",args:true}});
assert.deepEqual(titleWatchedAction(false),{action:"MetaDetails",args:{action:"MarkAsWatched",args:false}});
assert.equal(deferredSeriesTitleAction({type:"series",metaReady:false,libraryItemReady:true,isWatched:true}),null);
assert.equal(deferredSeriesTitleAction({type:"series",metaReady:true,libraryItemReady:false,isWatched:true}),null);
assert.deepEqual(
  deferredSeriesTitleAction({type:"series",metaReady:true,libraryItemReady:true,isWatched:true}),
  titleWatchedAction(true)
);

console.log("PASS: public Android Story Order client contract");
