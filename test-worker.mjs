import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
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
const canonicalIcon="https://raw.githubusercontent.com/ThiaJay/stremio-story-order/main/public/logo.png";
const brandAssetBase="https://raw.githubusercontent.com/ThiaJay/stremio-story-order/main/public/branding/v2";
assert.equal(claimed.logo,canonicalIcon);
assert.equal(claimed.background,"https://raw.githubusercontent.com/ThiaJay/stremio-story-order/main/public/background.jpg");
assert.match(claimed.description,/^Puts TV episodes, specials and one-offs in the right watch order\./);
for(const [alias,canonical] of [["logo.png","branding/app-icon.png"],["background.jpg","branding/marketplace-background.jpg"]]){
 const [a,b]=await Promise.all([readFile(new URL("./public/"+alias,import.meta.url)),readFile(new URL("./public/"+canonical,import.meta.url))]);
 assert.deepEqual(a,b,alias+" must match the canonical release asset");
}

let response=await worker.fetch(new Request("https://story.test/configure"),env,ctx);
assert.equal(response.status,200);
assert.match(response.headers.get("content-security-policy"),/default-src 'none'/);
const csp=response.headers.get("content-security-policy");
assert.equal(csp.split("; ").find(rule=>rule.startsWith("img-src ")),"img-src 'self' data: "+canonicalIcon+" "+brandAssetBase+"/");
assert.match(csp,/script-src 'nonce-[^']+'/);
assert.match(csp,/frame-ancestors 'none'/);
const html=await response.text();
assert.ok(html.includes('<img src="'+canonicalIcon+'" alt="Story Order logo"'));
assert.doesNotMatch(html,/<svg viewBox="0 0 96 96"/);
assert.match(html,/Correct order\. Complete stories\./);
assert.match(html,/story-order-order-flow\.svg/);
assert.doesNotMatch(html,/Pick a show/i);
assert.match(html,/Story Order \| Puts TV episodes, specials and one-offs in the right watch order\./);
assert.match(html,/Cinemeta - simplest/);
assert.match(html,/AIOMetadata/);
assert.match(html,/class="hero hero-refresh"/);
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