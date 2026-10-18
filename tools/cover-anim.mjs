/**
 * Animated cover — the cover.png layout with all eight loops running live
 * inside it, captured as one 1080×1350 MP4 for LinkedIn.
 *   node tools/cover-anim.mjs [titleIndex] [repeats]
 *
 * Every tile is a real iframe in capture mode, so all eight are driven from
 * the same clock as the page: one seek, eight synchronised frames.
 */
import { chromium } from 'playwright';
import http from 'node:http';
import { createReadStream } from 'node:fs';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

const TITLES = [
  'Eight Loops, One Style File',
  'A Brand, Read From Its Own Code',
  'Motion From Tokens, Not Adjectives',
];
const titleIdx = +(process.argv[2] || 0);
const REPEATS  = +(process.argv[3] || 3);      // 3 × 5s = 15s of video
const FPS = 30, LOOP = 5000;
const OUT = 'export/cover-animated.mp4';

const ITEMS = [
  { n:'01', file:'01-dotgrid-cascade.html',   obj:'Dot grid',     ch:'cascade' },
  { n:'02', file:'02-hairline-scan.html',     obj:'Hairline',     ch:'scan'    },
  { n:'03', file:'03-status-ring-cycle.html', obj:'Status ring',  ch:'cycle'   },
  { n:'04', file:'04-issue-row-reorder.html', obj:'Issue row',    ch:'reorder' },
  { n:'05', file:'05-command-list-step.html', obj:'Command list', ch:'step'    },
  { n:'06', file:'06-bar-chart-build.html',   obj:'Bar chart',    ch:'build'   },
  { n:'07', file:'07-accent-bloom.html',      obj:'Accent',       ch:'bloom'   },
  { n:'08', file:'08-card-stack-tilt.html',   obj:'Card stack',   ch:'tilt'    },
];

const ff = (a) => execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...a], { stdio: 'inherit' });

const cells = ITEMS.map((it) => `
  <figure class="cell">
    <div class="shot"><iframe src="../animations/${it.file}?capture=1" scrolling="no" title="${it.n}"></iframe></div>
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
  /* the live 4:5 frame — a scaled 1080×1350 page, never cropped */
  .shot{aspect-ratio:1080/1350;position:relative;overflow:hidden;background:#010102}
  .shot iframe{position:absolute;top:0;left:0;width:1080px;height:1350px;border:0;
               transform-origin:0 0;display:block}
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

<script>
  /* scale each 1080-wide iframe into its tile */
  function fit(){
    for (const s of document.querySelectorAll('.shot')){
      const f = s.querySelector('iframe');
      f.style.transform = 'scale(' + (s.clientWidth / 1080) + ')';
    }
  }
  window.addEventListener('load', fit); fit();

  /* one clock for the whole composition */
  window.seekAll = (ms) => {
    for (const f of document.querySelectorAll('.shot iframe')){
      try { f.contentWindow.seek(ms); } catch(e){}
    }
  };
  window.allReady = () => [...document.querySelectorAll('.shot iframe')]
    .every(f => { try { return typeof f.contentWindow.seek === 'function'; } catch(e){ return false; } });
</script>
</body></html>`;

const pageFile = path.resolve('export/_cover-anim.html');
await fs.writeFile(pageFile, html);

/* file:// iframes are opaque origins, so the parent cannot call seek() on
   them. Serve the project over localhost instead — same origin, full access. */
const ROOT = path.resolve('.');
const MIME = { '.html':'text/html', '.css':'text/css', '.js':'text/javascript',
               '.png':'image/png', '.gif':'image/gif', '.mp4':'video/mp4', '.json':'application/json' };
const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '');
  const abs = path.resolve(ROOT, rel);
  if (!abs.startsWith(ROOT)) { res.writeHead(403).end(); return; }
  createReadStream(abs)
    .on('open', () => res.writeHead(200, { 'Content-Type': MIME[path.extname(abs)] || 'application/octet-stream' }))
    .on('error', () => res.writeHead(404).end())
    .pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const PORT = server.address().port;

const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'coveranim-'));
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
await page.goto(`http://127.0.0.1:${PORT}/export/_cover-anim.html`, { waitUntil: 'networkidle' });
await page.waitForFunction(() => window.allReady && window.allReady(), null, { timeout: 40000 });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(800);

const frames = Math.round((LOOP / 1000) * FPS);
process.stdout.write(`capturing ${frames} composite frames `);
for (let i = 0; i < frames; i++) {
  await page.evaluate((ms) => window.seekAll(ms), (LOOP * i) / frames);
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  await page.screenshot({ path: path.join(tmp, `f${String(i).padStart(4, '0')}.png`) });
  if (i % 25 === 0) process.stdout.write('.');
}
await browser.close();
process.stdout.write(' encoding\n');

/* one clean 5s loop, then repeated to a comfortable feed length.
   A silent AAC track keeps LinkedIn's encoder happy.             */
const one = path.join(tmp, 'one.mp4');
ff(['-framerate', String(FPS), '-i', path.join(tmp, 'f%04d.png'),
    '-c:v', 'libx264', '-profile:v', 'high', '-crf', '18', '-preset', 'slow',
    '-pix_fmt', 'yuv420p', one]);

ff(['-stream_loop', String(REPEATS - 1), '-i', one,
    '-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100',
    '-shortest', '-c:v', 'libx264', '-profile:v', 'high', '-crf', '18', '-preset', 'slow',
    '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '96k',
    '-movflags', '+faststart', '-r', String(FPS), OUT]);

await fs.rm(tmp, { recursive: true, force: true });
await fs.rm(pageFile, { force: true });

const s = await fs.stat(OUT);
console.log(`${OUT}  ${(s.size/1048576).toFixed(2)}MB  ${REPEATS} × 5s = ${REPEATS*5}s  title: "${TITLES[titleIdx]}"`);
