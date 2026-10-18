/**
 * Renders each animation at several points in its loop and writes a contact
 * sheet per file, so the whole set can be eyeballed quickly.
 * Usage: node tools/contact-sheet.mjs <outDir> [frameCount]
 */
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const outDir = process.argv[2] || 'scratch';
const COUNT = +(process.argv[3] || 4);
await fs.mkdir(outDir, { recursive: true });

const files = (await fs.readdir('animations'))
  .filter((f) => /^\d\d-.*\.html$/.test(f)).sort();

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });

for (const f of files) {
  const url = new URL(`file://${path.resolve('animations', f)}?capture=1`).href;
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => typeof window.seek === 'function', null, { timeout: 15000 });
  const loop = await page.evaluate(() => window.LOOP);
  const name = f.replace('.html', '');
  for (let i = 0; i < COUNT; i++) {
    const t = Math.round((loop * i) / COUNT);
    await page.evaluate((ms) => window.seek(ms), t);
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    await page.screenshot({ path: path.join(outDir, `${name}-t${String(t).padStart(4, '0')}.png`) });
  }
  // seam check: does t=0 equal t=LOOP?
  await page.evaluate(() => window.seek(0));
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  const a = await page.screenshot();
  await page.evaluate((l) => window.seek(l), loop);
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  const b = await page.screenshot();
  console.log(`${name}  loop=${loop}ms  seam=${Buffer.compare(a, b) === 0 ? 'EXACT' : 'DIFFERS'}`);
}

await browser.close();
