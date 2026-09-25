import { readFileSync, writeFileSync } from "node:fs";

function replaceOnce(text, from, to, label) {
  if (!text.includes(from)) throw new Error("Missing " + label);
  return text.replace(from, to);
}

let cfg = readFileSync("config-page.js", "utf8");

const oldExample = '<div class="example"><b>Doctor Who</b><div class="episode"><span class="epno">13</span><span>The Parting of the Ways</span><span class="tick tick-ok" aria-label="correct"></span></div>\n<div class="episode highlight"><span class="epno">14</span><strong>The Christmas Invasion</strong><span class="tick tick-play" aria-label="next"></span></div><div class="episode"><span class="epno">15</span><span>New Earth</span></div></div>';
const newExample = '<div class="example story-example"><div class="example-head"><div><span class="example-series">Breaking Bad</span><small>Narrative sequence</small></div><span class="story-pulse" aria-hidden="true"></span></div><div class="episode"><span class="epno">S2E08</span><span>Better Call Saul</span><span class="tick tick-ok" aria-label="correct"></span></div>\n<div class="episode highlight"><span class="epno">S2E09</span><strong>4 Days Out</strong><span class="tick tick-play" aria-label="next"></span></div><div class="episode"><span class="epno">S2E10</span><span>Over</span></div></div>';
cfg = replaceOnce(cfg, oldExample, newExample, "Doctor Who example");

const stylesMarker = 'function styles() { return CSS + CSS_MORE + CSS_END + CSS_BRAND_REFRESH + CSS_SPACIOUS_REFRESH; }';
const cssLines = [
  ":root{--story-glow:#32d7ff;--story-warm:#ffb74d;--story-ink:#050b18}",
  "body:after{content:\"\";position:fixed;inset:0;pointer-events:none;z-index:-1;background:radial-gradient(circle at 18% 18%,#1f7aff12 0,transparent 34%),radial-gradient(circle at 82% 26%,#a35bff12 0,transparent 30%),linear-gradient(120deg,transparent 0 47%,#27c7ff08 48%,transparent 49%)}",
  ".panel,.section{position:relative;overflow:hidden}.panel:before,.section:before{content:\"\";position:absolute;inset:0;pointer-events:none;border-radius:inherit;background:linear-gradient(135deg,#64d8ff08,transparent 26%,transparent 68%,#ffad4907)}",
  ".section{border-color:#29466f;background:linear-gradient(150deg,#0d1b35f2 0%,#09152aec 58%,#10152fe9 100%)}.section:hover{border-color:#355b8e}",
  ".step-num{position:relative;box-shadow:0 0 0 1px #84ddff44,0 0 28px #227dff20}.step-num:after{content:\"\";position:absolute;inset:7px;border:1px solid #fff5;border-radius:7px}",
  ".choice-box{background:linear-gradient(145deg,#0a1730,#0d1b37 70%,#111936);border-color:#29446e}.choice input:checked+.choice-box{background:linear-gradient(145deg,#123560 0%,#182455 62%,#25205b 100%);box-shadow:0 0 0 1px #65c9ff88,0 14px 36px #03091770,inset 0 0 46px #427dff12}",
  ".choice-box:after{content:\"\";position:absolute;right:14px;top:14px;width:36px;height:3px;border-radius:4px;background:linear-gradient(90deg,var(--cyan),var(--violet),var(--warn));opacity:.55}",
  ".journey-strip{position:relative}.journey-strip:before{content:\"\";position:absolute;left:5%;right:5%;top:15px;height:1px;background:linear-gradient(90deg,#22d3ee33,#5c7cff77,#f2b94b33);z-index:0}.journey-step,.journey-arrow{position:relative;z-index:1}.journey-step>span{box-shadow:0 0 24px #2b96ff35}",
  ".preview-card{background:linear-gradient(165deg,#0e203e 0%,#0a162d 62%,#131734 100%)}.preview-card:after{content:\"\";position:absolute;width:180px;height:180px;right:-90px;top:-80px;border:1px solid #44d4ff28;border-radius:50%;box-shadow:0 0 0 26px #5846ff08,0 0 0 52px #ffb34b05}",
  ".story-example{background:linear-gradient(145deg,#071329,#0b1b35);box-shadow:inset 0 0 0 1px #5bc9ff0d}.example-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:6px}.example-series{display:block;font-size:1rem;font-weight:850;color:#fff}.example-head small{display:block;color:#7f93b7;margin-top:2px}.story-pulse{width:9px;height:9px;border-radius:50%;background:#4ee6b0;box-shadow:0 0 0 5px #4ee6b014,0 0 18px #4ee6b055}",
  ".episode{border-bottom:1px solid #20375c55}.episode:last-child{border-bottom:0}.episode.highlight{margin:2px -7px;padding:9px 7px;border-radius:9px;background:linear-gradient(90deg,#2ac7ff0d,#7158ff12,#ffb44d0d);border-bottom:0}.epno{width:48px;font-variant-numeric:tabular-nums;color:#7894c1}",
  ".primary{position:relative;overflow:hidden;background:linear-gradient(100deg,#168cff 0%,#655cf0 57%,#8f54e9 100%);box-shadow:0 14px 42px #3b55ff35}",
  ".side-kicker{display:flex;align-items:center;gap:7px}.side-kicker:before{content:\"\";width:18px;height:2px;border-radius:2px;background:linear-gradient(90deg,var(--cyan),var(--warn))}",
  "details{border-color:#2d4a75;background:#08162c99}summary{padding:15px 16px}summary:after{content:\"Optional\";float:right;color:#6f88b3;font-size:.72rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase}",
  "@media(max-width:720px){.journey-strip:before{display:none}.choice-box:after{width:28px}.episode .epno{width:48px}}"
];
const cinematicCss = "const CSS_STORY_SIGNATURE = `\n" + cssLines.join("\n") + "\n`;";
cfg = replaceOnce(cfg, stylesMarker, cinematicCss + "\nfunction styles() { return CSS + CSS_MORE + CSS_END + CSS_BRAND_REFRESH + CSS_SPACIOUS_REFRESH + CSS_STORY_SIGNATURE; }", "styles marker");
writeFileSync("config-page.js", cfg);

let tests = readFileSync("test-worker.mjs", "utf8");
const anchor = 'assert.match(html,/class="flow"/);';
if (!tests.includes("assert.match(html,/Breaking Bad/);")) {
  tests = replaceOnce(tests, anchor, anchor + "\nassert.match(html,/Breaking Bad/);\nassert.doesNotMatch(html,/Doctor Who/);", "test anchor");
}
writeFileSync("test-worker.mjs", tests);

let changelog = readFileSync("CHANGELOG.md", "utf8");
if (!changelog.includes("Breaking Bad example and cinematic interface refinement")) {
  changelog = changelog.replace("# Changelog\n\n", "# Changelog\n\n## Interface refinement - 2026-09-25\n\nBreaking Bad example and cinematic interface refinement.\n\n- Replaces the Doctor Who preview with Breaking Bad.\n- Adds a more distinctive Story Order visual language to cards, selected profiles, the setup journey and narrative preview.\n- Preserves the roomy layout and all existing functionality.\n\n");
}
writeFileSync("CHANGELOG.md", changelog);
