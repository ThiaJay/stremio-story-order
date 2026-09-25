function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[ch]);
}

export function mergeOverrideRule(current, input = {}) {
  const overrides = current && typeof current === "object" && !Array.isArray(current)
    ? structuredClone(current)
    : {};
  const seriesId = String(input.seriesId || "").trim();
  const videoId = String(input.videoId || "").trim();
  const action = String(input.action || "").trim();
  const beforeId = String(input.beforeId || "").trim();
  const afterId = String(input.afterId || "").trim();
  const rawTargetSeason = String(input.targetSeason ?? "").trim();

  if (!/^tt\d{5,12}$/.test(seriesId)) throw new Error("Series ID must be an IMDb ID such as tt0436992.");
  if (!videoId || videoId.length > 512) throw new Error("Enter a valid video ID.");
  if (!["include","exclude"].includes(action)) throw new Error("Choose Include or Exclude.");
  if (beforeId && afterId) throw new Error("Choose either a before anchor or an after anchor, not both.");

  const existing = overrides[seriesId] && typeof overrides[seriesId] === "object"
    ? structuredClone(overrides[seriesId])
    : {};

  if (action === "exclude") {
    const exclude = Array.isArray(existing.exclude) ? existing.exclude.map(String) : [];
    existing.exclude = [...new Set([...exclude, videoId])];
  } else {
    const include = Array.isArray(existing.include)
      ? existing.include.filter(rule => rule && typeof rule === "object").map(rule => ({...rule}))
      : [];
    const rule = { id: videoId };
    if (rawTargetSeason) {
      const targetSeason = Number(rawTargetSeason);
      if (!Number.isInteger(targetSeason) || targetSeason < 1 || targetSeason > 999) {
        throw new Error("Target season must be a whole number from 1 to 999.");
      }
      rule.targetSeason = targetSeason;
    }
    if (beforeId) rule.beforeId = beforeId;
    if (afterId) rule.afterId = afterId;
    const key = JSON.stringify(rule);
    if (!include.some(item => JSON.stringify(item) === key)) include.push(rule);
    existing.include = include;
  }

  overrides[seriesId] = existing;
  return overrides;
}

export const BRAND_PUBLIC_BASE = "https://raw.githubusercontent.com/ThiaJay/stremio-story-order/main/public";
export const BRAND_ICON_URL = `${BRAND_PUBLIC_BASE}/logo.png?v=1.0.18`;
export const BRAND_ASSET_BASE = `${BRAND_PUBLIC_BASE}/branding/v2`;
export const BRAND_HERO_URL = `${BRAND_PUBLIC_BASE}/branding/v3/story-order-hero.webp?v=1.0.18`;
const brandAsset = name => `${BRAND_ASSET_BASE}/${name}?v=1.0.18`;

const CSS = `
:root{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color-scheme:dark;--bg:#071124;--panel:#0d1a33;--panel2:#101f3d;--line:#23365d;--text:#f7f9ff;--muted:#a9b7d3;--cyan:#21d4fd;--blue:#3185ff;--violet:#8a5cf6;--good:#47d7a2;--warn:#f5b94c;--shadow:0 24px 80px #02071399}
*{box-sizing:border-box}html{min-height:100%;background:var(--bg)}body{margin:0;min-height:100%;color:var(--text);line-height:1.5;background:radial-gradient(circle at 14% 4%,#184ca855 0,transparent 28%),radial-gradient(circle at 88% 12%,#7537bd44 0,transparent 30%),linear-gradient(180deg,#071124 0,#09142a 48%,#060d1c 100%)}
body{overflow-x:hidden}body:before{content:"";position:fixed;inset:0;pointer-events:none;opacity:.18;background-image:linear-gradient(115deg,transparent 0 46%,#37c9ff22 47%,transparent 48%),linear-gradient(65deg,transparent 0 64%,#8b5cf622 65%,transparent 66%)}
a{color:#7bdcff}.shell{width:min(1120px,calc(100% - 32px));margin:0 auto;padding:34px 0 52px}
.hero{position:relative;overflow:hidden;border:1px solid #315084;background:linear-gradient(135deg,#0d2a58dd,#101b3aee 56%,#201552dd);border-radius:28px;padding:30px 32px;box-shadow:var(--shadow)}
.hero:after{content:"";position:absolute;width:460px;height:190px;right:-110px;bottom:-125px;border:22px solid #437eff44;border-radius:50%;transform:rotate(-8deg)}
.brand-row{display:flex;gap:22px;align-items:center;position:relative;z-index:1}.brand-row>div:last-child,.step-title>div:last-child{min-width:0}.logo-card{width:92px;height:92px;flex:0 0 auto;border-radius:22px;display:grid;place-items:center;background:linear-gradient(145deg,#0c1830,#142b57);box-shadow:inset 0 0 0 1px #7adfff55,0 12px 35px #03081588}
.logo-card img{width:86px;height:86px;display:block;border-radius:18px}.eyebrow{color:#8fdfff;text-transform:uppercase;letter-spacing:.18em;font-size:.75rem;font-weight:800;margin:0 0 5px}h1{font-size:clamp(2.3rem,6vw,4.7rem);line-height:.95;margin:0;letter-spacing:-.055em}.strap{font-size:clamp(1.05rem,2.4vw,1.45rem);color:#d8e4fb;margin:12px 0 0;max-width:700px}
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
.override-helper{margin-top:16px;padding:14px;border:1px solid #29436f;border-radius:14px;background:#0a1730}.override-helper h4{margin:0 0 5px}.override-helper p{margin:0;color:var(--muted);font-size:.86rem}.override-actions{display:flex;gap:9px;flex-wrap:wrap;margin-top:12px}.secondary{padding:9px 12px;border:1px solid #36527f;border-radius:10px;background:#0d1c37;color:#e2ebfb;font:inherit;font-weight:750;cursor:pointer}.secondary:hover{filter:brightness(1.08)}.secondary:focus-visible{outline:3px solid #b9e7ff;outline-offset:2px}.helper-status{display:block;margin-top:9px;color:#a9d9ff;font-size:.84rem}
`;const CSS_END = `
details{margin-top:14px;border:1px solid #263b64;border-radius:13px;background:#09162c}summary{cursor:pointer;padding:13px 14px;font-weight:750;color:#d7e3fa}details[open] summary{border-bottom:1px solid #263b64}.advanced{padding:14px}.two{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.primary{width:100%;margin-top:18px;padding:14px 18px;border:0;border-radius:13px;background:linear-gradient(100deg,#168cff,#7657ee);color:white;font:inherit;font-weight:850;cursor:pointer;box-shadow:0 10px 32px #2f66ff44}.primary:hover{filter:brightness(1.08)}.primary:focus-visible{outline:3px solid #b9e7ff;outline-offset:3px}
.result{margin-top:16px;padding:18px;border-radius:16px;border:1px solid #3a806d;background:linear-gradient(145deg,#0c302d,#0d2136)}.result h3{margin:0 0 6px;color:#9af0d1}.install{display:inline-block;margin:12px 0;padding:12px 18px;border-radius:11px;background:#fff;color:#0a1730;text-decoration:none;font-weight:900}.manifest{font-size:.78rem;color:#94a8cc;overflow-wrap:anywhere}.copy{padding:7px 10px;border:1px solid #36527f;border-radius:9px;background:#0b1931;color:#dbe7fb;cursor:pointer}
.side-stack{display:grid;gap:16px}.side-card{padding:20px}.side-card h3{margin:0 0 12px}.example{padding:11px 12px;margin-top:9px;border-radius:12px;background:#08152b;border:1px solid #263d66}.episode{display:flex;gap:9px;align-items:center;padding:6px 0;color:#b5c4df}.episode strong{color:#fff}.episode.highlight{color:#8ddfff}.epno{width:30px;text-align:right;color:#6f88b3}.tick{position:relative;margin-left:auto;width:18px;height:18px;color:#7ef0c7;flex:0 0 auto}.tick-ok:before{content:"";position:absolute;left:5px;top:1px;width:6px;height:10px;border:solid currentColor;border-width:0 2px 2px 0;transform:rotate(45deg)}.tick-play:before{content:"";position:absolute;left:5px;top:4px;border-left:8px solid currentColor;border-top:5px solid transparent;border-bottom:5px solid transparent}
.service-state{display:flex;gap:10px;align-items:center;padding:12px 13px;border:1px solid #2d4775;background:#08152b;border-radius:12px}.service-dot{width:10px;height:10px;border-radius:50%;background:var(--muted);box-shadow:0 0 0 4px #ffffff0a}.service-state.live .service-dot{background:var(--good);box-shadow:0 0 0 4px #47d7a222}.service-copy{min-width:0}.service-copy b{display:block}.service-copy small{display:block;color:var(--muted);margin-top:2px}.feature-list{display:grid;gap:10px}.feature{display:flex;gap:10px;align-items:flex-start}.feature-icon{position:relative;width:30px;height:30px;border-radius:9px;background:#122a50;color:#8ddfff;flex:0 0 auto}.icon-play:before{content:"";position:absolute;left:11px;top:8px;border-left:9px solid currentColor;border-top:6px solid transparent;border-bottom:6px solid transparent}.icon-link:before,.icon-link:after{content:"";position:absolute;width:11px;height:6px;border:2px solid currentColor;border-radius:6px;transform:rotate(-40deg)}.icon-link:before{left:5px;top:8px}.icon-link:after{left:13px;top:14px}.icon-refresh:before{content:"";position:absolute;inset:7px;border:2px solid currentColor;border-top-color:transparent;border-radius:50%}.icon-refresh:after{content:"";position:absolute;right:5px;top:5px;border-left:5px solid currentColor;border-top:4px solid transparent;border-bottom:4px solid transparent;transform:rotate(-35deg)}.icon-private:before{content:"";position:absolute;left:8px;bottom:6px;width:12px;height:10px;border:2px solid currentColor;border-radius:2px}.icon-private:after{content:"";position:absolute;left:10px;top:5px;width:8px;height:8px;border:2px solid currentColor;border-bottom:0;border-radius:8px 8px 0 0}.feature b{display:block}.feature small{color:var(--muted)}
footer{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-top:20px;padding:0 4px;color:#7f91b2;font-size:.82rem}footer a{color:#9ebeff}.status{display:block;margin-top:10px;color:#ffd397;font-size:.88rem}
@media(max-width:900px){.grid{grid-template-columns:1fr}.side-stack{grid-template-columns:1fr 1fr}.choice-grid.profiles{grid-template-columns:repeat(2,1fr)}}
@media(max-width:620px){.shell{width:min(calc(100% - 20px),1120px);padding-top:14px}.hero{padding:20px 16px;border-radius:20px}.brand-row{align-items:flex-start;gap:13px}.logo-card{width:56px;height:56px;border-radius:15px}.logo-card img{width:50px;height:50px;border-radius:12px}h1{font-size:2rem}.strap{font-size:1rem}.quick{grid-template-columns:repeat(2,minmax(0,1fr))}.choice-grid,.choice-grid.profiles,.side-stack,.two{grid-template-columns:1fr}.section{padding:20px 16px}.panel-pad{padding:18px}.quick-step,.strap,.step-title,.choice-box,.side-card{overflow-wrap:anywhere}}
`;

const CSS_BRAND_REFRESH = `
.hero-refresh{display:grid;grid-template-columns:minmax(0,.86fr) minmax(420px,1.14fr);gap:26px;align-items:center;padding:28px;isolation:isolate}
.hero-refresh:after{opacity:.55;z-index:-1}.hero-copy{position:relative;z-index:2;min-width:0}.hero-copy .brand-row{gap:18px}
.brand-line{margin:16px 0 0;font-size:clamp(1.25rem,2.6vw,1.8rem);line-height:1.12;font-weight:850;letter-spacing:-.025em;background:linear-gradient(90deg,#f7fbff 0,#8ee7ff 42%,#ffca67 100%);-webkit-background-clip:text;background-clip:text;color:transparent}
.hero-refresh .strap{margin-top:8px;font-size:clamp(.98rem,1.8vw,1.18rem);max-width:560px;color:#c7d5ef}
.hero-visual{margin:0;position:relative;z-index:1;border-radius:20px;overflow:hidden;border:1px solid #315084;background:#050a17;box-shadow:0 18px 52px #02071388}
.hero-visual img{display:block;width:100%;height:auto;aspect-ratio:1500/660;object-fit:cover}
.quick-step{min-height:142px}.quick-icon{display:block;width:38px;height:38px;margin:0 0 8px;object-fit:contain}.quick-step .step-number{position:absolute;top:12px;right:12px;margin:0;width:24px;height:24px}
.profile-icon{display:block;width:38px;height:38px;margin:0 0 10px;object-fit:contain}.choice-box{position:relative}
.feature-icon.asset{display:block;object-fit:contain;padding:4px;background:#122a50}.order-note{margin:14px 0 0;padding:12px 13px;border-radius:12px;border:1px solid #315084;background:linear-gradient(135deg,#0b2142,#101a39);color:#cbdaf3;font-size:.86rem}.order-note strong{display:block;color:#fff;margin-bottom:3px}
@media(max-width:900px){.hero-refresh{grid-template-columns:1fr}.hero-visual{order:-1}.hero-visual img{max-height:340px}.hero-copy .brand-row{justify-content:flex-start}}
@media(max-width:620px){.hero-refresh{padding:14px}.hero-visual{border-radius:14px}.hero-visual img{aspect-ratio:4/3;object-fit:cover;object-position:63% center}.brand-line{font-size:1.28rem}.quick-step{min-height:132px}}
`;

const CSS_SPACIOUS_REFRESH = `
.shell{width:min(1280px,calc(100% - 40px));padding:40px 0 64px}
.hero{padding:0;min-height:410px;border-radius:30px}
.hero-refresh{display:flex;align-items:flex-end;position:relative;min-height:410px;padding:0;isolation:isolate}
.hero-refresh:before{content:"";position:absolute;inset:0;z-index:1;background:linear-gradient(90deg,#071124fa 0%,#09152bea 31%,#0a1730b8 48%,#07112438 70%,#07112408 100%),linear-gradient(0deg,#071124d9 0%,transparent 45%)}
.hero-refresh:after{display:none}
.hero-visual{position:absolute;inset:0;margin:0;border:0;border-radius:0;background:#050a17;box-shadow:none;z-index:0}
.hero-visual img{display:block;width:100%;height:100%;aspect-ratio:auto;object-fit:cover;object-position:center}
.hero-copy{position:relative;z-index:2;max-width:650px;padding:38px 42px 40px}
.hero-copy .brand-row{gap:17px;align-items:center}.logo-card{width:86px;height:86px;border-radius:22px;background:#09162cbb;backdrop-filter:blur(10px)}.logo-card img{width:80px;height:80px;border-radius:19px}
.hero-copy h1{font-size:clamp(3rem,5vw,4.8rem)}.brand-line{margin-top:18px;font-size:clamp(1.35rem,2.2vw,1.9rem)}.hero-refresh .strap{font-size:1.08rem;line-height:1.55;max-width:570px}
.grid{grid-template-columns:minmax(0,1fr) 360px;gap:28px;margin-top:28px;align-items:start}.flow{min-width:0}.intro-card{padding:22px 26px}.journey-strip{display:grid;grid-template-columns:1fr auto 1fr auto 1fr;gap:12px;align-items:center}.journey-step{display:flex;gap:11px;align-items:center;min-width:0}.journey-step>span{width:30px;height:30px;display:grid;place-items:center;flex:0 0 auto;border-radius:10px;background:linear-gradient(135deg,var(--cyan),var(--violet));color:#061127;font-weight:900}.journey-step b{display:block;font-size:.92rem}.journey-step small{display:block;color:var(--muted);font-size:.78rem;line-height:1.3;margin-top:2px}.journey-arrow{font-size:1.55rem;color:#5876a7}.intro-note{margin-top:15px;color:var(--muted);font-size:.9rem}
.section{margin-top:18px;padding:28px;border:1px solid var(--line);border-radius:22px;background:linear-gradient(180deg,#0d1a33ed,#09152ced);box-shadow:0 18px 60px #02071355}.section:first-child{border-top:1px solid var(--line)}
.step-title{gap:14px;margin-bottom:20px}.step-num{width:38px;height:38px;border-radius:12px}.step-title h2{font-size:1.25rem;margin-top:0}.step-title p{font-size:.94rem;max-width:720px}
.choice-grid{gap:14px}.choice-grid.profiles{grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.choice-box{padding:18px;border-radius:16px}.choice-box strong{font-size:1rem}.choice-box small{font-size:.86rem;line-height:1.45}.profile-icon{width:42px;height:42px;margin-bottom:12px}
.warning{margin-top:16px;padding:13px 15px}.primary{padding:16px 20px;border-radius:14px;font-size:1rem}.result{padding:20px}
.side-stack{position:sticky;top:22px;align-self:start;gap:18px}.side-card{padding:24px}.side-kicker{margin:0 0 6px;color:#8fdfff;text-transform:uppercase;letter-spacing:.14em;font-size:.7rem;font-weight:850}.side-card h3{font-size:1.25rem;line-height:1.2;margin-bottom:10px}.example{padding:15px 16px;border-radius:15px}.episode{padding:8px 0}.order-note{margin-top:16px;padding:14px}.service-state{margin-bottom:16px;padding:13px 14px}.trust-list{display:grid;gap:12px}.trust-item{display:flex;gap:11px;align-items:flex-start}.trust-item .feature-icon{width:32px;height:32px}.trust-item b{display:block;font-size:.9rem}.trust-item small{display:block;color:var(--muted);line-height:1.35;margin-top:2px}
footer{margin-top:26px}
@media(max-width:1050px){.shell{width:min(960px,calc(100% - 32px))}.grid{grid-template-columns:1fr}.side-stack{position:static;grid-template-columns:1fr 1fr}.hero{min-height:390px}.hero-refresh{min-height:390px}.hero-copy{padding:32px}.hero-refresh:before{background:linear-gradient(90deg,#071124f5 0%,#09152bdc 46%,#07112435 78%,transparent 100%),linear-gradient(0deg,#071124d9 0%,transparent 45%)}}
@media(max-width:720px){.shell{width:min(calc(100% - 20px),960px);padding-top:14px}.hero,.hero-refresh{min-height:500px;border-radius:22px}.hero-visual img{object-position:56% center}.hero-refresh:before{background:linear-gradient(0deg,#071124fa 0%,#071124ea 48%,#0711243d 82%,transparent 100%)}.hero-copy{align-self:flex-end;padding:24px 20px}.hero-copy .brand-row{align-items:center}.hero-copy h1{font-size:2.65rem}.logo-card{width:66px;height:66px}.logo-card img{width:60px;height:60px}.journey-strip{grid-template-columns:1fr;gap:10px}.journey-arrow{display:none}.side-stack{grid-template-columns:1fr}.choice-grid,.choice-grid.profiles,.two{grid-template-columns:1fr}.section{padding:22px 18px}.intro-card{padding:18px}.badges{gap:7px}.badge{font-size:.75rem}}
`;

const CSS_STORY_SIGNATURE = `
:root{--story-glow:#32d7ff;--story-warm:#ffb74d;--story-ink:#050b18}
body:after{content:"";position:fixed;inset:0;pointer-events:none;z-index:-1;background:radial-gradient(circle at 18% 18%,#1f7aff12 0,transparent 34%),radial-gradient(circle at 82% 26%,#a35bff12 0,transparent 30%),linear-gradient(120deg,transparent 0 47%,#27c7ff08 48%,transparent 49%)}
.panel,.section{position:relative;overflow:hidden}.panel:before,.section:before{content:"";position:absolute;inset:0;pointer-events:none;border-radius:inherit;background:linear-gradient(135deg,#64d8ff08,transparent 26%,transparent 68%,#ffad4907)}
.section{border-color:#29466f;background:linear-gradient(150deg,#0d1b35f2 0%,#09152aec 58%,#10152fe9 100%)}.section:hover{border-color:#355b8e}
.step-num{position:relative;box-shadow:0 0 0 1px #84ddff44,0 0 28px #227dff20}.step-num:after{content:"";position:absolute;inset:7px;border:1px solid #fff5;border-radius:7px}
.choice-box{background:linear-gradient(145deg,#0a1730,#0d1b37 70%,#111936);border-color:#29446e}.choice input:checked+.choice-box{background:linear-gradient(145deg,#123560 0%,#182455 62%,#25205b 100%);box-shadow:0 0 0 1px #65c9ff88,0 14px 36px #03091770,inset 0 0 46px #427dff12}
.choice-box:after{content:"";position:absolute;right:14px;top:14px;width:36px;height:3px;border-radius:4px;background:linear-gradient(90deg,var(--cyan),var(--violet),var(--warn));opacity:.55}
.journey-strip{position:relative}.journey-strip:before{content:"";position:absolute;left:5%;right:5%;top:15px;height:1px;background:linear-gradient(90deg,#22d3ee33,#5c7cff77,#f2b94b33);z-index:0}.journey-step,.journey-arrow{position:relative;z-index:1}.journey-step>span{box-shadow:0 0 24px #2b96ff35}
.preview-card{background:linear-gradient(165deg,#0e203e 0%,#0a162d 62%,#131734 100%)}.preview-card:after{content:"";position:absolute;width:180px;height:180px;right:-90px;top:-80px;border:1px solid #44d4ff28;border-radius:50%;box-shadow:0 0 0 26px #5846ff08,0 0 0 52px #ffb34b05}
.story-example{background:linear-gradient(145deg,#071329,#0b1b35);box-shadow:inset 0 0 0 1px #5bc9ff0d}.example-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:6px}.example-series{display:block;font-size:1rem;font-weight:850;color:#fff}.example-head small{display:block;color:#7f93b7;margin-top:2px}.story-pulse{width:9px;height:9px;border-radius:50%;background:#4ee6b0;box-shadow:0 0 0 5px #4ee6b014,0 0 18px #4ee6b055}
.episode{border-bottom:1px solid #20375c55}.episode:last-child{border-bottom:0}.episode.highlight{margin:2px -7px;padding:9px 7px;border-radius:9px;background:linear-gradient(90deg,#2ac7ff0d,#7158ff12,#ffb44d0d);border-bottom:0}.epno{width:48px;font-variant-numeric:tabular-nums;color:#7894c1}
.primary{position:relative;overflow:hidden;background:linear-gradient(100deg,#168cff 0%,#655cf0 57%,#8f54e9 100%);box-shadow:0 14px 42px #3b55ff35}
.side-kicker{display:flex;align-items:center;gap:7px}.side-kicker:before{content:"";width:18px;height:2px;border-radius:2px;background:linear-gradient(90deg,var(--cyan),var(--warn))}
details{border-color:#2d4a75;background:#08162c99}summary{padding:15px 16px}summary:after{content:"Optional";float:right;color:#6f88b3;font-size:.72rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase}
@media(max-width:720px){.journey-strip:before{display:none}.choice-box:after{width:28px}.episode .epno{width:48px}}
`;
function styles() { return CSS + CSS_MORE + CSS_END + CSS_BRAND_REFRESH + CSS_SPACIOUS_REFRESH + CSS_STORY_SIGNATURE; }
function pageHtml(initialToken, customOption, nonce) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="referrer" content="no-referrer"><meta name="theme-color" content="#050A17"><meta name="description" content="Puts TV episodes, specials and one-offs in the right watch order."><link rel="icon" type="image/svg+xml" href="${brandAsset("story-order-glyph.svg")}"><title>Story Order - Stremio addon</title><style>${styles()}</style></head>
<body data-token="${initialToken}"><div class="shell">
<header class="hero hero-refresh"><figure class="hero-visual"><img src="${BRAND_HERO_URL}" alt="Unordered episode and special cards flowing through Story Order into one coherent narrative sequence" width="1000" height="375"></figure><div class="hero-copy"><div class="brand-row"><div class="logo-card"><img src="${BRAND_ICON_URL}" alt="Story Order logo" width="80" height="80"></div><div>
<p class="eyebrow">A Stremio addon</p><h1>Story Order</h1></div></div>
<p class="brand-line">Correct order. Complete stories.</p><p class="strap">Puts TV episodes, specials and one-offs in the right watch order without changing their underlying episode identity.</p>
<div class="badges"><span class="badge good"><span class="ok-mark" aria-hidden="true"></span>No account login</span><span class="badge">Works with your stream addons</span><span class="badge">Open source</span><span class="badge">Privacy focused</span></div>
</div></header>
<div class="grid"><main class="flow"><div class="panel panel-pad intro-card">
<div class="journey-strip" aria-label="Three step setup"><div class="journey-step"><span>1</span><div><b>Choose source</b><small>Cinemeta works for most people.</small></div></div><span class="journey-arrow" aria-hidden="true">&rsaquo;</span><div class="journey-step"><span>2</span><div><b>Choose story profile</b><small>Safe is the recommended default.</small></div></div><span class="journey-arrow" aria-hidden="true">&rsaquo;</span><div class="journey-step"><span>3</span><div><b>Create and install</b><small>Approve the private link in Stremio.</small></div></div></div>
<div class="intro-note">For most users the defaults are already right. Your stream addons stay exactly as they are.</div></div>
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
<label class="choice"><input type="radio" name="profile" value="safe" checked><span class="choice-box"><img class="profile-icon" src="${brandAsset("profile-safe.svg")}" alt="" aria-hidden="true"><strong>Safe</strong><small>Full episodes, specials and one-offs. Keeps minisodes and prequels in Specials.</small><span class="recommended">Recommended</span></span></label>
<label class="choice"><input type="radio" name="profile" value="balanced"><span class="choice-box"><img class="profile-icon" src="${brandAsset("profile-balanced.svg")}" alt="" aria-hidden="true"><strong>Balanced</strong><small>Also includes provider-confirmed significant short-form story entries.</small></span></label>
<label class="choice"><input type="radio" name="profile" value="complete"><span class="choice-box"><img class="profile-icon" src="${brandAsset("profile-complete.svg")}" alt="" aria-hidden="true"><strong>Complete story</strong><small>Includes more confirmed short-form story material.</small></span></label>
<label class="choice"><input type="radio" name="profile" value="custom"><span class="choice-box"><img class="profile-icon" src="${brandAsset("profile-custom.svg")}" alt="" aria-hidden="true"><strong>Custom</strong><small>Fine-tune matching, extras and per-series overrides.</small></span></label>
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
<div class="override-helper"><h4>Per-series override helper</h4><p>Build a safe stable-ID rule without writing JSON by hand. Use IDs already shown by your metadata source.</p>
<div class="two"><div class="field"><label for="overrideSeriesId">Series IMDb ID</label><input id="overrideSeriesId" type="text" autocomplete="off" placeholder="tt0436992"></div>
<div class="field"><label for="overrideVideoId">Video ID</label><input id="overrideVideoId" type="text" autocomplete="off" placeholder="tt0436992:0:2"></div></div>
<div class="two"><div class="field"><label for="overrideAction">Action</label><select id="overrideAction"><option value="include">Include in story order</option><option value="exclude">Exclude from story order</option></select></div>
<div class="field"><label for="overrideTargetSeason">Target season (optional)</label><input id="overrideTargetSeason" type="number" min="1" max="999" step="1" placeholder="2"></div></div>
<div class="two"><div class="field"><label for="overrideBeforeId">Place before video ID (optional)</label><input id="overrideBeforeId" type="text" autocomplete="off"></div>
<div class="field"><label for="overrideAfterId">Place after video ID (optional)</label><input id="overrideAfterId" type="text" autocomplete="off"></div></div>
<div class="override-actions"><button id="addOverrideRule" class="secondary" type="button">Add override rule</button><button id="clearOverrideHelper" class="secondary" type="button">Clear helper</button></div>
<span id="overrideHelperStatus" class="helper-status" aria-live="polite"></span></div>
<div class="field"><label for="overrides">Advanced override JSON</label><textarea id="overrides" spellcheck="false" placeholder='{"tt1234567":{"exclude":["tt1234567:0:4"]}}'></textarea><div class="muted">The helper writes here. You can still edit the JSON directly. Rules preserve original video IDs and stay inside your encrypted configuration token.</div></div>
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
  return `<aside class="side-stack"><section class="panel side-card preview-card"><p class="side-kicker">What changes</p><h3>One story. Correct sequence.</h3><p class="muted">Story Order places narrative specials where they belong while keeping the same programme and stable episode identities.</p>
<div class="example story-example"><div class="example-head"><div><span class="example-series">Breaking Bad</span><small>Narrative sequence</small></div><span class="story-pulse" aria-hidden="true"></span></div><div class="episode"><span class="epno">S2E08</span><span>Better Call Saul</span><span class="tick tick-ok" aria-label="correct"></span></div>
<div class="episode highlight"><span class="epno">S2E09</span><strong>4 Days Out</strong><span class="tick tick-play" aria-label="next"></span></div><div class="episode"><span class="epno">S2E10</span><span>Over</span></div></div>
<p class="order-note"><strong>Same episode IDs. Better narrative path.</strong> Your installed stream addons still receive the original episode identity.</p></section>
<section class="panel side-card"><div id="serviceState" class="service-state" aria-live="polite"><span class="service-dot" aria-hidden="true"></span><div class="service-copy"><b id="serviceStateTitle">Checking Story Order...</b><small id="serviceStateDetail">Reading the public capability status.</small></div></div><div class="trust-list">
<div class="trust-item"><img class="feature-icon asset" src="${brandAsset("feature-ids-preserved.svg")}" alt="" aria-hidden="true"><div><b>Use Stremio normally</b><small>No separate player or launch step.</small></div></div>
<div class="trust-item"><img class="feature-icon asset" src="${brandAsset("feature-stream-independent.svg")}" alt="" aria-hidden="true"><div><b>Stream addon independent</b><small>Torrentio, AIOStreams, Maelstrom and others stay separate.</small></div></div>
<div class="trust-item"><img class="feature-icon asset" src="${brandAsset("feature-outage-aware.svg")}" alt="" aria-hidden="true"><div><b>Outage aware</b><small>Conservative fallback keeps metadata useful.</small></div></div>
<div class="trust-item"><img class="feature-icon asset" src="${brandAsset("feature-private.svg")}" alt="" aria-hidden="true"><div><b>No Stremio account access</b><small>No AuthKey, password or account session required.</small></div></div>
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
const mergeOverrideRule=function mergeOverrideRule(current, input = {}) {
  const overrides = current && typeof current === "object" && !Array.isArray(current)
    ? structuredClone(current)
    : {};
  const seriesId = String(input.seriesId || "").trim();
  const videoId = String(input.videoId || "").trim();
  const action = String(input.action || "").trim();
  const beforeId = String(input.beforeId || "").trim();
  const afterId = String(input.afterId || "").trim();
  const rawTargetSeason = String(input.targetSeason ?? "").trim();

  if (!/^tt\d{5,12}$/.test(seriesId)) throw new Error("Series ID must be an IMDb ID such as tt0436992.");
  if (!videoId || videoId.length > 512) throw new Error("Enter a valid video ID.");
  if (!["include","exclude"].includes(action)) throw new Error("Choose Include or Exclude.");
  if (beforeId && afterId) throw new Error("Choose either a before anchor or an after anchor, not both.");

  const existing = overrides[seriesId] && typeof overrides[seriesId] === "object"
    ? structuredClone(overrides[seriesId])
    : {};

  if (action === "exclude") {
    const exclude = Array.isArray(existing.exclude) ? existing.exclude.map(String) : [];
    existing.exclude = [...new Set([...exclude, videoId])];
  } else {
    const include = Array.isArray(existing.include)
      ? existing.include.filter(rule => rule && typeof rule === "object").map(rule => ({...rule}))
      : [];
    const rule = { id: videoId };
    if (rawTargetSeason) {
      const targetSeason = Number(rawTargetSeason);
      if (!Number.isInteger(targetSeason) || targetSeason < 1 || targetSeason > 999) {
        throw new Error("Target season must be a whole number from 1 to 999.");
      }
      rule.targetSeason = targetSeason;
    }
    if (beforeId) rule.beforeId = beforeId;
    if (afterId) rule.afterId = afterId;
    const key = JSON.stringify(rule);
    if (!include.some(item => JSON.stringify(item) === key)) include.push(rule);
    existing.include = include;
  }

  overrides[seriesId] = existing;
  return overrides;
};
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
async function loadServiceStatus(){
  const box=$("serviceState"),title=$("serviceStateTitle"),detail=$("serviceStateDetail");
  if(!box||!title||!detail)return;
  try{
    const r=await fetch("/_story/status.json",{cache:"no-store"});
    const s=await r.json();
    if(!r.ok||s.status!=="live")throw new Error("unavailable");
    box.classList.add("live");
    title.textContent="Live | v"+String(s.version||"");
    detail.textContent=s.storyOrderContract?.version===1&&s.storyOrderContract?.canonicalVideoCoordinatesPreserved===true
      ?"Stable-ID Story Order | canonical watched identity preserved"
      :"Story Order service available";
  }catch{
    box.classList.remove("live");
    title.textContent="Status unavailable";
    detail.textContent="Configuration still works. Retry this page if you want the live capability check.";
  }
}
loadServiceStatus();
function setConfig(c){ const source=c.source||{};setRadio("sourceKind",source.kind||"cinemeta");$("manifestUrl").value=source.manifestUrl||"";sourceVisibility();
  const o=c.order||{};setRadio("profile",o.profile||"safe");$("fullLength").checked=o.fullLength!==false;$("shortForm").value=o.shortForm||"exclude";
  $("providerRegularRepairs").checked=o.providerRegularRepairs!==false;$("upstreamFallback").checked=o.upstreamFallback!==false;$("includeInsignificant").checked=o.includeInsignificant===true;
  $("includeNonStory").checked=o.includeNonStory===true;$("minRuntimeRatio").value=o.minRuntimeRatio??0.5;$("minFullLengthMinutes").value=o.minFullLengthMinutes??20;
  $("includeFuture").checked=o.future==="include";$("overrides").value=Object.keys(c.overrides||{}).length?JSON.stringify(c.overrides,null,2):""; }
async function loadExisting(){const token=document.body.dataset.token;if(!token)return;try{const r=await fetch("/api/config/"+encodeURIComponent(token));if(r.ok)setConfig(await r.json())}catch{}}
loadExisting();
function clearOverrideHelper(){
  ["overrideSeriesId","overrideVideoId","overrideTargetSeason","overrideBeforeId","overrideAfterId"].forEach(id=>$(id).value="");
  $("overrideAction").value="include";
}
$("addOverrideRule").addEventListener("click",()=>{
  const status=$("overrideHelperStatus");
  let current={};
  try{
    const text=$("overrides").value.trim();
    if(text)current=JSON.parse(text);
    current=mergeOverrideRule(current,{
      seriesId:$("overrideSeriesId").value,
      videoId:$("overrideVideoId").value,
      action:$("overrideAction").value,
      targetSeason:$("overrideTargetSeason").value,
      beforeId:$("overrideBeforeId").value,
      afterId:$("overrideAfterId").value
    });
    $("overrides").value=JSON.stringify(current,null,2);
    status.textContent="Override rule added. Review the generated JSON below if you want.";
    clearOverrideHelper();
  }catch(err){
    status.textContent=err?.message||String(err);
  }
});
$("clearOverrideHelper").addEventListener("click",()=>{clearOverrideHelper();$("overrideHelperStatus").textContent="";});
` + clientScriptTail();
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
