import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import worker from "./worker.js";

const env={CONFIG_SECRET:Buffer.alloc(32,15).toString("base64url")};
const ctx={waitUntil(p){p.catch(()=>{})}};

async function configured(config){
  const r=await worker.fetch(new Request("https://story.test/api/config",{
    method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(config)
  }),env,ctx);
  assert.equal(r.status,200);
  return (await r.json()).token;
}
async function meta(token,id){
  const r=await worker.fetch(new Request(`https://story.test/${token}/meta/series/${id}.json`),env,ctx);
  assert.equal(r.status,200);
  return (await r.json()).meta;
}
async function debug(token,id){
  const r=await worker.fetch(new Request(`https://story.test/${token}/_story/debug/series/${id}.json`),env,ctx);
  assert.equal(r.status,200);
  return r.json();
}

for(const profile of ["safe","balanced"]){
  const token=await configured({source:{kind:"cinemeta"},order:{profile}});
  const m=await meta(token,"tt0436992");
  const dbg=await debug(token,"tt0436992");
  assert.equal(m.videos.find(v=>v.id==="tt0436992:0:1").season,0);
  assert.equal(m.videos.find(v=>v.id==="tt0436992:0:2").season,0);
  assert.ok(["stable-id-story-order-hint","canonical-video-passthrough"].includes(dbg.mode));
  if(dbg.mode==="stable-id-story-order-hint"){
    assert.equal(dbg.reason,"PRESENTATION_ORDER_PUBLISHED_WITH_CANONICAL_IDENTITIES");
    assert.ok(Array.isArray(dbg.storyOrder)&&dbg.storyOrder.length>0);
    assert.deepEqual(m.behaviorHints?.storyOrder,dbg.storyOrder);
    assert.equal(m.behaviorHints?.storyOrderVersion,1);
  }else{
    assert.equal(dbg.reason,"CANONICAL_VIDEO_COORDINATES_PRESERVED");
  }
}

const manualToken=await configured({
  source:{kind:"cinemeta"},order:{profile:"safe"},
  overrides:{tt0436992:{include:[{id:"tt0436992:0:69",beforeId:"tt0436992:7:1"}]}}
});
const manual=await meta(manualToken,"tt0436992");
const manualDebug=await debug(manualToken,"tt0436992");
assert.equal(manual.videos.find(v=>v.id==="tt0436992:0:69").season,0);
assert.equal(manualDebug.mode,"stable-id-story-order-hint");
assert.equal(manualDebug.reason,"PRESENTATION_ORDER_PUBLISHED_WITH_CANONICAL_IDENTITIES");
assert.equal(manual.behaviorHints?.storyOrderVersion,1);
assert.deepEqual(manual.behaviorHints?.storyOrder,manualDebug.storyOrder);
assert.ok(manualDebug.storyOrder.includes("tt0436992:0:69"));
assert.equal(
  manualDebug.storyOrder.indexOf("tt0436992:0:69")+1,
  manualDebug.storyOrder.indexOf("tt0436992:7:1"),
  "manual placement should be expressed by stable ID order without changing canonical episode coordinates"
);

console.log("PASS: Story Order profile/override stable-ID safety suite");
