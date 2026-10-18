# Motion brief — Linear study

**Aline Cunico · Prompt Atelier · 2026-10-18**
Unofficial design study. Not affiliated with Linear.

This brief sits underneath all 8 animations. It turns [`style/brand-style.md`](../style/brand-style.md) and [`style/tokens.css`](../style/tokens.css) into production rules. Nothing here is a preference — every constraint traces back to a value measured from linear.app.

---

## 1. Canvas

| | |
|---|---|
| Size | **1080 × 1350** (LinkedIn portrait, 4:5) |
| Square-safe area | **y 135 → 1215**. Everything that carries meaning lives here, so a centre crop to 1080×1080 loses nothing but air. |
| Background | `--color-bg-marketing` `#010102`, edge to edge, and the same colour on the page body so the canvas edge is invisible. |
| Frame rate | Authored at 60fps, exported at 30fps. |

## 2. The loop

**Duration: exactly 5000ms, seamless.**

All motion is a pure function of one value:

```js
const T = 5000;
const t = elapsed % T;   // the only clock
draw(t);                 // deterministic — same t, same pixels, always
```

Rules that follow from this:

- **No `Math.random()` without a fixed seed.** Any scatter is computed from a deterministic hash of its index, so frame 0 of take 1 equals frame 0 of take 40.
- **No CSS animations or transitions.** Every value is set by JS from `t`. CSS keyframes cannot be seeked frame-accurately, which breaks export.
- **Every file exposes `window.seek(ms)`** and sets `window.LOOP = 5000`. The Playwright capture rig calls `seek()` 150 times and screenshots. The rAF play loop is only for viewing.
- **`draw(0)` and `draw(5000)` must be pixel-identical.** Three legal ways to get there:
  1. **Periodic** — drive from `sin/cos(2πt/T)` or a phase that wraps (`(x/k − t/T) mod 1`).
  2. **Out and back** — travel away and return, so the end state *is* the start state.
  3. **Stepped cycle** — N discrete states across the bar where state N returns to state 0. A hard cut between steps is in character for this brand (see §4), so this is not a cheat here.

## 3. One object, one change

Each piece shows **a single object** undergoing **a single change**. Consequences of that change (neighbours parting, a shadow deepening, a highlight passing) are not a second change. Ambient life — a pulse, a grain — is not a change.

**No text.** No letterforms, no numerals, no labels in any of the 8. Where a piece shows a UI moment, content is redacted to bars and chips. This keeps the study about the visual language rather than inventing product copy, and keeps it clearly unofficial.

**No logo, no wordmark, no mascot, no trademarked imagery.** Colour, type feel, shape, radius, depth and easing only.

## 4. Motion law

From §4 of the style file. These are the rules, not suggestions.

**Two speeds, nothing in between.**

| Beat | Duration | Curve | Use |
|---|---|---|---|
| React | **100–160ms** | `--ease-out-quad` `(.25,.46,.45,.94)` | state change, highlight, colour, snap-to |
| Narrate | **700ms** | `--ease-in-out-cubic` `(.645,.045,.355,1)` | a scene move with a start and an end |
| Travel | **700ms** | `--ease-snap` `(.32,.72,0,1)` | an object crossing distance — leaves fast, glides to rest |
| Reveal | **1000ms** | `--ease-out-quint` `(.23,1,.32,1)` | something arriving from nothing |

Do not author anything at 300–500ms. The brand does not live there.

**Never overshoot.** No spring, no bounce, no back-ease, no elastic. Linear's 18-curve easing set contains none, and adding one reads as a different company instantly.

**Low amplitude.** Native sizes: `scale(0.95 → 1)` for a surface arriving, `scale(0.9 → 1)` for a small one, a **1% translate** for a nudge, `scale(1.01)` for a lift. If something needs to feel bigger, brighten it — don't move it further.

**Step discrete states.** Where a thing is on or off, cut between `--dot-opacity-off: 0.3` and `--dot-opacity-on: 1` with no tween, as Linear's dot grid does. Reserve smooth interpolation for things that genuinely travel.

**Flash, don't glow.** Emphasis is Linear's own `statusFlash`: `brightness(1.6)` reached at 8% of the beat, decaying to 1 by 60%. A hit of light, then gone.

## 5. Colour law

- Build on `#010102` / `#08090a`. Surfaces step up through `#0f1011` → `#141516` → `#191a1b`.
- **Ration the accent.** Indigo appeared 9 times in 4,000 elements. In a frame, **one** element may carry `--color-accent` `#7170ff`. Never two competing.
- Foreground is `#f7f8f8` — never pure white. White is a hover state.
- Separate surfaces with `1px rgba(255,255,255,0.08)` and `--shadow-halo`, not with contrast.
- Gradients are 2–5% white washes. Colour enters only as a ≤20% directional bloom at one edge.
- Dither any large gradient — at 1080px wide, 20%-alpha ramps band visibly on LinkedIn's compression.

## 6. Shape & depth law

- Radii from the scale only: `4 / 6 / 8 / 12 / 16 / 24 / 32 / 9999`. Default to **8** for a surface and **9999** for a control.
- All geometry on the **4px grid**.
- Depth = `--shadow-halo` + `--inset-hairline` + `--inset-topline`. No light-source drop shadows.
- Hairlines are `1px` at 8% white, or `0.5px` where a retina edge is wanted.

## 7. Type (only where a piece needs a type texture)

Inter via Google Fonts, **weight 510**, tracking **−0.022em**, leading **1.0** for display. JetBrains Mono stands in for Berkeley Mono. None of the 8 animations renders type — this is here so the index and cover stay in system.

## 8. Build & delivery

- One self-contained `.html` per animation. No external assets except Google Fonts.
- Token values are copied verbatim from `tokens.css` into each file's `:root`, with a pointer back to source — so a file still runs if moved, and still carries its provenance.
- Canvas 2D by default (deterministic, crisp, cheap to seek). DOM + CSS 3D only where real perspective and blur are needed.
- Target 60fps at 1080×1350. Budget: no per-frame allocation in the draw path, no shadow-blur inside tight loops.

## 9. The 8

| # | Object → change | Register | Carries |
|---|---|---|---|
| 01 | **Dot grid → cascade** | hero | the stepped-state law, straight from Linear's own keyframes |
| 02 | **Hairline → scan** | hero | the 1px 8%-white rule and the brightness flash |
| 03 | **Status ring → progress** | UI micro | stepped cycle + `statusFlash` on each landing |
| 04 | **Issue row → reorder** | UI | 700ms `ease-snap` travel, `scale(1.01)` lift, halo depth |
| 05 | **Command list → step** | UI | keyboard-first selection, 100ms reactions, rationed accent |
| 06 | **Bar chart → build** | UI data | 1000ms `ease-out-quint` reveal, staggered |
| 07 | **Accent → bloom** | hero | gradient restraint — ≤20% colour over near-black, dithered |
| 08 | **Card stack → tilt** | hero | the `/plan` hero's perspective and depth-of-field, 700ms |

Four UI moments, four hero visuals. Each one is a different clause of the style file, so the set reads as a system rather than eight effects.
