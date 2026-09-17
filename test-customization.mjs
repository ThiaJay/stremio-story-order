import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import worker from "./worker.js";
const env={CONFIG_SECRET:Buffer.alloc(32,15).toString("base64url")};
const ctx={waitUntil(p){p.catch(()=>{})}};
async function configured(config){
  const r=await worker.fetch(new Request("https://story.test/api/config",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(config)}),env,ctx);
  assert.equal(r.status,200); return (await r.json()).token;
}
async function meta(token,id){const r=await worker.fetch(new Request(`https://story.test/${token}/meta/series/${id}.json`),env,ctx);assert.equal(r.status,200);return (await r.json()).meta}
const safeToken=await configured({source:{kind:"cinemeta"},order:{profile:"safe"}});
const safe=await meta(safeToken,"tt0436992");
const bornSafe=safe.videos.find(v=>v.id==="tt0436992:0:1");
const christmasSafe=safe.videos.find(v=>v.id==="tt0436992:0:2");
assert.equal(bornSafe.season,0); assert.equal(christmasSafe.season,1); assert.equal(christmasSafe.episode,14);

const balancedToken=await configured({source:{kind:"cinemeta"},order:{profile:"balanced"}});
const balanced=await meta(balancedToken,"tt0436992");
const bornBalanced=balanced.videos.find(v=>v.id==="tt0436992:0:1");
assert.equal(bornBalanced.season,1); assert.ok(bornBalanced.episode<balanced.videos.find(v=>v.id==="tt0436992:0:2").episode);
const excludeToken=await configured({
  source:{kind:"cinemeta"},order:{profile:"safe"},
  overrides:{tt0436992:{exclude:["tt0436992:0:2"]}}
});
const excluded=await meta(excludeToken,"tt0436992");
assert.equal(excluded.videos.find(v=>v.id==="tt0436992:0:2").season,0);
assert.equal(Math.max(...excluded.videos.filter(v=>v.season===1).map(v=>v.episode)),13);

const manualToken=await configured({
  source:{kind:"cinemeta"},order:{profile:"safe"},
  overrides:{tt0436992:{include:[{id:"tt0436992:0:69",beforeId:"tt0436992:7:1"}]}}
});
const manual=await meta(manualToken,"tt0436992");
const prequel=manual.videos.find(v=>v.id==="tt0436992:0:69");
const anchor=manual.videos.find(v=>v.id==="tt0436992:7:1");
assert.equal(prequel.season,anchor.season);
const seasonItems=manual.videos.filter(v=>v.season===anchor.season).sort((a,b)=>a.episode-b.episode);
assert.equal(seasonItems.findIndex(v=>v.id===prequel.id)+1,seasonItems.findIndex(v=>v.id===anchor.id));
assert.equal(prequel.id,"tt0436992:0:69");

console.log("PASS: Story Order profile and manual-override suite");