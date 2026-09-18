import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import worker from "./worker.js";
import { watchedIdentityOrder } from "./story-order.js";

const env={CONFIG_SECRET:Buffer.alloc(32,11).toString("base64url")};
const ctx={waitUntil(p){p.catch(()=>{})}};
async function get(path){
  const response=await worker.fetch(new Request(`https://story.test${path}`),env,ctx);
  if(response.status!==200){const body=await response.text();assert.fail(`${path}: ${response.status} ${body}`);}
  return response.json();
}

const manifest=await get("/manifest.json");
assert.equal(manifest.name,"Story Order");
assert.equal(manifest.id,"org.stremio.story-order");

const popular=await get("/catalog/series/top.json");
assert.ok(Array.isArray(popular.metas)&&popular.metas.length>0);

for(const path of ["/manifest.json","/meta/series/tt0436992.json","/catalog/series/top.json"]){
  const response=await worker.fetch(new Request(`https://story.test${path}`,{method:"HEAD"}),env,ctx);
  assert.equal(response.status,200);
  assert.equal((await response.text()).length,0);
}

for(const id of ["tt0436992","tt0118363"]){
  const wrapped=await get("/meta/series/"+id+".json");
  const upstreamResponse=await fetch("https://v3-cinemeta.strem.io/meta/series/"+id+".json",{cache:"no-store"});
  assert.equal(upstreamResponse.status,200);
  const upstream=await upstreamResponse.json();
  assert.deepEqual(watchedIdentityOrder(wrapped.meta.videos),watchedIdentityOrder(upstream.meta.videos));
  assert.deepEqual(wrapped.meta.videos,upstream.meta.videos);
  const dbg=await get("/_story/debug/series/"+id+".json");
  assert.equal(dbg.mode,"emergency-watched-state-safety-passthrough");
  assert.equal(dbg.reason,"EPISODE_REORDERING_TEMPORARILY_DISABLED");
}

const movie=await get("/meta/movie/tt0133093.json");
assert.equal(movie.meta.name,"The Matrix");

console.log("PASS: Story Order live emergency safety integration suite");
