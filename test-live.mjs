// Production smoke verifies the accepted live 1.0.33 Story Order contract, continuous hero, optically aligned controls, cinematic example rail, capability status and canonical identity parity.
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
assert.doesNotMatch(liveConfigureHtml,/translateX\(-3px\)/);
assert.match(liveConfigureHtml,/Correct order\. Complete stories\./);
assert.match(liveConfigureHtml,/branding\/v5\/story-order-hero-approved\.webp\?v=1\.0\.33/);
assert.match(liveConfigureHtml,/class="hero-approved"/);
assert.match(liveConfigureHtml,/rel="preload" as="image"/);
assert.doesNotMatch(liveConfigureHtml,/class="hero-tiles"/);
assert.doesNotMatch(liveConfigureHtml,/class="hero-tile"/);
assert.doesNotMatch(liveConfigureHtml,/class="hero-master"/);
assert.match(liveConfigureHtml,/logo\.png\?v=1\.0\.33/);
assert.match(liveConfigureHtml,/Per-series override helper/);
assert.match(liveConfigureHtml,/Add override rule/);
assert.match(liveConfigureHtml,/Advanced override JSON/);
assert.match(liveConfigureHtml,/class="concept-steps"/);
assert.match(liveConfigureHtml,/class="concept-icon"/);
assert.match(liveConfigureHtml,/class="concept-icon-frame"/);
assert.match(liveConfigureHtml,/class="concept-num"><span>1<\/span><\/span>/);
assert.match(liveConfigureHtml,/class="step-num"><span>1<\/span><\/div>/);
assert.match(liveConfigureHtml,/class="profile-icon-frame"/);
assert.match(liveConfigureHtml,/height:68px!important;\s*min-height:68px!important/);
assert.match(liveConfigureHtml,/border-top:2px solid #49cfff!important/);
assert.match(liveConfigureHtml,/transform:translateY\(-50%\) rotate\(45deg\)!important/);
assert.match(liveConfigureHtml,/choice-grid\.profiles \.choice-box:before\{top:23px!important\}/);
assert.match(liveConfigureHtml,/\.sequence-item span\{display:flex!important;align-items:center!important;justify-content:center!important;line-height:normal!important;padding:0!important/);
assert.match(liveConfigureHtml,/concept-num>span\{[\s\S]*line-height:36px!important;[\s\S]*text-align:center!important;[\s\S]*transform:none!important/);
assert.doesNotMatch(liveConfigureHtml,/concept-num>span,.step-num>span[^}]*translateY/);
assert.match(liveConfigureHtml,/\.step-title\{align-items:center\}/);
assert.doesNotMatch(liveConfigureHtml,/class="hero-story-flow"/);
assert.doesNotMatch(liveConfigureHtml,/class="hero-series-label"/);
assert.match(liveConfigureHtml,/aspect-ratio:1114\/305/);
assert.match(liveConfigureHtml,/object-fit:contain!important/);
assert.match(liveConfigureHtml,/concept-step:not\(:last-child\):after\{content:">"/);
assert.match(liveConfigureHtml,/border:0!important;border-radius:0;background:transparent!important/);
assert.match(liveConfigureHtml,/class="flow"/);
assert.match(liveConfigureHtml,/Breaking Bad/);
assert.match(liveConfigureHtml,/class="example-title">Breaking Bad</);
assert.match(liveConfigureHtml,/branding\/v5\/example-story-path\.svg\?v=1\.0\.33/);
assert.doesNotMatch(liveConfigureHtml,/<b>Br<\/b>eaking <b>Ba<\/b>d|bb-mark/);
assert.match(liveConfigureHtml,/Felina/);
assert.match(liveConfigureHtml,/El Camino/);
assert.match(liveConfigureHtml,/sequence-compare/);

const liveHeroMasterResponse=await fetch("https://raw.githubusercontent.com/ThiaJay/stremio-story-order/main/public/branding/v4/story-order-hero-master.svg?v=1.0.33",{cache:"no-store"});
assert.equal(liveHeroMasterResponse.status,200);
const liveHeroMaster=await liveHeroMasterResponse.text();
assert.match(liveHeroMaster,/viewBox="0 0 1000 375"/);
assert.equal((liveHeroMaster.match(/data:image\/webp;base64,/g)||[]).length,5);

const liveContinuousHeroResponse=await fetch("https://raw.githubusercontent.com/ThiaJay/stremio-story-order/main/public/branding/v5/story-order-hero-approved.webp?v=1.0.33",{cache:"no-store"});
assert.equal(liveContinuousHeroResponse.status,200);
const liveContinuousHero=Buffer.from(await liveContinuousHeroResponse.arrayBuffer());
assert.equal(liveContinuousHero.length,64456);
assert.equal(liveContinuousHero.subarray(0,4).toString("ascii"),"RIFF");
assert.equal(liveContinuousHero.subarray(8,12).toString("ascii"),"WEBP");
assert.equal(liveContinuousHero.readUInt32LE(4)+8,liveContinuousHero.length);

const liveExamplePathResponse=await fetch("https://raw.githubusercontent.com/ThiaJay/stremio-story-order/main/public/branding/v5/example-story-path.svg?v=1.0.33",{cache:"no-store"});
assert.equal(liveExamplePathResponse.status,200);
const liveExamplePath=await liveExamplePathResponse.text();
assert.match(liveExamplePath,/viewBox="0 0 390 250"/);
assert.match(liveExamplePath,/M168 228 C214 208/);

const liveGlyphResponse=await fetch("https://raw.githubusercontent.com/ThiaJay/stremio-story-order/main/public/branding/v2/story-order-glyph.svg?v=1.0.33",{cache:"no-store"});
assert.equal(liveGlyphResponse.status,200);
const liveGlyph=await liveGlyphResponse.text();
assert.match(liveGlyph,/transform="translate\(-7 0\)"/);

const liveIconResponse=await fetch("https://raw.githubusercontent.com/ThiaJay/stremio-story-order/main/public/logo.png?v=1.0.33",{cache:"no-store"});
assert.equal(liveIconResponse.status,200);
const liveIconBytes=Buffer.from(await liveIconResponse.arrayBuffer());
assert.equal(liveIconBytes.length,19237,"live compact icon must match the approved master size");
assert.equal(liveIconBytes.subarray(0,8).toString("hex"),"89504e470d0a1a0a","live compact icon must be a PNG");
assert.equal(liveIconBytes.readUInt32BE(16),320);
assert.equal(liveIconBytes.readUInt32BE(20),320);

for(const [name,size] of [["hero-01.webp",8260],["hero-02.webp",7952],["hero-03.webp",7994],["hero-04.webp",7948],["hero-05.webp",8218]]){
 const response=await fetch("https://raw.githubusercontent.com/ThiaJay/stremio-story-order/main/public/branding/v4/"+name+"?v=1.0.33",{cache:"no-store"});
 assert.equal(response.status,200,name+" live status");
 const bytes=Buffer.from(await response.arrayBuffer());
 assert.equal(bytes.length,size,name+" live size");
 assert.equal(bytes.subarray(0,4).toString("ascii"),"RIFF");
 assert.equal(bytes.subarray(8,12).toString("ascii"),"WEBP");
 assert.equal(bytes.readUInt32LE(4)+8,bytes.length,name+" live RIFF length");
}

const legacyHeroResponse=await fetch("https://raw.githubusercontent.com/ThiaJay/stremio-story-order/main/public/branding/v2/story-order-order-flow.svg?v=1.0.33",{cache:"no-store"});
assert.equal(legacyHeroResponse.status,200);
const legacyHero=await legacyHeroResponse.text();
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
