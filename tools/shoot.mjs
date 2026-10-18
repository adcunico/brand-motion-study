import { chromium } from 'playwright';
import path from 'node:path';
const [, , file, out, w, h, full] = process.argv;
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({
  viewport: { width: +(w || 1200), height: +(h || 900) },
  deviceScaleFactor: 2,
});
await p.goto(new URL(`file://${path.resolve(file)}`).href, { waitUntil: 'networkidle' });
await p.waitForTimeout(2500);
await p.screenshot({ path: out, fullPage: full === 'full' });
await b.close();
console.log('shot →', out);
