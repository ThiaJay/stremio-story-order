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
const canonicalIcon="https://raw.githubusercontent.com/ThiaJay/stremio-story-order/main/public/logo.png?v=1.0.24";
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
const heroTiles=[
  ["hero-01.webp",8260,"1b6665edbf79458b31046698d2575b8c38139012"],
  ["hero-02.webp",7952,"f7ca4bd23bf0e2f1b610a9177dbe6c2b53329f8c"],
  ["hero-03.webp",7994,"585d1b40ab70cd16fce3603398394f3d37e5ff04"],
  ["hero-04.webp",7948,"11b41b85a19f4600949f8840fd044eebc31fd711"],
  ["hero-05.webp",8607,"7d00fdb9e00cfc27607f3f4dd8909fc2487f05c3"]
];
for(const [name,size,sha] of heroTiles){
 const bytes=await readFile(new URL("./public/branding/v4/"+name,import.meta.url));
 assert.equal(bytes.length,size,name+" size");
 assert.equal(bytes.subarray(0,4).toString("ascii"),"RIFF",name+" must be WebP");
 assert.equal(bytes.subarray(8,12).toString("ascii"),"WEBP",name+" must be WebP");
 const actual=createHash("sha1").update(Buffer.from(`blob ${bytes.length}\0`)).update(bytes).digest("hex");
 assert.equal(actual,sha,name+" bytes must match approved Breaking Bad journey tile");
}

let response=await worker.fetch(new Request("https://story.test/configure"),env,ctx);
assert.equal(response.status,200);
assert.match(response.headers.get("content-security-policy"),/default-src 'none'/);
const csp=response.headers.get("content-security-policy");
assert.equal(csp.split("; ").find(rule=>rule.startsWith("img-src ")),"img-src 'self' data: "+brandPublicBase+"/");
assert.match(csp,/script-src 'nonce-[^']+'/);
assert.match(csp,/frame-ancestors 'none'/);
const html=await response.text();
assert.ok(html.includes('<img src="'+canonicalIcon+'" alt="Story Order logo"'));
assert.doesNotMatch(html,/<svg viewBox="0 0 96 96"/);
assert.match(html,/Correct order\. Complete stories\./);
assert.match(html,/branding\/v4\/hero-01\.webp\?v=1\.0\.24/);
assert.match(html,/branding\/v4\/hero-05\.webp\?v=1\.0\.24/);
assert.match(html,/class="hero-tiles"/);
assert.doesNotMatch(html,/Pick a show/i);
assert.match(html,/Story Order \| Puts TV episodes, specials and one-offs in the right watch order\./);
assert.match(html,/Cinemeta - simplest/);
assert.match(html,/AIOMetadata/);
assert.match(html,/class="hero hero-refresh"/);
assert.match(html,/class="concept-steps"/);
assert.match(html,/class="flow"/);
assert.match(html,/Breaking Bad/);
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