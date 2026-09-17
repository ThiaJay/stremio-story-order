import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import worker, { configuredManifest } from "./worker.js";

const env={CONFIG_SECRET:Buffer.alloc(32,9).toString("base64url")};
const ctx={waitUntil(p){p.catch(()=>{})}};

const claimed= configuredManifest({id:"upstream",name:"Upstream"},{label:"test"});
assert.equal(claimed.stremioAddonsConfig?.issuer,"https://stremio-addons.net");
assert.match(claimed.stremioAddonsConfig?.signature||"",/^eyJ/);

let response=await worker.fetch(new Request("https://story.test/configure"),env,ctx);
assert.equal(response.status,200);
assert.match(response.headers.get("content-security-policy"),/default-src 'none'/);
const html=await response.text();
assert.match(html,/Cinemeta - simplest/);
assert.match(html,/AIOMetadata/);
assert.match(html,/class="hero"/);
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

response=await worker.fetch(new Request("https://story.test/manifest.json",{method:"POST"}),env,ctx);
assert.equal(response.status,405);
response=await worker.fetch(new Request("https://story.test/not-a-route"),env,ctx);
assert.equal(response.status,404);

console.log("PASS: Story Order Worker configuration/API suite");