# Brand Motion Study

**Recreate a brand's motion language from its own CSS, then generate a set of looping motion graphics from it.**

Point it at a brand's public site. It reads the live stylesheets and computed styles, writes a style file, and you build looping motion graphics that can only use the values it found. No adjectives, no mood board, no guessing.

Built with [Claude Code](https://claude.com/claude-code), Playwright and ffmpeg. By [Aline Cunico](https://www.linkedin.com/in/alinecunico/) for [Prompt Atelier](https://promptatelier.uk) — Episode 18.

> **This repo is the method.** The worked example is an unofficial study of [Linear](https://linear.app), used because its design system is unusually well-structured. Not affiliated with Linear. No logo, wordmark or trademarked imagery appears anywhere in the output — colours, type feel, shapes, radii, depth and easing only.

---

## Why

Ask a model for something "confident, modern, premium" and you get a confident, modern, premium average of everything it has seen. Adjectives are lossy — four words that could describe two hundred companies.

But most brands publish their design system every day, in public, in a form that isn't lossy at all. It's called CSS.

The useful part isn't the animations. It's that *"is this on brand?"* becomes a question you answer by reading a file rather than convening a meeting.

---

## What came out of the worked example

Reading `linear.app` returned **421 CSS custom properties, 101 `@keyframes` blocks, 76 stylesheets** and the computed styles of ~4,000 elements per page. Three findings changed the work:

- **The accent appears 9 times in 4,000 elements.** It isn't a hero colour, it's a pointer. Every loop now carries exactly one accent element, which is most of why they read as a family.
- **Not one of the 18 published easing curves overshoots.** No spring, no bounce, no elastic. You can't see an absence on a mood board.
- **The dot grid steps rather than fades** — duplicated keyframe stops cutting opacity between exactly `0.3` and `1`. That became a rule for the whole set.

---

## Quick start

```bash
npm install
npx playwright install chromium     # or set channel:'chrome' to use system Chrome

node tools/extract.mjs              # read the site → style/raw/
node tools/summarise.mjs > style/raw/digest.txt
```

Then hand Claude `style/tokens.css` + `brief/motion-brief.md` + one line from `prompts/prompts.md`.

```bash
node tools/export.mjs               # frames → MP4 + GIF
node tools/cover.mjs 0              # grid cover PNG
node tools/cover-anim.mjs 0 3       # animated grid MP4, for social
node tools/reel.mjs                 # all eight, cut together
```

Point it at a different brand by editing the `PAGES` array at the top of `tools/extract.mjs`.

---

## What's in here

| Path | |
|---|---|
| `tools/extract.mjs` | reads live CSS + computed styles, screenshots the pages |
| `tools/summarise.mjs` | condenses the dumps into a readable digest |
| `style/brand-style.md` | the human-readable system — every claim cites the code behind it |
| `style/tokens.css` | every measured value as a custom property |
| `style/swatches.html` | one-page swatch sheet with live easing curves |
| `brief/motion-brief.md` | the global rules: canvas, loop, easing law, colour law |
| `animations/*.html` | the eight loops — self-contained, seekable, deterministic |
| `prompts/prompts.md` | the eight one-line prompts, written to be reused with any style file |
| `tools/export.mjs` | frame-accurate capture → MP4 + GIF |
| `tools/cover*.mjs`, `tools/reel.mjs` | grid cover (static + animated) and the reel |
| `site/` | the Prompt Atelier case-study page |

Rendered output and the raw CSS dumps are gitignored — regenerate them with the commands above.

---

## The two rules that do most of the work

**One object, one change.** Each piece shows a single object undergoing a single change. Consequences of that change aren't a second change. This removes most of the decisions before you start.

**One clock.** All motion is a pure function of `t = elapsed % 5000`. Every file exposes `window.seek(ms)`, so the renderer can ask for any frame and get the same pixels every time:

```js
window.LOOP = 5000;
window.seek = ms => draw(((ms % 5000) + 5000) % 5000);
```

No CSS animations (they can't be seeked frame-accurately) and no unseeded randomness. `draw(0)` is pixel-identical to `draw(5000)` in all eight — verified, not assumed.

---

## Writing prompts that port to another brand

Refer to brand values **by role**, never by number:

> Twelve bars rise from zero in a staggered reveal with **the brand's slowest ease**, hold at full height, then fall back in reverse order — one bar, the tallest, carries **the accent** and a bloom behind it.

Swap `tokens.css` for another brand's and the same sentence produces that brand's version. Hardcode `cubic-bezier(.23,1,.32,1)` and you've written a prompt that's useless to anyone else.

---

## Honest limitations

- **Type substitution shows.** Google Fonts Inter matches Linear's weight 510 and −0.022em tracking exactly; JetBrains Mono standing in for Berkeley Mono does not.
- **Measured isn't composed.** Extraction gives you a palette, not a layout. Several pieces were technically correct and visually flat until they got real design attention.
- **The study is brighter than the source.** Resting hairlines went from 8% to 16–20% white, because values that read on a 1440px page vanish at 1080px square after social compression.
- **Only reads what's rendered.** Tokens defined but unused on the pages you load won't be found. Load more pages for more coverage.

---

## Licence

MIT for the code. The extracted values describe someone else's design system and are published here for study and commentary — if you run this on a brand, keep it clearly unofficial and keep their trademarks out of your output.
