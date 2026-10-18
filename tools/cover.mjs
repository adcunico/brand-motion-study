/**
 * Phase 3 — build export/cover.png: a 1080×1350 grid of all eight loops,
 * each frozen at its best moment, numbered "NN Object → change".
 *   node tools/cover.mjs [titleIndex]
 */
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const TITLES = [
  'Eight Loops, One Style File',
  'A Brand, Read From Its Own Code',
  'Motion From Tokens, Not Adjectives',
];
const titleIdx = +(process.argv[2] || 0);
const OUT = process.argv[3] || 'export/cover.png';

/* the moment in each loop that reads best as a still */
const ITEMS = [
  { n:'01', file:'01-dotgrid-cascade.html',   obj:'Dot grid',     ch:'cascade', t:1500 },
  { n:'02', file:'02-hairline-scan.html',     obj:'Hairline',     ch:'scan',    t:2600 },
  { n:'03', file:'03-status-ring-cycle.html', obj:'Status ring',  ch:'cycle',   t:3200 },
  { n:'04', file:'04-issue-row-reorder.html', obj:'Issue row',    ch:'reorder', t:1700 },
  { n:'05', file:'05-command-list-step.html', obj:'Command list', ch:'step',    t:2600 },
  { n:'06', file:'06-bar-chart-build.html',   obj:'Bar chart',    ch:'build',   t:2400 },
  { n:'07', file:'07-accent-bloom.html',      obj:'Accent',       ch:'bloom',   t:1250 },
  { n:'08', file:'08-card-stack-tilt.html',   obj:'Card stack',   ch:'tilt',    t:3750 },
];

const SHOTS = 'export/_cover-frames';
await fs.mkdir(SHOTS, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });

for (const it of ITEMS) {
  await page.goto(new URL(`file://${path.resolve('animations', it.file)}?capture=1`).href, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => typeof window.seek === 'function', null, { timeout: 20000 });
  await page.evaluate((ms) => window.seek(ms), it.t);
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  await page.screenshot({ path: path.join(SHOTS, `${it.n}.png`) });
  it.src = path.resolve(SHOTS, `${it.n}.png`).replace(/\\/g, '/');
}

/* ---- compose the cover as a page, then shoot it at 1080×1350 ---- */
const cells = ITEMS.map((it) => `
  <figure class="cell">
    <div class="shot" style="background-image:url('file:///${it.src}')"></div>
    <figcaption><span class="n">${it.n}</span><span class="t">${it.obj}<i>→</i>${it.ch}</span></figcaption>
  </figure>`).join('');

const html = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300..700&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet">
<style>
  :root{
    --bg:#010102; --fg:#f7f8f8; --fg3:#8a8f98; --fg4:#62666d; --accent:#7170ff;
    --rule:1px solid rgba(255,255,255,0.08);
  }
  *{box-sizing:border-box;margin:0}
  body{width:1080px;height:1350px;background:var(--bg);color:var(--fg);overflow:hidden;
       font-family:"Inter",sans-serif;font-feature-settings:"cv01","ss03";
       -webkit-font-smoothing:antialiased;display:flex;flex-direction:column;padding:56px 40px 36px}
  h1{font-size:68px;font-weight:510;letter-spacing:-0.022em;line-height:0.98;max-width:15ch}
  .sub{color:var(--fg3);font-size:19px;letter-spacing:-0.011em;margin-top:16px}
  .sub b{color:var(--fg);font-weight:510}
  header{border-bottom:var(--rule);padding-bottom:26px}

  .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;padding:34px 0 30px}
  .cell{border:var(--rule);border-radius:12px;overflow:hidden;background:#0f1011;
        box-shadow:inset 0 1px 0 0 rgba(255,255,255,0.04);display:flex;flex-direction:column}
  /* the true 4:5 frame, never cropped — the composition is the point */
  .shot{aspect-ratio:1080/1350;background-size:contain;background-position:center;
        background-repeat:no-repeat;background-color:#010102}
  figcaption{display:flex;align-items:baseline;gap:7px;padding:9px 10px;border-top:var(--rule);
             white-space:nowrap}
  .n{font-family:"JetBrains Mono",monospace;font-size:10px;color:var(--fg4)}
  .t{font-size:12.5px;letter-spacing:-0.011em;overflow:hidden;text-overflow:ellipsis}
  .t i{color:var(--accent);font-style:normal;padding:0 3px}

  .strip{margin-top:auto;display:grid;grid-template-columns:repeat(4,1fr);gap:1px;
         background:rgba(255,255,255,0.08);border:var(--rule);border-radius:12px;overflow:hidden}
  .strip div{background:#0f1011;padding:18px 20px}
  .strip .v{font-size:26px;font-weight:510;letter-spacing:-0.022em;color:var(--fg)}
  .strip .l{font-size:12px;color:var(--fg4);margin-top:3px;line-height:1.4}
  footer{border-top:var(--rule);margin-top:28px;padding-top:20px;display:flex;
         justify-content:space-between;align-items:flex-end;gap:24px}
  .by{font-size:17px;letter-spacing:-0.011em}
  .by span{color:var(--fg3)}
  .fine{font-family:"JetBrains Mono",monospace;font-size:10.5px;color:var(--fg4);
        text-align:right;line-height:1.7}
</style></head><body>
  <header>
    <h1>${TITLES[titleIdx]}</h1>
    <p class="sub">A brand's motion language rebuilt from its own CSS — <b>one object, one change</b>, five seconds each.</p>
  </header>
  <div class="grid">${cells}</div>
  <div class="strip">
    <div><div class="v">421</div><div class="l">CSS custom properties read</div></div>
    <div><div class="v">101</div><div class="l">keyframe blocks parsed</div></div>
    <div><div class="v">~4,000</div><div class="l">elements sampled per page</div></div>
    <div><div class="v">9</div><div class="l">uses of the brand colour</div></div>
  </div>
  <footer>
    <div class="by">by <span>Aline Cunico</span></div>
    <div class="fine">Unofficial design study. Not affiliated with Linear.<br>promptatelier.uk</div>
  </footer>
</body></html>`;

const tmpHtml = path.resolve('export/_cover.html');
await fs.writeFile(tmpHtml, html);
await page.goto(new URL(`file://${tmpHtml}`).href, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(600);
await page.screenshot({ path: OUT });
await browser.close();

const s = await fs.stat(OUT);
console.log(`${OUT}  ${(s.size/1048576).toFixed(2)}MB  title: "${TITLES[titleIdx]}"`);
