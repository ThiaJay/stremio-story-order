import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { encodeConfig, decodeConfig, normalizeConfig } from "./config-token.js";
import { resolveSource } from "./source-registry.js";
import { fetchJsonResilient, assertResourcePath, readJsonResponse, cinemetaCatalogRedirect } from "./upstream.js";
import { configurationPage } from "./config-page.js";
import { safeTvMazeRedirect } from "./provider.js";

class MemoryKV {
  constructor(){this.map=new Map()}
  async get(key,type){const v=this.map.get(key); return !v?null:type==="json"?JSON.parse(v):v}
  async put(key,value){this.map.set(key,value)}
}
const secret=Buffer.alloc(32,7).toString("base64url");
const env={CONFIG_SECRET:secret,STORY_CACHE:new MemoryKV()};

const cfg=normalizeConfig({
  source:{kind:"aiometadata",manifestUrl:"https://demo-aiometadata.elfhosted.com/stremio/12345678-1234-1234-1234-123456789abc/manifest.json"},
  order:{profile:"balanced",includeInsignificant:true},
  overrides:{tt1234567:{exclude:["tt1234567:0:8"],include:[{id:"tt1234567:0:9",targetSeason:2}]}}
});
resolveSource(cfg.source,env);
const token=await encodeConfig(cfg,env);
assert.ok(token.startsWith("v2."));
assert.ok(!token.includes("elfhosted"));
assert.deepEqual(await decodeConfig(token,env),cfg);
await assert.rejects(()=>decodeConfig(token.slice(0,-2)+"xx",env),/Invalid configuration token/);

assert.equal(resolveSource({kind:"cinemeta"},env).kind,"cinemeta");
for (const manifestUrl of [
  "https://aiometadata.elfhosted.com/stremio/12345678-1234-1234-1234-123456789abc/manifest.json",
  "https://paid-user-aiometadata.elfhosted.com/stremio/12345678-1234-1234-1234-123456789abc/manifest.json",
  "https://paid-user-aiometadata.elfhosted.cc/stremio/12345678-1234-1234-1234-123456789abc/manifest.json",
  "https://paid-user-aiometadata.elfhosted.wine/stremio/MyAlias/manifest.json",
  "https://paid-user-aiometadata.elfhosted.cafe/stremio/12345678-1234-1234-1234-123456789abc/eyJwcm9maWxlIjoiYmFsYW5jZWQifQ/manifest.json"
]) {
  assert.equal(resolveSource({kind:"aiometadata",manifestUrl},env).kind,"aiometadata");
}
for (const manifestUrl of [
  "https://paid-user-aiometadata.elfhosted.com.evil.example/stremio/12345678-1234-1234-1234-123456789abc/manifest.json",
  "https://paid-user-other.elfhosted.com/stremio/12345678-1234-1234-1234-123456789abc/manifest.json",
  "https://paid-user-aiometadata.elfhosted.invalid/stremio/12345678-1234-1234-1234-123456789abc/manifest.json",
  "https://paid-user-aiometadata.elfhosted.com/stremio/a/b/c/manifest.json",
  "https://paid-user-aiometadata.elfhosted.com/stremio/a%2Fb/manifest.json"
]) {
  assert.throws(()=>resolveSource({kind:"aiometadata",manifestUrl},env),/valid ElfHosted AIOMetadata|Stremio manifest/);
}
assert.throws(()=>resolveSource({kind:"aiometadata",manifestUrl:"http://demo-aiometadata.elfhosted.com/stremio/x/manifest.json"},env),/HTTPS/);
assert.throws(()=>resolveSource({kind:"custom",manifestUrl:"https://127.0.0.1/manifest.json"},{ENABLE_CUSTOM_UPSTREAM:"true",ALLOWED_UPSTREAM_HOSTS:"127.0.0.1"}),/Local and IP/);
assert.throws(()=>resolveSource({kind:"custom",manifestUrl:"https://addons.example.com/manifest.json"},env),/does not allow/);const custom=resolveSource(
  {kind:"custom",manifestUrl:"https://addons.example.com/user/manifest.json"},
  {ENABLE_CUSTOM_UPSTREAM:"true",ALLOWED_UPSTREAM_HOSTS:"addons.example.com"}
);
assert.equal(custom.root,"https://addons.example.com/user");
assert.throws(()=>assertResourcePath("/meta/series/../../secret.json"),/Unsupported/);
assert.throws(()=>assertResourcePath("/admin/secrets.json"),/Unsupported/);

const cinemaSource={kind:"cinemeta"};
const goodCinemaRedirect=new Response(null,{status:307,headers:{location:"https://cinemeta-catalogs.strem.io/top/catalog/series/top.json"}});
assert.equal(
  cinemetaCatalogRedirect(cinemaSource,"/catalog/series/top.json","",goodCinemaRedirect),
  "https://cinemeta-catalogs.strem.io/top/catalog/series/top.json"
);
for(const location of [
  "http://cinemeta-catalogs.strem.io/top/catalog/series/top.json",
  "https://evil.example/top/catalog/series/top.json",
  "https://cinemeta-catalogs.strem.io/wrong/catalog/series/top.json",
  "https://"+"user:pass"+"@"+"cinemeta-catalogs.strem.io/top/catalog/series/top.json"
]){
  assert.equal(cinemetaCatalogRedirect(cinemaSource,"/catalog/series/top.json","",new Response(null,{status:307,headers:{location}})),null);
}

assert.equal(
  safeTvMazeRedirect(new Response(null,{status:301,headers:{location:"https://api.tvmaze.com/shows/210"}})),
  "https://api.tvmaze.com/shows/210"
);
for(const location of [
  "http://api.tvmaze.com/shows/210",
  "https://evil.example/shows/210",
  "https://api.tvmaze.com/search?q=x",
  "https://"+"user:pass"+"@"+"api.tvmaze.com/shows/210",
  "https://api.tvmaze.com/shows/210?x=1"
]){
  assert.equal(safeTvMazeRedirect(new Response(null,{status:301,headers:{location}})),null);
}

const source={kind:"custom",manifestUrl:"https://source.example/manifest.json",root:"https://source.example"};
const payload={meta:{id:"tt1234567",name:"Cached"}};
const goodFetch=async()=>new Response(JSON.stringify(payload),{status:200,headers:{"content-type":"application/json"}});
let r=await fetchJsonResilient(source,"/meta/series/tt1234567.json",null,env,null,goodFetch);
assert.equal(r.source,"live"); assert.deepEqual(r.payload,payload);
const downFetch=async()=>new Response("down",{status:503,headers:{"content-type":"text/plain"}});
r=await fetchJsonResilient(source,"/meta/series/tt1234567.json",null,env,null,downFetch);
assert.equal(r.source,"stale-cache"); assert.deepEqual(r.payload,payload);

const noCacheEnv={STORY_CACHE:new MemoryKV()};
const fallbackPayload={meta:{id:"tt7654321",name:"Cinemeta fallback"}};
const fallbackFetch=async url=>String(url).startsWith("https://v3-cinemeta.strem.io")
  ? new Response(JSON.stringify(fallbackPayload),{status:200,headers:{"content-type":"application/json"}})
  : new Response("down",{status:503,headers:{"content-type":"text/plain"}});
r=await fetchJsonResilient(source,"/meta/series/tt7654321.json",null,noCacheEnv,null,fallbackFetch);
assert.equal(r.source,"cinemeta-fallback"); assert.deepEqual(r.payload,fallbackPayload);const redirectFetch=async()=>new Response(null,{status:302,headers:{location:"https://example.org/"}});
r=await fetchJsonResilient(source,"/catalog/series/test.json",null,{STORY_CACHE:new MemoryKV()},null,redirectFetch);
assert.equal(r.source,"failed"); assert.equal(r.status,302);

const oversized=JSON.stringify({data:"x".repeat(6*1024*1024)});
await assert.rejects(
  ()=>readJsonResponse(new Response(oversized,{headers:{"content-type":"application/json"}})),
  /too large/
);

const page=configurationPage({choices:["cinemeta","aiometadata"]});
assert.ok(page.html.includes("Story Order"));
assert.ok(!/<script[^>]+src=/i.test(page.html));
assert.ok(!/google-analytics|segment\.com|plausible\.io/i.test(page.html));
assert.match(page.html,/no Stremio AuthKey/i);
assert.ok([...page.html].every(ch=>ch.charCodeAt(0)<128),"configure page contains non-ASCII UI glyphs");
assert.doesNotMatch(page.html,/\uFFFD|\u00C2|\u00E2/);

console.log("PASS: Story Order security and outage suite");
{
  const privateLikeEnv={STORY_CACHE:new MemoryKV()};
  const catalogPayload={metas:[{id:"tt1",name:"Personal list item"}]};
  const catalogFetch=async()=>new Response(JSON.stringify(catalogPayload),{status:200,headers:{"content-type":"application/json"}});
  let catalogResult=await fetchJsonResilient(source,"/catalog/series/private-list.json",null,privateLikeEnv,null,catalogFetch);
  assert.equal(catalogResult.source,"live");
  assert.equal(privateLikeEnv.STORY_CACHE.map.size,0,"catalog response was persisted");
  catalogResult=await fetchJsonResilient(source,"/catalog/series/private-list.json",null,privateLikeEnv,null,downFetch);
  assert.equal(catalogResult.source,"failed","private catalogue should not be served from persistent stale cache");
}
