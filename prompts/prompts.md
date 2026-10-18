# The prompts

**Linear motion study · Aline Cunico · Prompt Atelier**
Unofficial design study. Not affiliated with Linear.

These are the exact one-line prompts behind the eight animations. They are written to be reused with **any** style file — nothing below names Linear, a hex value or a curve. The brand comes from the two files you load first; the prompt only says what to make.

---

## How to use these

Give the model three things, in this order:

1. **`style/tokens.css`** — the brand's measured values as CSS custom properties.
2. **`brief/motion-brief.md`** — the global rules: canvas, loop, easing law, colour law, one object one change.
3. **One line from below.**

Then this standing instruction, which is what makes the set hold together:

> Use only values from tokens.css. Drive all motion from a single `t = elapsed % 5000`. Expose `window.seek(ms)` and set `window.LOOP`. No CSS animations, no unseeded randomness. `draw(0)` must be pixel-identical to `draw(5000)`.

The prompts are deliberately short. Everything that makes the output look like the brand is in the style file, not in the sentence — that is the whole point of the method. If you find yourself adding adjectives to the prompt, the gap belongs in the style file instead.

---

## The eight

**01 — Dot grid → cascade**
> A regular field of dots fills the canvas; a diagonal wavefront travels across it, flipping dots between discrete opacity states with no tween, looping seamlessly as a function of position minus time.

**02 — Hairline → scan**
> A ruled field of horizontal hairlines of varying length, like rows of redacted content; one scan band travels down the frame and each line it crosses flashes to full brightness in hard tiers, then returns.

**03 — Status ring → cycle**
> A circular status mark with a track ring and eight tick positions; a single arc steps to the next position on each beat, landing with a short scale pop and a brightness flash that decays.

**04 — Issue row → reorder**
> A vertical list of six redacted rows; one row lifts, travels up three positions while the others part to make room, holds, then travels back and settles — the only element in the frame carrying the accent.

**05 — Command list → step**
> A floating command panel with a redacted query, a blinking caret and six rows; the selection highlight cuts instantly from row to row on each beat and its colour settles over the brand's fastest transition, wrapping to the top at the end of the bar.

**06 — Bar chart → build**
> Twelve bars rise from zero in a staggered reveal with the brand's slowest ease, hold at full height, then fall back in reverse order — one bar, the tallest, carries the accent and a bloom behind it.

**07 — Accent → bloom**
> A still hairline grid over a near-black field, with a soft accent bloom drifting behind it on a single Lissajous period; the structure never moves, only the light, and the gradient is dithered to survive compression.

**08 — Card stack → tilt**
> Three abstract UI surfaces arranged at different depths on one plane in perspective, with fixed depth-of-field blur; the plane tilts through a few degrees on every axis across one period so the parallax, not the travel, does the work.

---

## Notes on writing prompts like these

**Name the object and the change, nothing else.** "Twelve bars rise from zero" is a brief. "Twelve beautiful glowing premium bars rise elegantly from zero with a satisfying bounce" is a wish, and it will fight your style file — in this brand's case, the word *bounce* alone would break a rule the real CSS does not contain.

**Refer to the brand's values by role, never by number.** "the brand's slowest ease", "the accent", "the fastest transition". This is what makes a prompt portable: swap `tokens.css` for another brand's and the same sentence produces that brand's version. Hardcode `cubic-bezier(.23,1,.32,1)` and you have written a Linear prompt that is useless to anyone else.

**Put the loop mechanics in the standing instruction, not the prompt.** Seamlessness, determinism and `seek()` are properties of every piece in the set. Repeating them eight times is noise; stating them once is a system.

**Let the constraint do the design work.** "One object, one change" removes most of the decisions before you start, which is why these took minutes each rather than hours. The pieces that needed real iteration were the two where I broke the rule and had two things changing at once.
