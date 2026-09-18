import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import worker from "./worker.js";

const env={CONFIG_SECRET:Buffer.alloc(32,11).toString("base64url")};
const ctx={waitUntil(p){p.catch(()=>{})}};
async function get(path){
  const response=await worker.fetch(new Request(`https://story.test${path}`),env,ctx);
  if(response.status!==200){ const body=await response.text(); assert.fail(`${path}: ${response.status} ${body}`); }
  return response.json();
}

const manifest=await get("/manifest.json");
assert.equal(manifest.name,"Story Order");
assert.equal(manifest.id,"org.stremio.story-order");
assert.ok(manifest.catalogs?.length>0);

const popular=await get("/catalog/series/top.json");
assert.ok(Array.isArray(popular.metas)&&popular.metas.length>0,"Cinemeta redirected Popular catalog did not resolve safely");

async function head(path){
  const response=await worker.fetch(new Request(`https://story.test${path}`,{method:"HEAD"}),env,ctx);
  assert.equal(response.status,200,`HEAD ${path} returned ${response.status}`);
  assert.equal((await response.text()).length,0,`HEAD ${path} returned a body`);
  return response;
}
for(const path of ["/manifest.json","/meta/series/tt0436992.json","/catalog/series/top.json"]){
  const response=await head(path);
  assert.match(response.headers.get("content-type")||"",/json/i);
}

const doctor=await get("/meta/series/tt0436992.json");
const doctorIds=[...doctor.meta.videos.map(v=>v.id)];
assert.equal(new Set(doctorIds).size,doctorIds.length);
const christmas=doctor.meta.videos.find(v=>(v.title||v.name)==="The Christmas Invasion");
assert.ok(christmas,"Doctor Who Christmas special missing");
assert.equal(christmas.season,1);
assert.equal(christmas.episode,14);
const jonathan=await get("/meta/series/tt0118363.json");
const daemons=jonathan.meta.videos.find(v=>(v.title||v.name)==="Daemons' Roost");
assert.ok(daemons,"Jonathan Creek: Daemons' Roost missing");
assert.ok(Number(daemons.season)>0,"Daemons' Roost remained in Season 0");
const jcSeason=jonathan.meta.videos.filter(v=>Number(v.season)===Number(daemons.season));
assert.equal(daemons.episode,Math.max(...jcSeason.map(v=>Number(v.episode))),"Daemons' Roost is not the final episode in its season sequence");

const movie=await get("/meta/movie/tt0133093.json");
assert.equal(movie.meta.name,"The Matrix");

const debug=await get("/_story/debug/series/tt0436992.json");
assert.equal(debug.identityInvariant,"pass");
assert.ok(debug.inserted.some(x=>x.title==="The Christmas Invasion"));

console.log("PASS: Story Order live standalone Cinemeta integration suite");