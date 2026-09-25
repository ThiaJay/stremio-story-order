import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import worker, { configuredManifest, serviceStatus } from "./worker.js";

const env={CONFIG_SECRET:Buffer.alloc(32,9).toString("base64url")};
const ctx={waitUntil(p){p.catch(()=>{})}};

const claimed= configuredManifest({id:"upstream",name:"Upstream"},{label:"test"});
assert.equal(claimed.stremioAddonsConfig?.issuer,"https://stremio-addons.net");
assert.match(claimed.stremioAddonsConfig?.signature||"",/^eyJ/);

const packageVersion=JSON.parse(await readFile(new URL("./package.json",import.meta.url),"utf8")).version;
const workerSource=await readFile(new URL("./worker.js",import.meta.url),"utf8");
assert.doesNotMatch(
  workerSource,
  /\bintegrateStoryOrder\s*\(/,
  "hosted Worker must not activate coordinate relocation"
);
assert.match(
  workerSource,
  /storyOrderVersion:\s*1/,
  "hosted Worker should publish only the versioned stable-ID presentation hint"
);
assert.equal(claimed.version,packageVersion);
const directStatus=serviceStatus("cinemeta");
assert.equal(directStatus.version,packageVersion);
assert.equal(directStatus.status,"live");
assert.equal(directStatus.storyOrderContract.version,1);
assert.equal(directStatus.storyOrderContract.canonicalVideoCoordinatesPreserved,true);
assert.equal(directStatus.storyOrderContract.canonicalVideoIdsPreserved,true);
assert.equal(directStatus.storyOrderContract.watchedIdentityMutation,false);
assert.equal(directStatus.privacy.stremioAuthKeyRequired,false);
assert.equal(directStatus.privacy.accountAccess,false);
const canonicalIcon="https://raw.githubusercontent.com/ThiaJay/stremio-story-order/main/public/logo.png?v=1.0.32";
const brandPublicBase="https://raw.githubusercontent.com/ThiaJay/stremio-story-order/main/public";
const brandAssetBase=brandPublicBase+"/branding/v2";
assert.equal(claimed.logo,canonicalIcon);
assert.equal(claimed.background,"https://raw.githubusercontent.com/ThiaJay/stremio-story-order/main/public/background.jpg");
assert.match(claimed.description,/^Puts TV episodes, specials and one-offs in the right watch order\./);
for(const [alias,canonical] of [["logo.png","branding/app-icon.png"],["background.jpg","branding/marketplace-background.jpg"]]){
 const [a,b]=await Promise.all([readFile(new URL("./public/"+alias,import.meta.url)),readFile(new URL("./public/"+canonical,import.meta.url))]);
 assert.deepEqual(a,b,alias+" must match the canonical release asset");
}
const iconBytes=await readFile(new URL("./public/logo.png",import.meta.url));
assert.equal(iconBytes.subarray(0,8).toString("hex"),"89504e470d0a1a0a","logo must be a real PNG");
assert.equal(iconBytes.readUInt32BE(16),320,"logo width must preserve the approved compact master");
assert.equal(iconBytes.readUInt32BE(20),320,"logo height must preserve the approved compact master");
const iconGitBlobSha=createHash("sha1")
  .update(Buffer.from(`blob ${iconBytes.length}\0`))
  .update(iconBytes)
  .digest("hex");
assert.equal(
  iconGitBlobSha,
  "ed91dc7c10b5454482e562c4d085effc7d0e0bc0",
  "checked-out logo bytes must match the approved compact master"
);
const glyph=await readFile(new URL("./public/branding/v2/story-order-glyph.svg",import.meta.url),"utf8");
assert.match(glyph,/transform="translate\(-7 0\)"/,"vector glyph must use the same optical centring as the canonical PNG");
const sourceIcon=await readFile(new URL("./public/branding/v2/step-1-source.svg",import.meta.url),"utf8");
assert.match(sourceIcon,/ellipse cx="32" cy="18"/,"source step icon must use the centred database master");
const continuousHero=await readFile(new URL("./public/branding/v5/story-order-hero-approved.webp",import.meta.url));
assert.equal(continuousHero.length,64456,"approved continuous hero size");
assert.equal(continuousHero.subarray(0,4).toString("ascii"),"RIFF");
assert.equal(continuousHero.subarray(8,12).toString("ascii"),"WEBP");
assert.equal(continuousHero.readUInt32LE(4)+8,continuousHero.length,"continuous hero RIFF length");
const continuousHeroGitBlobSha=createHash("sha1").update(Buffer.from(`blob ${continuousHero.length}\0`)).update(continuousHero).digest("hex");
assert.equal(continuousHeroGitBlobSha,"0382c90fc2835027cd25296feac4b57339eafa2d","continuous hero bytes must match the approved master");
const examplePath=await readFile(new URL("./public/branding/v5/example-story-path.svg",import.meta.url),"utf8");
assert.match(examplePath,/viewBox="0 0 390 250"/);
assert.match(examplePath,/id="path"/);
assert.match(examplePath,/M168 228 C214 208/);
assert.equal((examplePath.match(/<rect/g)||[]).length>=4,true,"example rail visual must include framed story cards");
const heroTiles=[
  ["hero-01.webp",8260,"1b6665edbf79458b31046698d2575b8c38139012"],
  ["hero-02.webp",7952,"f7ca4bd23bf0e2f1b610a9177dbe6c2b53329f8c"],
  ["hero-03.webp",7994,"585d1b40ab70cd16fce3603398394f3d37e5ff04"],
  ["hero-04.webp",7948,"11b41b85a19f4600949f8840fd044eebc31fd711"],
  ["hero-05.webp",8218,"d975842db2e1a9e487cb1cfd2a71dcc2739e5da6"]
];
for(const [name,size,sha] of heroTiles){
 const bytes=await readFile(new URL("./public/branding/v4/"+name,import.meta.url));
 assert.equal(bytes.length,size,name+" size");
 assert.equal(bytes.subarray(0,4).toString("ascii"),"RIFF",name+" must be WebP");
 assert.equal(bytes.subarray(8,12).toString("ascii"),"WEBP",name+" must be WebP");
 assert.equal(bytes.readUInt32LE(4)+8,bytes.length,name+" RIFF length must match the actual file length");
 const actual=createHash("sha1").update(Buffer.from(`blob ${bytes.length}\0`)).update(bytes).digest("hex");
 assert.equal(actual,sha,name+" bytes must match approved Breaking Bad journey tile");
}

const heroMaster=await readFile(new URL("./public/branding/v4/story-order-hero-master.svg",import.meta.url),"utf8");
assert.match(heroMaster,/viewBox="0 0 1000 375"/);
assert.equal((heroMaster.match(/data:image\/webp;base64,/g)||[]).length,5,"hero master must embed all five journey tiles");
assert.doesNotMatch(heroMaster,/raw\.githubusercontent\.com/,"hero master must not depend on five separate browser image requests");

let response=await worker.fetch(new Request("https://story.test/configure"),env,ctx);
assert.equal(response.status,200);
assert.match(response.headers.get("content-security-policy"),/default-src 'none'/);
const csp=response.headers.get("content-security-policy");
assert.equal(csp.split("; ").find(rule=>rule.startsWith("img-src ")),"img-src 'self' data: "+brandPublicBase+"/");
assert.match(csp,/script-src 'nonce-[^']+'/);
assert.match(csp,/frame-ancestors 'none'/);
const html=await response.text();
assert.doesNotMatch(html,/translateX\(-3px\)/,"configure page must not apply a second icon offset");
assert.ok(html.includes('<img src="'+canonicalIcon+'" alt="Story Order logo"'));
assert.doesNotMatch(html,/<svg viewBox="0 0 96 96"/);
assert.match(html,/Correct order\. Complete stories\./);
assert.match(html,/branding\/v5\/story-order-hero-approved\.webp\?v=1\.0\.32/);
assert.match(html,/class="hero-approved"/);
assert.match(html,/rel="preload" as="image"/);
assert.doesNotMatch(html,/class="hero-tiles"/);
assert.doesNotMatch(html,/class="hero-tile"/);
assert.doesNotMatch(html,/class="hero-master"/);
assert.doesNotMatch(html,/Pick a show/i);
assert.match(html,/Story Order \| Puts TV episodes, specials and one-offs in the right watch order\./);
assert.match(html,/Cinemeta - simplest/);
assert.match(html,/AIOMetadata/);
assert.match(html,/class="hero hero-production hero-continuous"/);
assert.doesNotMatch(html,/class="hero-story-flow"/);
assert.doesNotMatch(html,/class="hero-series-label"/);
assert.match(html,/aspect-ratio:1114\/305/);
assert.match(html,/object-fit:contain!important/);
assert.doesNotMatch(html,/hero-art-ready/);
assert.match(html,/class="concept-steps"/);
assert.match(html,/class="concept-icon"/);
assert.match(html,/class="concept-icon-frame"/);
assert.match(html,/class="concept-num"><span>1<\/span><\/span>/);
assert.match(html,/class="step-num"><span>1<\/span><\/div>/);
assert.match(html,/class="profile-icon-frame"/);
assert.match(html,/\.concept-num,.step-num,.concept-icon-frame\{align-self:center!important;justify-self:center!important;transform:none!important\}/);
assert.match(html,/\.sequence-item span\{display:flex!important;align-items:center!important;justify-content:center!important;line-height:normal!important;padding:0!important/);
assert.match(html,/concept-num>span,.step-num>span\{display:block;line-height:1/);
assert.match(html,/concept-num>span,.step-num>span\{display:flex!important;width:100%;height:100%;align-items:center!important;justify-content:center!important;line-height:normal!important;transform:none!important/);
assert.doesNotMatch(html,/concept-num>span,.step-num>span[^}]*translateY/);
assert.match(html,/\.concept-icon-frame\{display:grid;width:36px;height:36px;place-items:center/);
assert.match(html,/\.step-title\{align-items:center\}/);
assert.match(html,/concept-step:not\(:last-child\):after\{content:">"/,"setup strip should use one consistent directional cue");
assert.match(html,/border:0!important;border-radius:0;background:transparent!important/,"release override must neutralise legacy internal dividers");
assert.match(html,/class="flow"/);
assert.match(html,/Breaking Bad/);
assert.match(html,/class="example-title">Breaking Bad</);
assert.match(html,/branding\/v5\/example-story-path\.svg\?v=1\.0\.32/);
assert.match(html,/\.breaking-card:before\{content:"";position:absolute;inset:0/);
assert.doesNotMatch(html,/<b>Br<\/b>eaking <b>Ba<\/b>d|bb-mark/,"series example must use Story Order styling rather than the programme title treatment");
assert.match(html,/S05E16/);
assert.match(html,/Felina/);
assert.match(html,/El Camino/);
assert.match(html,/sequence-compare/);
assert.match(html,/CSS_APPROVED_CONCEPT|Breaking Bad/);
assert.doesNotMatch(html,/Doctor Who/);
assert.match(html,/class="topbar"/);
assert.match(html,/class="concept-steps"/);
assert.match(html,/Install on Stremio/);
assert.match(html,/Breaking Bad/);
assert.doesNotMatch(html,/Doctor Who/);
assert.match(html,/name="sourceKind"/);
assert.match(html,/name="profile"/);
assert.match(html,/Install Story Order/);
assert.doesNotMatch(html,/type="password"/);

const config={source:{kind:"cinemeta"},order:{profile:"safe"},overrides:{}};
response=await worker.fetch(new Request("https://story.test/api/config",{
  method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(config)
}),env,ctx);
assert.equal(response.status,200);
const made=await response.json();
assert.match(made.token,/^v2\./);
assert.equal(made.manifestUrl,`https://story.test/${made.token}/manifest.json`);
assert.equal(made.installUrl,`stremio://story.test/${made.token}/manifest.json`);

response=await worker.fetch(new Request(`https://story.test/api/config/${made.token}`),env,ctx);
assert.equal(response.status,200);
const decoded=await response.json();
assert.equal(decoded.source.kind,"cinemeta");
assert.equal(decoded.order.profile,"safe");response=await worker.fetch(new Request(`https://story.test/${made.token}/configure`),env,ctx);
assert.equal(response.status,200);
assert.match(await response.text(),new RegExp(made.token.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")));

response=await worker.fetch(new Request("https://story.test/api/config",{
  method:"POST",headers:{"content-type":"application/json"},
  body:JSON.stringify({source:{kind:"custom",manifestUrl:"https://addons.example.com/manifest.json"}})
}),env,ctx);
assert.equal(response.status,400);

response=await worker.fetch(new Request("https://story.test/_story/status.json"),env,ctx);
assert.equal(response.status,200);
assert.match(response.headers.get("cache-control"),/max-age=60/);
const statusPayload=await response.json();
assert.equal(statusPayload.version,packageVersion);
assert.equal(statusPayload.source,"cinemeta");
assert.equal(statusPayload.storyOrderContract.representation,"stable-video-id-presentation-hint");

response=await worker.fetch(new Request("https://story.test/_story/status.json",{method:"HEAD"}),env,ctx);
assert.equal(response.status,200);
assert.equal((await response.text()).length,0);

response=await worker.fetch(new Request("https://story.test/manifest.json",{method:"POST"}),env,ctx);
assert.equal(response.status,405);
response=await worker.fetch(new Request("https://story.test/not-a-route"),env,ctx);
assert.equal(response.status,404);

console.log("PASS: Story Order Worker configuration/API suite");