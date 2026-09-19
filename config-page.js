function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[ch]);
}

export const BRAND_ICON_URL = "https://raw.githubusercontent.com/ThiaJay/stremio-story-order/main/public/logo.png";

const CSS = `
:root{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color-scheme:dark;--bg:#071124;--panel:#0d1a33;--panel2:#101f3d;--line:#23365d;--text:#f7f9ff;--muted:#a9b7d3;--cyan:#21d4fd;--blue:#3185ff;--violet:#8a5cf6;--good:#47d7a2;--warn:#f5b94c;--shadow:0 24px 80px #02071399}
*{box-sizing:border-box}html{min-height:100%;background:var(--bg)}body{margin:0;min-height:100%;color:var(--text);line-height:1.5;background:radial-gradient(circle at 14% 4%,#184ca855 0,transparent 28%),radial-gradient(circle at 88% 12%,#7537bd44 0,transparent 30%),linear-gradient(180deg,#071124 0,#09142a 48%,#060d1c 100%)}
body{overflow-x:hidden}body:before{content:"";position:fixed;inset:0;pointer-events:none;opacity:.18;background-image:linear-gradient(115deg,transparent 0 46%,#37c9ff22 47%,transparent 48%),linear-gradient(65deg,transparent 0 64%,#8b5cf622 65%,transparent 66%)}
a{color:#7bdcff}.shell{width:min(1120px,calc(100% - 32px));margin:0 auto;padding:34px 0 52px}
.hero{position:relative;overflow:hidden;border:1px solid #315084;background:linear-gradient(135deg,#0d2a58dd,#101b3aee 56%,#201552dd);border-radius:28px;padding:30px 32px;box-shadow:var(--shadow)}
.hero:after{content:"";position:absolute;width:460px;height:190px;right:-110px;bottom:-125px;border:22px solid #437eff44;border-radius:50%;transform:rotate(-8deg)}
.brand-row{display:flex;gap:22px;align-items:center;position:relative;z-index:1}.brand-row>div:last-child,.step-title>div:last-child{min-width:0}.logo-card{width:92px;height:92px;flex:0 0 auto;border-radius:22px;display:grid;place-items:center;background:linear-gradient(145deg,#0c1830,#142b57);box-shadow:inset 0 0 0 1px #7adfff55,0 12px 35px #03081588}
.logo-card img{width:72px;height:72px;display:block}.eyebrow{color:#8fdfff;text-transform:uppercase;letter-spacing:.18em;font-size:.75rem;font-weight:800;margin:0 0 5px}h1{font-size:clamp(2.3rem,6vw,4.7rem);line-height:.95;margin:0;letter-spacing:-.055em}.strap{font-size:clamp(1.05rem,2.4vw,1.45rem);color:#d8e4fb;margin:12px 0 0;max-width:700px}
.badges{display:flex;flex-wrap:wrap;gap:9px;margin-top:20px}.badge{border:1px solid #42618e;background:#0e203f99;padding:6px 10px;border-radius:999px;color:#c9d9f5;font-size:.82rem}.badge.good{display:inline-flex;align-items:center;gap:7px;color:#8ff2cd;border-color:#3aa77c88;background:#0c332b88}
.ok-mark{display:inline-block;width:7px;height:11px;border:solid currentColor;border-width:0 2px 2px 0;transform:rotate(45deg);flex:0 0 auto}.ok-mark.large{width:8px;height:13px;margin:0 10px 2px 2px}
`;
const CSS_MORE = `
.grid,.panel,.side-stack,form,.section{min-width:0}.grid{display:grid;grid-template-columns:minmax(0,1fr) 330px;gap:22px;margin-top:22px}.panel{background:linear-gradient(180deg,#0d1a33e8,#0a162de8);border:1px solid var(--line);border-radius:22px;box-shadow:0 18px 60px #02071366}.panel-pad{padding:24px}
.quick{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:0 0 22px}.quick-step{position:relative;padding:14px 12px;border:1px solid #2d4775;background:#0b1931;border-radius:14px;color:#c7d5ef;font-size:.85rem}.quick-step b{display:block;color:#fff;margin-bottom:4px}.quick-step span{display:inline-grid;place-items:center;width:24px;height:24px;margin-bottom:8px;border-radius:50%;background:linear-gradient(135deg,var(--cyan),var(--violet));color:#071124;font-weight:900}
.section{padding:22px 24px;border-top:1px solid #1e3154}.section:first-child{border-top:0}.step-title{display:flex;gap:12px;align-items:flex-start;margin-bottom:16px}.step-num{width:34px;height:34px;flex:0 0 auto;display:grid;place-items:center;border-radius:11px;background:linear-gradient(135deg,#159be8,#7657ed);font-weight:900}.step-title h2{font-size:1.12rem;margin:1px 0 3px}.step-title p{margin:0;color:var(--muted);font-size:.9rem}
.choice-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.choice-grid.profiles{grid-template-columns:repeat(4,minmax(0,1fr))}.choice{position:relative;display:block}.choice input{position:absolute;opacity:0;pointer-events:none}.choice-box{display:block;height:100%;padding:15px;border:1px solid #2b426c;background:#0b1830;border-radius:14px;transition:.18s ease;cursor:pointer}.choice-box strong{display:block;color:#fff;margin-bottom:4px}.choice-box small{display:block;color:#aebcd7;line-height:1.35}.choice input:checked+.choice-box{border-color:#5cbcff;background:linear-gradient(145deg,#102b54,#171c49);box-shadow:0 0 0 2px #3e9cff33,inset 0 0 28px #4d65ff18}.choice input:focus-visible+.choice-box{outline:3px solid #a6ddff;outline-offset:2px}.recommended{display:inline-block;margin-top:9px;padding:3px 7px;border-radius:999px;background:#114f42;color:#9af0d1;font-size:.7rem;font-weight:800;text-transform:uppercase;letter-spacing:.05em}
.field{margin-top:14px}.field label{display:block;margin:0 0 6px;font-size:.88rem;color:#c9d5eb}.field input,.field select,.field textarea{width:100%;font:inherit;color:#fff;background:#08152b;border:1px solid #314971;border-radius:11px;padding:10px 12px}.field textarea{min-height:120px;resize:vertical}.hidden{display:none!important}.muted{color:var(--muted)}
.checks{display:grid;gap:10px;margin-top:14px}.check{display:flex;gap:10px;align-items:flex-start;padding:10px 12px;border-radius:12px;background:#09162c;border:1px solid #22375e}.check input{margin-top:4px}.warning{margin-top:14px;padding:12px 14px;border:1px solid #8a612c88;border-left:4px solid var(--warn);border-radius:10px;background:#3a280f55;color:#efd7ad;font-size:.86rem}
`;const CSS_END = `
details{margin-top:14px;border:1px solid #263b64;border-radius:13px;background:#09162c}summary{cursor:pointer;padding:13px 14px;font-weight:750;color:#d7e3fa}details[open] summary{border-bottom:1px solid #263b64}.advanced{padding:14px}.two{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.primary{width:100%;margin-top:18px;padding:14px 18px;border:0;border-radius:13px;background:linear-gradient(100deg,#168cff,#7657ee);color:white;font:inherit;font-weight:850;cursor:pointer;box-shadow:0 10px 32px #2f66ff44}.primary:hover{filter:brightness(1.08)}.primary:focus-visible{outline:3px solid #b9e7ff;outline-offset:3px}
.result{margin-top:16px;padding:18px;border-radius:16px;border:1px solid #3a806d;background:linear-gradient(145deg,#0c302d,#0d2136)}.result h3{margin:0 0 6px;color:#9af0d1}.install{display:inline-block;margin:12px 0;padding:12px 18px;border-radius:11px;background:#fff;color:#0a1730;text-decoration:none;font-weight:900}.manifest{font-size:.78rem;color:#94a8cc;overflow-wrap:anywhere}.copy{padding:7px 10px;border:1px solid #36527f;border-radius:9px;background:#0b1931;color:#dbe7fb;cursor:pointer}
.side-stack{display:grid;gap:16px}.side-card{padding:20px}.side-card h3{margin:0 0 12px}.example{padding:11px 12px;margin-top:9px;border-radius:12px;background:#08152b;border:1px solid #263d66}.episode{display:flex;gap:9px;align-items:center;padding:6px 0;color:#b5c4df}.episode strong{color:#fff}.episode.highlight{color:#8ddfff}.epno{width:30px;text-align:right;color:#6f88b3}.tick{position:relative;margin-left:auto;width:18px;height:18px;color:#7ef0c7;flex:0 0 auto}.tick-ok:before{content:"";position:absolute;left:5px;top:1px;width:6px;height:10px;border:solid currentColor;border-width:0 2px 2px 0;transform:rotate(45deg)}.tick-play:before{content:"";position:absolute;left:5px;top:4px;border-left:8px solid currentColor;border-top:5px solid transparent;border-bottom:5px solid transparent}
.feature-list{display:grid;gap:10px}.feature{display:flex;gap:10px;align-items:flex-start}.feature-icon{position:relative;width:30px;height:30px;border-radius:9px;background:#122a50;color:#8ddfff;flex:0 0 auto}.icon-play:before{content:"";position:absolute;left:11px;top:8px;border-left:9px solid currentColor;border-top:6px solid transparent;border-bottom:6px solid transparent}.icon-link:before,.icon-link:after{content:"";position:absolute;width:11px;height:6px;border:2px solid currentColor;border-radius:6px;transform:rotate(-40deg)}.icon-link:before{left:5px;top:8px}.icon-link:after{left:13px;top:14px}.icon-refresh:before{content:"";position:absolute;inset:7px;border:2px solid currentColor;border-top-color:transparent;border-radius:50%}.icon-refresh:after{content:"";position:absolute;right:5px;top:5px;border-left:5px solid currentColor;border-top:4px solid transparent;border-bottom:4px solid transparent;transform:rotate(-35deg)}.icon-private:before{content:"";position:absolute;left:8px;bottom:6px;width:12px;height:10px;border:2px solid currentColor;border-radius:2px}.icon-private:after{content:"";position:absolute;left:10px;top:5px;width:8px;height:8px;border:2px solid currentColor;border-bottom:0;border-radius:8px 8px 0 0}.feature b{display:block}.feature small{color:var(--muted)}
footer{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-top:20px;padding:0 4px;color:#7f91b2;font-size:.82rem}footer a{color:#9ebeff}.status{display:block;margin-top:10px;color:#ffd397;font-size:.88rem}
@media(max-width:900px){.grid{grid-template-columns:1fr}.side-stack{grid-template-columns:1fr 1fr}.choice-grid.profiles{grid-template-columns:repeat(2,1fr)}}
@media(max-width:620px){.shell{width:min(calc(100% - 20px),1120px);padding-top:14px}.hero{padding:20px 16px;border-radius:20px}.brand-row{align-items:flex-start;gap:13px}.logo-card{width:56px;height:56px;border-radius:15px}.logo-card img{width:44px;height:44px}h1{font-size:2rem}.strap{font-size:1rem}.quick{grid-template-columns:repeat(2,minmax(0,1fr))}.choice-grid,.choice-grid.profiles,.side-stack,.two{grid-template-columns:1fr}.section{padding:20px 16px}.panel-pad{padding:18px}.quick-step,.strap,.step-title,.choice-box,.side-card{overflow-wrap:anywhere}}
`;

function styles() { return CSS + CSS_MORE + CSS_END; }
function pageHtml(initialToken, customOption, nonce) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="referrer" content="no-referrer"><title>Story Order - Stremio addon</title><style>${styles()}</style></head>
<body data-token="${initialToken}"><div class="shell">
<header class="hero"><div class="brand-row"><div class="logo-card"><img src="${BRAND_ICON_URL}" alt="Story Order logo" width="72" height="72"></div><div>
<p class="eyebrow">A Stremio addon</p><h1>Story Order</h1><p class="strap">Puts TV episodes, specials and one-offs in the right watch order.</p>
<div class="badges"><span class="badge good"><span class="ok-mark" aria-hidden="true"></span>No account login</span><span class="badge">Works with your stream addons</span><span class="badge">Open source</span><span class="badge">Privacy focused</span></div>
</div></div></header>
<div class="grid"><main class="panel"><div class="panel-pad">
<div class="quick"><div class="quick-step"><span>1</span><b>Choose source</b>Most people leave Cinemeta selected.</div>
<div class="quick-step"><span>2</span><b>Choose profile</b>Safe is the recommended default.</div>
<div class="quick-step"><span>3</span><b>Create link</b>Story Order makes your install URL.</div>
<div class="quick-step"><span>4</span><b>Install</b>Approve it in Stremio and watch normally.</div></div>
<div class="muted">For most users, the defaults are already right. Your stream addons stay exactly as they are.</div></div>
<form id="configForm">${formSections(customOption)}</form></main>${sidePanel()}
</div><footer><span>Story Order | Puts TV episodes, specials and one-offs in the right watch order.</span><span><a href="https://github.com/ThiaJay/stremio-story-order">GitHub</a> | <a href="https://github.com/ThiaJay/stremio-story-order/blob/main/INSTALL.md">Help</a> | No Stremio AuthKey | No analytics</span></footer>
</div><script nonce="${nonce}">${clientScript()}</script></body></html>`;
}
function formSections(customOption) {
  return `<section class="section"><div class="step-title"><div class="step-num">1</div><div><h2>Where should Story Order get series information?</h2><p>Leave Cinemeta selected unless you already use AIOMetadata or another supported metadata addon.</p></div></div>
<div class="choice-grid">
<label class="choice"><input type="radio" name="sourceKind" value="cinemeta" checked><span class="choice-box"><strong>Cinemeta - simplest</strong><small>No extra setup. Recommended for most people.</small><span class="recommended">Recommended</span></span></label>
<label class="choice"><input type="radio" name="sourceKind" value="aiometadata"><span class="choice-box"><strong>AIOMetadata</strong><small>Use your existing configured AIOMetadata setup and let Story Order fix its episode sequence.</small></span></label>
${customOption}</div>
<div id="manifestRow" class="field hidden"><label for="manifestUrl">Metadata addon manifest URL</label><input id="manifestUrl" type="url" inputmode="url" autocomplete="off" placeholder="https://.../manifest.json"><div class="muted">Your source URL is encrypted into the Story Order install URL.</div></div>
</section>
<section class="section"><div class="step-title"><div class="step-num">2</div><div><h2>How much should Story Order include?</h2><p>Safe handles the common cases without pulling short-form extras into autoplay.</p></div></div>
<div class="choice-grid profiles">
<label class="choice"><input type="radio" name="profile" value="safe" checked><span class="choice-box"><strong>Safe</strong><small>Full episodes, specials and one-offs. Keeps minisodes and prequels in Specials.</small><span class="recommended">Recommended</span></span></label>
<label class="choice"><input type="radio" name="profile" value="balanced"><span class="choice-box"><strong>Balanced</strong><small>Also includes provider-confirmed significant short-form story entries.</small></span></label>
<label class="choice"><input type="radio" name="profile" value="complete"><span class="choice-box"><strong>Complete story</strong><small>Includes more confirmed short-form story material.</small></span></label>
<label class="choice"><input type="radio" name="profile" value="custom"><span class="choice-box"><strong>Custom</strong><small>Fine-tune matching, extras and per-series overrides.</small></span></label>
</div>
<div class="warning">Short-form episodes are more likely to have no playable stream. Safe is the best starting point for most people.</div>
${advancedOptions()}</section>${installSection()}`;
}
function advancedOptions() {
  return `<details><summary>Advanced options</summary><div class="advanced">
<div class="field"><label for="shortForm">Short-form handling</label><select id="shortForm"><option value="exclude">Keep minisodes/prequels in Specials</option><option value="significant">Insert significant short-form story entries</option><option value="all">Insert all allowed provider-confirmed short-form entries</option></select></div>
<div class="checks">
<label class="check"><input id="fullLength" type="checkbox" checked><span>Insert full-length story specials and one-offs into the normal sequence</span></label>
<label class="check"><input id="providerRegularRepairs" type="checkbox" checked><span>Repair normal episodes incorrectly placed in Season 0</span></label>
<label class="check"><input id="upstreamFallback" type="checkbox" checked><span>Use conservative date/runtime inference if the ordering provider is unavailable</span></label>
<label class="check"><input id="includeInsignificant" type="checkbox"><span>Include provider-labelled insignificant specials</span></label>
<label class="check"><input id="includeNonStory" type="checkbox"><span>Allow documentaries, making-of programmes and other non-story extras</span></label>
<label class="check"><input id="includeFuture" type="checkbox"><span>Reorder unaired/future entries too</span></label></div>
<div class="two"><div class="field"><label for="minRuntimeRatio">Minimum runtime ratio</label><input id="minRuntimeRatio" type="number" min="0.2" max="1" step="0.05" value="0.5"></div>
<div class="field"><label for="minFullLengthMinutes">Minimum full-length minutes</label><input id="minFullLengthMinutes" type="number" min="3" max="180" step="1" value="20"></div></div>
<div class="field"><label for="overrides">Per-series override JSON</label><textarea id="overrides" spellcheck="false" placeholder='{"tt1234567":{"exclude":["tt1234567:0:4"]}}'></textarea><div class="muted">Optional. Overrides preserve the original video IDs and stay inside your encrypted configuration token.</div></div>
</div></details>`;
}

function installSection() {
  return `<section class="section"><div class="step-title"><div class="step-num">3</div><div><h2>Create your install link</h2><p>Story Order will generate a private configuration link for Stremio.</p></div></div>
<button class="primary" type="submit">Create install link</button><span id="status" class="status"></span>
<div id="result" class="result hidden"><h3><span class="ok-mark large" aria-hidden="true"></span>Story Order is ready</h3><div>Click below, approve the addon in Stremio and then open your series normally.</div>
<a id="install" class="install">Install Story Order</a><div class="manifest">Manifest URL: <span id="manifestOut"></span></div><button id="copy" class="copy" type="button">Copy manifest URL</button></div>
</section>`;
}
function sidePanel() {
  return `<aside class="side-stack"><section class="panel side-card"><h3>What changes?</h3>
<div class="example"><b>Doctor Who</b><div class="episode"><span class="epno">13</span><span>The Parting of the Ways</span><span class="tick tick-ok" aria-label="correct"></span></div>
<div class="episode highlight"><span class="epno">14</span><strong>The Christmas Invasion</strong><span class="tick tick-play" aria-label="next"></span></div><div class="episode"><span class="epno">15</span><span>New Earth</span></div></div>
<div class="example"><b>Jonathan Creek</b><div class="episode"><span class="epno">3</span><span>The Curse of the Bronze Lamp</span><span class="tick tick-ok" aria-label="correct"></span></div>
<div class="episode highlight"><span class="epno">4</span><strong>Daemons' Roost</strong><span class="tick tick-play" aria-label="next"></span></div></div>
<p class="muted">The original episode IDs stay intact, so your installed stream addons still receive the same episode identity.</p></section>
<section class="panel side-card"><h3>Designed to stay out of the way</h3><div class="feature-list">
<div class="feature"><span class="feature-icon icon-play" aria-hidden="true"></span><div><b>Use Stremio normally</b><small>No separate player or extra launch step.</small></div></div>
<div class="feature"><span class="feature-icon icon-link" aria-hidden="true"></span><div><b>Stream-addon independent</b><small>Torrentio, AIOStreams, Maelstrom and others stay separate.</small></div></div>
<div class="feature"><span class="feature-icon icon-refresh" aria-hidden="true"></span><div><b>Outage aware</b><small>Cached ordering and conservative fallback keep metadata useful when enrichment is unavailable.</small></div></div>
<div class="feature"><span class="feature-icon icon-private" aria-hidden="true"></span><div><b>No Stremio account access</b><small>No AuthKey, password or account session required.</small></div></div>
</div></section></aside>`;
}
export function configurationPage({ token = "", choices = ["cinemeta", "aiometadata"] } = {}) {
  const nonce = crypto.randomUUID().replace(/-/g, "");
  const custom = choices.includes("custom")
    ? '<label class="choice"><input type="radio" name="sourceKind" value="custom"><span class="choice-box"><strong>Custom source</strong><small>Advanced: use a trusted metadata addon allowed by this Story Order host.</small></span></label>'
    : "";
  return { html: pageHtml(escapeHtml(token), custom, nonce), nonce };
}

function clientScript() {
  return `
const $=id=>document.getElementById(id);
const form=$("configForm");
const radioValue=name=>document.querySelector('input[name="'+name+'"]:checked')?.value||"";
const setRadio=(name,value)=>{document.querySelectorAll('input[name="'+name+'"]').forEach(el=>{el.checked=el.value===value})};
function sourceVisibility(){ $("manifestRow").classList.toggle("hidden",radioValue("sourceKind")==="cinemeta"); }
function applyProfile(){ const p=radioValue("profile"); if(p==="safe"){ $("shortForm").value="exclude";$("minRuntimeRatio").value="0.5";$("minFullLengthMinutes").value="20"; }
  if(p==="balanced"){ $("shortForm").value="significant";$("minRuntimeRatio").value="0.45";$("minFullLengthMinutes").value="15"; }
  if(p==="complete"){ $("shortForm").value="all";$("minRuntimeRatio").value="0.35";$("minFullLengthMinutes").value="8"; }}
document.querySelectorAll('input[name="sourceKind"]').forEach(x=>x.addEventListener("change",sourceVisibility));
document.querySelectorAll('input[name="profile"]').forEach(x=>x.addEventListener("change",applyProfile));
sourceVisibility();applyProfile();
function setConfig(c){ const source=c.source||{};setRadio("sourceKind",source.kind||"cinemeta");$("manifestUrl").value=source.manifestUrl||"";sourceVisibility();
  const o=c.order||{};setRadio("profile",o.profile||"safe");$("fullLength").checked=o.fullLength!==false;$("shortForm").value=o.shortForm||"exclude";
  $("providerRegularRepairs").checked=o.providerRegularRepairs!==false;$("upstreamFallback").checked=o.upstreamFallback!==false;$("includeInsignificant").checked=o.includeInsignificant===true;
  $("includeNonStory").checked=o.includeNonStory===true;$("minRuntimeRatio").value=o.minRuntimeRatio??0.5;$("minFullLengthMinutes").value=o.minFullLengthMinutes??20;
  $("includeFuture").checked=o.future==="include";$("overrides").value=Object.keys(c.overrides||{}).length?JSON.stringify(c.overrides,null,2):""; }
async function loadExisting(){const token=document.body.dataset.token;if(!token)return;try{const r=await fetch("/api/config/"+encodeURIComponent(token));if(r.ok)setConfig(await r.json())}catch{}}
loadExisting();` + clientScriptTail();
}
function clientScriptTail() {
  return `
form.addEventListener("submit",async e=>{e.preventDefault();$("status").textContent="Creating your install link...";$("result").classList.add("hidden");
  let overrides={};try{const text=$("overrides").value.trim();if(text)overrides=JSON.parse(text)}catch{$("status").textContent="The override JSON is invalid.";return}
  const source={kind:radioValue("sourceKind")||"cinemeta"};if(source.kind!=="cinemeta")source.manifestUrl=$("manifestUrl").value.trim();
  const payload={source,order:{profile:radioValue("profile")||"safe",fullLength:$("fullLength").checked,shortForm:$("shortForm").value,
    includeInsignificant:$("includeInsignificant").checked,includeNonStory:$("includeNonStory").checked,providerRegularRepairs:$("providerRegularRepairs").checked,
    upstreamFallback:$("upstreamFallback").checked,minRuntimeRatio:Number($("minRuntimeRatio").value),minFullLengthMinutes:Number($("minFullLengthMinutes").value),
    future:$("includeFuture").checked?"include":"leave"},overrides};
  try{const r=await fetch("/api/config",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload)});const data=await r.json();
    if(!r.ok)throw new Error(data.error||"Configuration failed");$("manifestOut").textContent=data.manifestUrl;$("install").href=data.installUrl;$("result").classList.remove("hidden");$("status").textContent="";
    $("result").scrollIntoView({behavior:"smooth",block:"nearest"});}catch(err){$("status").textContent=err.message||String(err)}});
$("copy").addEventListener("click",async()=>{try{await navigator.clipboard.writeText($("manifestOut").textContent);$("copy").textContent="Copied";setTimeout(()=>$("copy").textContent="Copy manifest URL",1600)}catch{}});`;
}
