function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[ch]);
}

export function configurationPage({ token = "", choices = ["cinemeta", "aiometadata"] } = {}) {
  const nonce = crypto.randomUUID().replace(/-/g, "");
  const custom = choices.includes("custom") ? '<option value="custom">Custom metadata addon (advanced)</option>' : "";
  const initialToken = escapeHtml(token);
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="referrer" content="no-referrer"><title>Story Order — Stremio addon</title>
<style>
:root{font-family:system-ui,sans-serif;color-scheme:light dark}body{max-width:780px;margin:40px auto;padding:0 18px;line-height:1.45}
fieldset{border:1px solid #8886;border-radius:12px;padding:18px;margin:18px 0}label{display:block;margin:10px 0}input,select,textarea,button{font:inherit}
input[type=url],select,textarea{box-sizing:border-box;width:100%;padding:9px;border:1px solid #8888;border-radius:8px}textarea{min-height:120px}
.row{display:grid;grid-template-columns:1fr 1fr;gap:14px}.check{display:flex;gap:9px;align-items:flex-start}.check input{margin-top:5px}
button,.install{display:inline-block;padding:10px 16px;border-radius:9px;border:0;text-decoration:none;cursor:pointer}.muted{opacity:.72}.warn{padding:10px;border-left:4px solid #d88}.hidden{display:none}code{overflow-wrap:anywhere}
@media(max-width:600px){.row{grid-template-columns:1fr}}
</style></head><body data-token="${initialToken}">
<h1>Story Order</h1>
<p><strong>Puts TV episodes, specials and one-offs in the right watch order.</strong></p>
<p>Fixes TV episode order in Stremio. Story Order places specials, feature-length one-offs and other misplaced episodes where they belong so they appear and autoplay in the proper sequence.</p>
<p class="muted">Story Order only changes metadata ordering. It works independently of Torrentio, AIOStreams, Maelstrom and other stream addons.</p>`;
  return { html: html + pageBody(custom, nonce), nonce };
}function pageBody(customOption, nonce) {
  return `<form id="configForm">
<fieldset><legend>1. Metadata source</legend>
<label>Source<select id="sourceKind"><option value="cinemeta">Cinemeta — simplest, no extra setup</option><option value="aiometadata">AIOMetadata — use my existing configured manifest</option>${customOption}</select></label>
<label id="manifestRow" class="hidden">Metadata addon manifest URL<input id="manifestUrl" type="url" inputmode="url" autocomplete="off" placeholder="https://…/manifest.json"></label>
<p class="muted">Your source URL is encrypted into the install URL. Story Order does not store it in a database.</p>
</fieldset>
<fieldset><legend>2. Ordering profile</legend>
<label>Profile<select id="profile"><option value="safe">Safe — full-length story episodes only</option><option value="balanced">Balanced — also include provider-confirmed significant short-form episodes</option><option value="complete">Complete story — include all provider-confirmed short-form story extras</option><option value="custom">Custom</option></select></label>
<label>Short-form handling<select id="shortForm"><option value="exclude">Keep minisodes/prequels in Specials</option><option value="significant">Insert provider-confirmed significant short-form story entries</option><option value="all">Insert all provider-confirmed short-form entries allowed below</option></select></label>
<div class="warn">Short-form material can stop autoplay when none of your stream addons has a playable copy. Safe is recommended for most people.</div>
<label class="check"><input id="fullLength" type="checkbox" checked><span>Insert full-length story specials and one-offs into the normal sequence</span></label>
<label class="check"><input id="providerRegularRepairs" type="checkbox" checked><span>Repair normal episodes that a metadata source has incorrectly placed in Season 0</span></label>
<label class="check"><input id="upstreamFallback" type="checkbox" checked><span>Use conservative date/runtime inference if the ordering provider is unavailable</span></label>
<label class="check"><input id="includeInsignificant" type="checkbox"><span>Include provider-labelled insignificant specials <strong>(advanced)</strong></span></label>
<label class="check"><input id="includeNonStory" type="checkbox"><span>Allow documentaries, making-of programmes and other non-story extras <strong>(advanced)</strong></span></label>
</fieldset>
<details><summary>Advanced matching and manual overrides</summary>
<fieldset><div class="row"><label>Minimum runtime ratio<input id="minRuntimeRatio" type="number" min="0.2" max="1" step="0.05" value="0.5"></label><label>Minimum full-length minutes<input id="minFullLengthMinutes" type="number" min="3" max="180" step="1" value="20"></label></div>
<label class="check"><input id="includeFuture" type="checkbox"><span>Reorder unaired/future entries too</span></label>
<label>Per-series override JSON<textarea id="overrides" spellcheck="false" placeholder='{"tt1234567":{"exclude":["tt1234567:0:4"],"include":[{"id":"tt1234567:0:7","targetSeason":3}]}}'></textarea></label>
<p class="muted">Overrides are optional and remain inside the encrypted configuration token. IDs are preserved; overrides cannot create a new video that the metadata source does not already expose.</p></fieldset></details>
<button type="submit">Create install link</button> <span id="status" class="muted"></span>
<section id="result" class="hidden"><h2>Ready</h2><p><a id="install" class="install">Install in Stremio</a></p><p>Manifest URL: <code id="manifestOut"></code></p><button id="copy" type="button">Copy manifest URL</button></section>
</form>
<hr><p class="muted">Privacy: no Stremio AuthKey, no account credentials and no analytics. TVmaze is used as an ordering enrichment source; cached or upstream-only inference is used during outages.</p>
<script nonce="${nonce}">${clientScript()}</script></body></html>`;
}function clientScript() {
  return `
const $=id=>document.getElementById(id);
const form=$("configForm"), sourceKind=$("sourceKind"), manifestRow=$("manifestRow"), profile=$("profile");
function sourceVisibility(){manifestRow.classList.toggle("hidden",sourceKind.value==="cinemeta")}
function applyProfile(){
  const p=profile.value;
  if(p==="safe"){ $("shortForm").value="exclude"; $("minRuntimeRatio").value="0.5"; $("minFullLengthMinutes").value="20"; }
  if(p==="balanced"){ $("shortForm").value="significant"; $("minRuntimeRatio").value="0.45"; $("minFullLengthMinutes").value="15"; }
  if(p==="complete"){ $("shortForm").value="all"; $("minRuntimeRatio").value="0.35"; $("minFullLengthMinutes").value="8"; }
}
sourceKind.addEventListener("change",sourceVisibility); profile.addEventListener("change",applyProfile); sourceVisibility(); applyProfile();
function setConfig(c){
  sourceKind.value=c.source?.kind||"cinemeta"; $("manifestUrl").value=c.source?.manifestUrl||""; sourceVisibility();
  const o=c.order||{}; profile.value=o.profile||"safe"; $("fullLength").checked=o.fullLength!==false;
  $("shortForm").value=o.shortForm||"exclude"; $("providerRegularRepairs").checked=o.providerRegularRepairs!==false;
  $("upstreamFallback").checked=o.upstreamFallback!==false; $("includeInsignificant").checked=o.includeInsignificant===true;
  $("includeNonStory").checked=o.includeNonStory===true; $("minRuntimeRatio").value=o.minRuntimeRatio??0.5;
  $("minFullLengthMinutes").value=o.minFullLengthMinutes??20; $("includeFuture").checked=o.future==="include";
  $("overrides").value=Object.keys(c.overrides||{}).length?JSON.stringify(c.overrides,null,2):"";
}
async function loadExisting(){
  const token=document.body.dataset.token; if(!token)return;
  try{const r=await fetch("/api/config/"+encodeURIComponent(token)); if(r.ok)setConfig(await r.json());}catch{}
}
loadExisting();
form.addEventListener("submit",async e=>{
  e.preventDefault(); $("status").textContent="Creating…"; $("result").classList.add("hidden");
  let overrides={};
  try{const text=$("overrides").value.trim(); if(text) overrides=JSON.parse(text);}catch{ $("status").textContent="Override JSON is invalid"; return; }
  const source={kind:sourceKind.value}; if(source.kind!=="cinemeta")source.manifestUrl=$("manifestUrl").value.trim();
  const payload={source,order:{
    profile:profile.value,fullLength:$("fullLength").checked,shortForm:$("shortForm").value,
    includeInsignificant:$("includeInsignificant").checked,includeNonStory:$("includeNonStory").checked,
    providerRegularRepairs:$("providerRegularRepairs").checked,upstreamFallback:$("upstreamFallback").checked,
    minRuntimeRatio:Number($("minRuntimeRatio").value),minFullLengthMinutes:Number($("minFullLengthMinutes").value),
    future:$("includeFuture").checked?"include":"leave"},overrides};
  try{
    const r=await fetch("/api/config",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload)});
    const data=await r.json(); if(!r.ok)throw new Error(data.error||"Configuration failed");
    $("manifestOut").textContent=data.manifestUrl; $("install").href=data.installUrl;
    $("result").classList.remove("hidden"); $("status").textContent="";
  }catch(err){$("status").textContent=err.message||String(err)}
});
$("copy").addEventListener("click",()=>navigator.clipboard.writeText($("manifestOut").textContent));`; 
}
