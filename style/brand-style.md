# Linear — design system, read from the code

**Unofficial design study by Aline Cunico. Not affiliated with Linear.**
No logo, wordmark or trademarked imagery is used anywhere in this study — colours, type feel, shapes, radii, depth and easing only.

**Source:** `linear.app` (home), `linear.app/plan`, `linear.app/build`
**Method:** Playwright + headless Chrome, 1440×900 @2×, 2026-10-18. Read 421 CSS custom properties, 2,905 same-origin rules, 101 `@keyframes` blocks, 76 stylesheets, and computed styles across ~4,000 visible elements per page.
**Raw evidence:** `style/raw/digest.txt`, `style/raw/*.json`, `style/raw/all-stylesheets.css`

---

## 1. Palette

Linear's palette is not a colour system with a dark mode. It is a **near-black system that admits colour as an exception.** Over 4,000 sampled elements, the five most common colours are all greyscale, and the most common *accent* use is a 2% white wash.

### Surfaces — a five-step ladder down to black

| Token | Hex | Role |
|---|---|---|
| `--color-bg-marketing` | `#010102` | marketing canvas — effectively black |
| `--color-bg-level-0` | `#08090a` | app canvas, primary background (82 uses) |
| `--color-bg-level-1` | `#0f1011` | panel (38 uses) |
| `--color-bg-level-2` | `#141516` | tint / raised surface |
| `--color-bg-level-3` | `#191a1b` | highest raised surface |
| `--color-bg-translucent` | `#ffffff0d` | 5% white — the universal "lift" |

The steps are **tiny**: `#08090a` → `#0f1011` is 7 points of luminance. Surfaces are separated by hairlines and shadow, not by contrast.

### Foreground — four steps, and they do all the hierarchy work

| Token | Hex | Observed | Role |
|---|---|---|---|
| `--color-fg-primary` | `#f7f8f8` | 2,612× | headlines, body — an off-white, never `#fff` |
| `--color-fg-secondary` | `#d0d6e0` | 237× | secondary text, slightly cool |
| `--color-fg-tertiary` | `#8a8f98` | 640× | subheads, labels, most captions |
| `--color-fg-quaternary` | `#62666d` | 359× | dimmest readable state |

Note `#f7f8f8`, not white. Pure `#ffffff` appears 115× and is reserved for hover states and the inverted button fill.

### Accent

| Token | Hex | Role |
|---|---|---|
| `--color-accent` | `#7170ff` | the violet |
| `--color-brand-bg` / `--color-indigo` | `#5e6ad2` | primary brand fill, focus ring base |
| `--color-accent-hover` / `--color-link-primary` | `#828fff` | hover, links |
| `--color-accent-tint` | `#18182f` | accent at ~8% over the canvas |

Indigo `#5e6ad2` appeared **9 times** in a 4,000-element sample. That is the headline finding of this whole extraction: *the brand colour is almost never on screen.* It marks one thing at a time.

### Product & semantic hues

`--color-plan #68cc58` · `--color-build #d4b144` · `--color-security #7a7fad`
`--color-blue #4ea7fc` · `--color-green #27a644` · `--color-teal #00b8cc` · `--color-yellow #f0bf00` · `--color-orange #fc7840` · `--color-red #eb5757`

### Warm illustration tints

`#f79ce0` (41×) · `#f7bf8b` (22×) · `#ffdf9f` · `#8fa6ff` — these live only in hero illustration layers, never in UI. Worth having, worth rationing.

---

## 2. Type

**Family:** `"Inter Variable"`, with `font-feature-settings: "cv01", "ss03"`. Mono is `"Berkeley Mono"` (280 uses — real, not decorative).

> **Substitution for this study:** Google Fonts **Inter** (the same typeface, variable axis) and **JetBrains Mono** in place of Berkeley Mono — similar grid and x-height, slightly wider. The serif display token `"Tiempos Headline"` maps to **Instrument Serif**, though no animation in this study uses it.

**Weights are variable-font values, not standard steps:**
`300` light · `400` normal (3,871×) · **`510` medium (364×)** · `590` semibold · `680` bold

510 is the critical one. Every headline on the site is weight 510 — heavier than regular, lighter than semibold. It is the single most recognisable thing about Linear's type after the tracking. Using 500 or 600 reads as "almost Linear".

**Size scale:** 11 / 12 / 13 / **15 (body)** / 18 / 20 / 24 / 36, with display at 48 / 64 / 72.

**Tracking is a constant ratio, measured:**
- Display: **−0.022em** (h1 64px → −1.408px; h2 48px → −1.056px)
- Body: **−0.011em** (15px → −0.165px; 13px → −0.13px)

**Leading:** display `1.0` (h1 is 64px/64px — set solid); body `1.6` (15px/24px).

Tight-set, almost-solid display type over generous body leading is the type signature.

---

## 3. Surfaces & depth

**Borders.** One value dominates: `1px solid rgba(255,255,255,0.08)` — 95 occurrences, more than every other border combined. There is also a `0.5px` hairline token for retina edges.

**Radii.** `9999px` (110×) and `8px` (72×) do most of the work: pills for controls and chips, 8px for cards and inputs. Then 4 / 6 / 12 / 16 / 24 / 32.

**Shadow is not a drop shadow.** The most common real card treatment is a *black halo*:

```
0px 8.576px 12.863px #08090a, 0px 0px 68.604px #08090a
```

A large, soft, same-as-background bloom that makes a card read as floating in the dark rather than casting light. Alongside it, depth comes from **inset hairlines**: `inset 0 0 0 1px rgba(255,255,255,0.05)` and `inset 0 1px 0 rgba(255,255,255,0.04)` — a 1px top highlight, like a bevel catching light from above.

**Gradients are white washes, not colour ramps.** The most common is `linear-gradient(rgba(255,255,255,0.02), rgba(255,255,255,0.02))` — a 2% flat lift. Colour appears as a **directional 20% bloom** at one edge of a surface (`rgba(113,112,255,0.2)` fading to transparent), never as a full-bleed rainbow.

**Blur:** `20px` backdrop on the header (`#0b0b0bcc` + `rgba(255,255,255,0.08)` border), `4px` for soft-focus layers. The `/plan` hero is a heavily blurred, tilted product screenshot at very low luminance — blur as atmosphere, not as a glass effect.

**Spacing:** strict 4px base — 2 / 4 / 6 / 8 / 12 / 16 / 20 / 24 / 32 / 48 / 64 / 96 / 128.

---

## 4. Motion personality

Five adjectives, each with the code behind it.

### 1. Instant
`--speed-quickTransition: 0.1s`. The single most common transition on the site is `color 0.1s cubic-bezier(0.25,0.46,0.45,0.94)` — **289 occurrences**. Default UI feedback is at the edge of perception. Anything you can do in 100ms, Linear does in 100ms.

### 2. Decelerating, never bouncing
`--ease-out-quad` `cubic-bezier(0.25,0.46,0.45,0.94)` is the workhorse (187 uses). Look at what the 18-curve easing set *omits*: there is no `back`, no `elastic`, no spring, no overshoot anywhere. Motion arrives and settles. Values land once.

### 3. Two-speed, with nothing in between
UI feedback runs at **0.1–0.16s**. Scene and hero moves run at **0.7s** with `--ease-in-out-cubic` `cubic-bezier(0.645,0.045,0.355,1)` (24 uses on opacity, 12 on transform+filter). There is almost nothing at 0.3–0.5s. The brand is either *reacting* or *narrating* — never ambling.

A fourth curve appears on 0.7s `transform` and `stroke` moves and is **not** in the published token set: `cubic-bezier(0.32,0.72,0,1)`. It leaves fast and glides to a stop — the "snap then settle" feel. Captured as `--ease-snap`.

### 4. Stepped, not smeared
The 101 `@keyframes` blocks are dominated by Linear's animated dot-grid, and they are built from **duplicated keyframe stops**:

```css
@keyframes grid-dot-2-2-pong {
  0% { opacity: 0.3 } 12.5% { opacity: 0.3 }
  12.5% { opacity: 1 } 25% { opacity: 1 }   /* hard switch, no tween */
}
```

Dots toggle between exactly `0.3` and `1` at 7.14% / 12.5% intervals. This is state change, not fading — a grid of things *flipping on*, like data arriving. Elsewhere, `blink` runs on `steps(1)`.

### 5. Low-amplitude
Dialogs open at `scale(0.95) → 1`. Popovers at `scale(0.9) → 1`. The dialog's position move is `translate(-50%, -49%)` — a **1% nudge**. Nothing travels far. Depth and emphasis come from a 1px inset highlight and a brightness flash (`statusFlash` peaks at `brightness(1.6)` at 8% of its duration, then decays), not from distance.

### Motion in one sentence
*Near-instant state changes on decelerating curves, punctuated by slow, confident 0.7s scene moves — with amplitude kept so low that light does the work movement would do elsewhere.*

---

## 5. Do's and don'ts

**Do**
- Build on `#08090a`, separate surfaces with a 1px `rgba(255,255,255,0.08)` line and a black halo.
- Keep the accent to one element at a time — nine occurrences in four thousand.
- Use weight **510** for display type, tracking **−0.022em**, leading **1.0**.
- Let changes land in 100–160ms, or narrate them over 700ms. Avoid the middle.
- Use `ease-out-quad` by default, `ease-in-out-cubic` for scene moves, `--ease-snap` for a travelling object.
- Step discrete states (opacity 0.3 ↔ 1) rather than cross-fading them.
- Use a 1px top inset highlight and a brightness flash for emphasis.
- Pin everything to the 4px spacing grid; prefer `8px` and `9999px` radii.

**Don't**
- Don't use pure `#ffffff` for body text — it's `#f7f8f8`. White is a hover state.
- Don't add spring, bounce or overshoot. It is not in the system, and it reads as another brand instantly.
- Don't build saturated multi-stop gradients. Linear's gradients are 2–5% white washes; colour enters as a 20% directional bloom at one edge.
- Don't use drop shadows that imply a light source. Use the same-as-background halo.
- Don't move objects far. Scale 0.9→1 and 1% translations are the native amplitude.
- Don't use weight 500 or 600 as a shortcut for 510/590 — the difference is visible at display size.
- Don't let more than one thing change at a time. One object, one change.
- Never use the logo, wordmark or any trademarked imagery. This is a study of a visual language, not a brand asset.
