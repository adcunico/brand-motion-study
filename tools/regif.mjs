/**
 * Re-capture one animation in GIF mode (grain off) and encode down a ladder
 * until the file fits the budget. Frames are captured once and reused.
 *   node tools/regif.mjs 07 [budgetMB]
 */
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

const ff = (a) => execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...a], { stdio: 'inherit' });
const name = process.argv[2];
const BUDGET = (+(process.argv[3] || 5)) * 1048576;

const file = (await fs.readdir('animations')).find((f) => f.startsWith(name) && f.endsWith('.html'));
const base = file.replace('.html', '');
const out = `export/gif/${base}.gif`;
const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'regif-'));

/* capture at 30fps once; the ladder decimates with fps= in the filter */
const SRC_FPS = 30;
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
await p.goto(new URL(`file://${path.resolve('animations', file)}?capture=1&gif=1`).href, { waitUntil: 'networkidle' });
await p.waitForFunction(() => typeof window.seek === 'function');
const loop = await p.evaluate(() => window.LOOP);
const N = Math.round((loop / 1000) * SRC_FPS);
for (let i = 0; i < N; i++) {
  await p.evaluate((ms) => window.seek(ms), (loop * i) / N);
  await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  await p.screenshot({ path: path.join(tmp, `f${String(i).padStart(4, '0')}.png`) });
}
await b.close();

const LADDER = [
  { fps: 20, colors: 192, bs: 4 },
  { fps: 16, colors: 128, bs: 4 },
  { fps: 15, colors: 96,  bs: 5 },
  { fps: 12, colors: 64,  bs: 5 },
  { fps: 10, colors: 48,  bs: 5 },
];

for (const s of LADDER) {
  const chain = `fps=${s.fps},scale=540:-1:flags=lanczos`;
  const pal = path.join(tmp, 'p.png');
  ff(['-i', path.join(tmp, 'f%04d.png'), '-vf', `${chain},palettegen=max_colors=${s.colors}:stats_mode=diff`, pal]);
  ff(['-framerate', String(SRC_FPS), '-i', path.join(tmp, 'f%04d.png'), '-i', pal,
      '-lavfi', `${chain}[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=${s.bs}:diff_mode=rectangle`,
      '-loop', '0', out]);
  const sz = (await fs.stat(out)).size;
  console.log(`  ${s.fps}fps / ${s.colors} colours → ${(sz/1048576).toFixed(2)}MB`);
  if (sz <= BUDGET) { console.log(`${base}.gif  FITS at ${s.fps}fps / ${s.colors} colours`); break; }
}
await fs.rm(tmp, { recursive: true, force: true });
