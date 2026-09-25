// Production smoke verifies the accepted live 1.0.21 Story Order contract, direct panoramic hero, spacious configure experience, capability status and canonical identity parity.
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


const liveOrigin="https://stremio-story-order.storyorder.workers.dev";
const liveManifestResponse=await fetch(liveOrigin+"/manifest.json",{cache:"no-store"});
assert.equal(liveManifestResponse.status,200);
const liveManifest=await liveManifestResponse.json();
assert.equal(liveManifest.id,"org.stremio.story-order");
assert.equal(liveManifest.version,manifest.version);

const liveStatusResponse=await fetch(liveOrigin+"/_story/status.json",{cache:"no-store"});
assert.equal(liveStatusResponse.status,200);
const liveStatus=await liveStatusResponse.json();
assert.equal(liveStatus.status,"live");
assert.equal(liveStatus.version,manifest.version);
assert.equal(liveStatus.storyOrderContract?.version,1);
assert.equal(liveStatus.storyOrderContract?.representation,"stable-video-id-presentation-hint");
assert.equal(liveStatus.storyOrderContract?.canonicalVideoCoordinatesPreserved,true);
assert.equal(liveStatus.storyOrderContract?.canonicalVideoIdsPreserved,true);
assert.equal(liveStatus.storyOrderContract?.watchedIdentityMutation,false);
assert.equal(liveStatus.privacy?.stremioAuthKeyRequired,false);
assert.equal(liveStatus.privacy?.accountAccess,false);

const liveConfigureResponse=await fetch(liveOrigin+"/configure",{cache:"no-store"});
assert.equal(liveConfigureResponse.status,200);
const liveConfigureHtml=await liveConfigureResponse.text();
assert.match(liveConfigureHtml,/Correct order\. Complete stories\./);
assert.match(liveConfigureHtml,/branding\/v3\/story-order-hero\.webp\?v=1\.0\.20/);
assert.match(liveConfigureHtml,/logo\.png\?v=1\.0\.20/);
assert.match(liveConfigureHtml,/Per-series override helper/);
assert.match(liveConfigureHtml,/Add override rule/);
assert.match(liveConfigureHtml,/Advanced override JSON/);
assert.match(liveConfigureHtml,/class="concept-steps"/);
assert.match(liveConfigureHtml,/class="flow"/);
assert.match(liveConfigureHtml,/Breaking Bad/);
assert.match(liveConfigureHtml,/Felina/);
assert.match(liveConfigureHtml,/El Camino/);
assert.match(liveConfigureHtml,/sequence-compare/);

const liveIconResponse=await fetch("https://raw.githubusercontent.com/ThiaJay/stremio-story-order/main/public/logo.png?v=1.0.21",{cache:"no-store"});
assert.equal(liveIconResponse.status,200);
const liveIconBytes=Buffer.from(await liveIconResponse.arrayBuffer());
assert.equal(liveIconBytes.length,24654,"live compact icon must match the approved centred master size");
assert.equal(liveIconBytes.subarray(0,8).toString("hex"),"89504e470d0a1a0a","live compact icon must be a PNG");
assert.equal(liveIconBytes.readUInt32BE(16),320);
assert.equal(liveIconBytes.readUInt32BE(20),320);

const liveHeroResponse=await fetch("https://raw.githubusercontent.com/ThiaJay/stremio-story-order/main/public/branding/v3/story-order-hero.webp?v=1.0.21",{cache:"no-store"});
assert.equal(liveHeroResponse.status,200);
const liveHero=Buffer.from(await liveHeroResponse.arrayBuffer());
assert.equal(liveHero.length,28482,"live hero must match the approved 1000x375 panoramic master");
assert.equal(liveHero.subarray(0,4).toString("ascii"),"RIFF");
assert.equal(liveHero.subarray(8,12).toString("ascii"),"WEBP");

const legacyHeroResponse=await fetch("https://raw.githubusercontent.com/ThiaJay/stremio-story-order/main/public/branding/v2/story-order-order-flow.svg?v=1.0.21",{cache:"no-store"});
assert.equal(legacyHeroResponse.status,200);
const legacyHero=await legacyHeroResponse.text();
assert.match(legacyHero,/story-order-hero\.webp\?v=1\.0\.20/);
assert.doesNotMatch(legacyHero,/MIXED METADATA|ONE NARRATIVE PATH/);

const livePrivateConfigResponse=await fetch(liveOrigin+"/api/config",{
  method:"POST",
  headers:{"content-type":"application/json"},
  body:JSON.stringify({
    source:{
      kind:"aiometadata",
      manifestUrl:"https://story-order-test-aiometadata.elfhosted.cc/stremio/12345678-1234-1234-1234-123456789abc/eyJwcm9maWxlIjoic2FmZSJ9/manifest.json"
    }
  })
});
assert.equal(
  livePrivateConfigResponse.status,
  200,
  "live Story Order Worker does not yet accept the current private ElfHosted AIOMetadata manifest contract"
);
const livePrivateConfig=await livePrivateConfigResponse.json();
assert.match(livePrivateConfig.token||"",/^v2\./);

const popular=await get("/catalog/series/top.json");
assert.ok(Array.isArray(popular.metas)&&popular.metas.length>0);

for(const path of ["/manifest.json","/meta/series/tt0436992.json","/catalog/series/top.json"]){
  const response=await worker.fetch(new Request(`https://story.test${path}`,{method:"HEAD"}),env,ctx);
  assert.equal(response.status,200);
  assert.equal((await response.text()).length,0);
}

let hintedSeries=0;
for(const id of ["tt0436992","tt0118363"]){
  const wrapped=await get("/meta/series/"+id+".json");
  const upstreamResponse=await fetch("https://v3-cinemeta.strem.io/meta/series/"+id+".json",{cache:"no-store"});
  assert.equal(upstreamResponse.status,200);
  const upstream=await upstreamResponse.json();
  assert.deepEqual(watchedIdentityOrder(wrapped.meta.videos),watchedIdentityOrder(upstream.meta.videos));
  assert.deepEqual(wrapped.meta.videos,upstream.meta.videos);
  const dbg=await get("/_story/debug/series/"+id+".json");
  assert.ok(["stable-id-story-order-hint","canonical-video-passthrough"].includes(dbg.mode));
  if(dbg.mode==="stable-id-story-order-hint"){
    hintedSeries++;
    assert.equal(dbg.reason,"PRESENTATION_ORDER_PUBLISHED_WITH_CANONICAL_IDENTITIES");
    assert.equal(wrapped.meta.behaviorHints?.storyOrderVersion,1);
    assert.deepEqual(wrapped.meta.behaviorHints?.storyOrder,dbg.storyOrder);
    assert.ok(Array.isArray(dbg.storyOrder)&&dbg.storyOrder.length>0);
    for(const item of dbg.inserted||[]){
      assert.match(String(item.reason||""),/^(provider-|full-length-date-runtime-inference|manual-override)/);
      assert.ok(["high","medium","low","manual","inferred"].includes(item.confidence));
    }
  }else{
    assert.equal(dbg.reason,"CANONICAL_VIDEO_COORDINATES_PRESERVED");
  }
}
assert.ok(hintedSeries>=1,"live Story Order should publish at least one validated stable-ID narrative sequence");

const movie=await get("/meta/movie/tt0133093.json");
assert.equal(movie.meta.name,"The Matrix");

console.log("PASS: Story Order live stable-ID safety integration suite");
