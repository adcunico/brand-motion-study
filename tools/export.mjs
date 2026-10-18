/**
 * Phase 3 — capture each animation frame-accurately and encode.
 *   node tools/export.mjs            all eight
 *   node tools/export.mjs 03 07      just those
 *
 * Captures 150 frames (30fps × 5s) by calling window.seek(), then:
 *   export/mp4/NN-name.mp4   H.264 1080×1350
 *   export/gif/NN-name.gif   540px wide, palettegen/paletteuse, infinite loop
 */
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

const FPS = 30;
const only = process.argv.slice(2);

const files = (await fs.readdir('animations'))
  .filter((f) => /^\d\d-.*\.html$/.test(f))
  .filter((f) => !only.length || only.some((o) => f.startsWith(o)))
  .sort();

await fs.mkdir('export/mp4', { recursive: true });
await fs.mkdir('export/gif', { recursive: true });

const ff = (args) => execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: 'inherit' });

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });

for (const f of files) {
  const name = f.replace('.html', '');
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), `frames-${name}-`));

  await page.goto(new URL(`file://${path.resolve('animations', f)}?capture=1`).href, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => typeof window.seek === 'function', null, { timeout: 20000 });
  await page.evaluate(() => document.fonts && document.fonts.ready);
  const loop = await page.evaluate(() => window.LOOP);
  const frames = Math.round((loop / 1000) * FPS);

  process.stdout.write(`${name}: capturing ${frames} frames `);
  for (let i = 0; i < frames; i++) {
    const t = (loop * i) / frames;            // 0 … loop-step, never loop itself
    await page.evaluate((ms) => window.seek(ms), t);
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    await page.screenshot({ path: path.join(tmp, `f${String(i).padStart(4, '0')}.png`) });
    if (i % 30 === 0) process.stdout.write('.');
  }
  process.stdout.write(' encoding ');

  const mp4 = `export/mp4/${name}.mp4`;
  ff(['-framerate', String(FPS), '-i', path.join(tmp, 'f%04d.png'),
      '-c:v', 'libx264', '-profile:v', 'high', '-crf', '17', '-preset', 'slow',
      '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
      '-vf', 'scale=1080:1350:flags=lanczos', mp4]);

  const pal = path.join(tmp, 'pal.png');
  ff(['-i', path.join(tmp, 'f%04d.png'),
      '-vf', 'fps=20,scale=540:-1:flags=lanczos,palettegen=max_colors=192:stats_mode=diff', pal]);
  const gif = `export/gif/${name}.gif`;
  ff(['-framerate', String(FPS), '-i', path.join(tmp, 'f%04d.png'), '-i', pal,
      '-lavfi', 'fps=20,scale=540:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=3:diff_mode=rectangle',
      '-loop', '0', gif]);

  // keep the frames of the best moment for the cover; drop the rest
  await fs.rm(tmp, { recursive: true, force: true });

  const [a, b] = await Promise.all([fs.stat(mp4), fs.stat(gif)]);
  console.log(`✓  mp4 ${(a.size/1048576).toFixed(2)}MB   gif ${(b.size/1048576).toFixed(2)}MB`);
}

await browser.close();
