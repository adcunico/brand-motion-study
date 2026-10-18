/**
 * Phase 1 extractor — reads the real CSS + computed styles of a brand's pages.
 * Usage: node tools/extract.mjs
 * Writes: reference/*.png, style/raw/*.json, style/raw/*.css
 */
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const OUT_REF = 'reference';
const OUT_RAW = 'style/raw';

const PAGES = [
  { name: 'home', url: 'https://linear.app/' },
  { name: 'product-plan', url: 'https://linear.app/plan' },
  { name: 'product-build', url: 'https://linear.app/build' },
];

await fs.mkdir(OUT_REF, { recursive: true });
await fs.mkdir(OUT_RAW, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
});

const allCss = [];

for (const p of PAGES) {
  const page = await ctx.newPage();
  const cssTexts = [];

  // capture every stylesheet response body as it loads
  page.on('response', async (res) => {
    try {
      const ct = res.headers()['content-type'] || '';
      if (ct.includes('text/css')) {
        cssTexts.push({ url: res.url(), text: await res.text() });
      }
    } catch {}
  });

  console.log('→', p.url);
  await page.goto(p.url, { waitUntil: 'networkidle', timeout: 90000 }).catch(() => {});
  await page.waitForTimeout(3500);

  // dismiss cookie banner if present (choose the most privacy-preserving option)
  for (const sel of ['button:has-text("Reject")', 'button:has-text("Decline")', 'button:has-text("Only necessary")']) {
    const b = page.locator(sel).first();
    if (await b.count().catch(() => 0)) { await b.click({ timeout: 2000 }).catch(() => {}); break; }
  }
  await page.waitForTimeout(800);

  // ---- screenshots ----
  await page.screenshot({ path: path.join(OUT_REF, `${p.name}-viewport.png`) });
  await page.screenshot({ path: path.join(OUT_REF, `${p.name}-full.png`), fullPage: true }).catch(() => {});

  // ---- in-page analysis ----
  const data = await page.evaluate(() => {
    const out = {
      customProps: {},
      inlineStyleBlocks: [],
      sameOriginRules: 0,
      colors: {},
      bgImages: {},
      fonts: {},
      fontSizes: {},
      fontWeights: {},
      letterSpacing: {},
      radii: {},
      shadows: {},
      filters: {},
      borders: {},
      transitions: {},
      animations: {},
      keyframes: {},
      spacing: {},
      fontFaces: [],
      sample: [],
    };

    const bump = (bag, k) => { if (!k) return; k = String(k).trim(); if (!k || k === 'none' || k === 'normal' || k === 'auto' || k === '0px' || k === 'rgba(0, 0, 0, 0)') return; bag[k] = (bag[k] || 0) + 1; };

    // 1. CSS custom properties resolved on :root and body
    for (const el of [document.documentElement, document.body]) {
      const cs = getComputedStyle(el);
      for (let i = 0; i < cs.length; i++) {
        const prop = cs[i];
        if (prop.startsWith('--')) out.customProps[prop] = cs.getPropertyValue(prop).trim();
      }
    }

    // 2. same-origin stylesheet rules: keyframes, font-faces, :root var declarations
    for (const sheet of Array.from(document.styleSheets)) {
      let rules;
      try { rules = sheet.cssRules; } catch { continue; }
      if (!rules) continue;
      const walk = (list) => {
        for (const r of Array.from(list)) {
          out.sameOriginRules++;
          if (r.type === CSSRule.KEYFRAMES_RULE || r.constructor.name === 'CSSKeyframesRule') {
            out.keyframes[r.name] = Array.from(r.cssRules).map((k) => k.cssText).join(' ');
          } else if (r.constructor.name === 'CSSFontFaceRule') {
            out.fontFaces.push(r.cssText);
          } else if (r.cssRules) {
            walk(r.cssRules);
          }
        }
      };
      walk(rules);
    }

    // 3. computed styles across a wide sample of visible elements
    const els = Array.from(document.querySelectorAll('*')).filter((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 2 && r.height > 2;
    });

    for (const el of els.slice(0, 4000)) {
      const cs = getComputedStyle(el);
      bump(out.colors, cs.color);
      bump(out.colors, cs.backgroundColor);
      bump(out.bgImages, cs.backgroundImage);
      bump(out.fonts, cs.fontFamily);
      bump(out.fontSizes, cs.fontSize);
      bump(out.fontWeights, cs.fontWeight);
      bump(out.letterSpacing, cs.letterSpacing);
      bump(out.radii, cs.borderRadius);
      bump(out.shadows, cs.boxShadow);
      bump(out.filters, cs.backdropFilter || cs.webkitBackdropFilter);
      if (cs.borderTopWidth !== '0px') bump(out.borders, `${cs.borderTopWidth} ${cs.borderTopStyle} ${cs.borderTopColor}`);
      if (cs.transitionDuration !== '0s') {
        bump(out.transitions, `${cs.transitionProperty} | ${cs.transitionDuration} | ${cs.transitionTimingFunction}`);
      }
      if (cs.animationName !== 'none') {
        bump(out.animations, `${cs.animationName} | ${cs.animationDuration} | ${cs.animationTimingFunction} | ${cs.animationIterationCount}`);
      }
      bump(out.spacing, cs.gap);
      bump(out.spacing, cs.paddingTop);
    }

    // 4. a few named samples for context
    const named = [
      ['h1', 'h1'], ['h2', 'h2'], ['bodytext', 'p'],
      ['primaryButton', 'a[href*="signup"], button'],
      ['card', '[class*="card"]'],
      ['header', 'header'],
    ];
    for (const [label, sel] of named) {
      const el = document.querySelector(sel);
      if (!el) continue;
      const cs = getComputedStyle(el);
      out.sample.push({
        label, sel, tag: el.tagName, cls: (el.className || '').toString().slice(0, 120),
        color: cs.color, background: cs.backgroundColor, backgroundImage: cs.backgroundImage.slice(0, 400),
        font: cs.fontFamily, size: cs.fontSize, weight: cs.fontWeight, lh: cs.lineHeight,
        ls: cs.letterSpacing, radius: cs.borderRadius, shadow: cs.boxShadow.slice(0, 300),
        border: `${cs.borderTopWidth} ${cs.borderTopStyle} ${cs.borderTopColor}`,
        transition: `${cs.transitionProperty} ${cs.transitionDuration} ${cs.transitionTimingFunction}`,
      });
    }

    for (const s of Array.from(document.querySelectorAll('style'))) {
      if (s.textContent && s.textContent.length > 40) out.inlineStyleBlocks.push(s.textContent);
    }

    return out;
  });

  data.url = p.url;
  data.capturedCssFiles = cssTexts.map((c) => c.url);
  allCss.push(...cssTexts);

  await fs.writeFile(path.join(OUT_RAW, `${p.name}.json`), JSON.stringify(data, null, 2));
  // inline <style> blocks are where most of Linear's tokens live
  await fs.writeFile(path.join(OUT_RAW, `${p.name}-inline.css`), data.inlineStyleBlocks.join('\n\n/* ---- */\n\n'));
  console.log(`  rules:${data.sameOriginRules} props:${Object.keys(data.customProps).length} keyframes:${Object.keys(data.keyframes).length} cssFiles:${cssTexts.length}`);
  await page.close();
}

await fs.writeFile(
  path.join(OUT_RAW, 'all-stylesheets.css'),
  allCss.map((c) => `/* ===== ${c.url} ===== */\n${c.text}`).join('\n\n')
);

await browser.close();
console.log('done');
