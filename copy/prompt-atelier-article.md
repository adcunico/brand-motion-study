# Read the Code, Not the Mood Board

**Standfirst —** I rebuilt a brand's motion language from its own CSS instead of describing it in adjectives. Eight five-second loops later, the interesting output wasn't the animation. It was the file.

---

## The idea

Ask a model to make something "in the style of a confident, modern, premium software brand" and you will get exactly that: a confident, modern, premium average of everything it has seen. The adjectives are the problem. They are lossy by design — a compression of a visual system down to four words that could describe two hundred companies.

But most brands publish their design system every day, in public, in a form that isn't lossy at all. It's called CSS.

So for this study I skipped the describing. I pointed a headless browser at a design-led product site, read its live stylesheets and computed styles, and turned what came back into a single style file. Then I built eight looping motion graphics that were only allowed to use values from it.

![01 Dot grid → cascade](../export/gif/01-dotgrid-cascade.gif)
*01 — Dot grid → cascade. The stepped opacity states come straight from the source site's own keyframes.*

## The workflow

**Extract.** Playwright, headless Chrome, three pages. Not screenshots — the actual cascade: 421 CSS custom properties, 101 `@keyframes` blocks, 76 stylesheets, and the computed styles of roughly four thousand visible elements per page. Frequency matters as much as presence. Knowing a colour exists tells you little; knowing it appears nine times in four thousand elements tells you how to use it.

**Style file.** Two artefacts, written once. `tokens.css` holds every measured value as a custom property. `brand-style.md` is the human version: palette, type, surfaces, depth, and a motion personality of five adjectives — each one backed by the code that produced it, so nobody has to take my word for it.

**Brief.** A short document with the global rules. Canvas 1080×1350. Five-second seamless loop. All motion driven from a single `t = elapsed % 5000`, so frames are deterministic and recordable. No CSS animations, because you can't seek them frame-accurately. And the rule that did most of the work: **one object, one change**.

**Build.** One line per animation. That's genuinely all:

> *Twelve bars rise from zero in a staggered reveal with the brand's slowest ease, hold at full height, then fall back in reverse order — one bar, the tallest, carries the accent and a bloom behind it.*

Note what that sentence doesn't contain: no hex codes, no cubic-beziers, no durations. It refers to brand values by role — "the brand's slowest ease", "the accent". Swap the style file for another brand's and the same sentence produces that brand's version. That portability is the point.

![06 Bar chart → build](../export/gif/06-bar-chart-build.gif)
*06 — Bar chart → build. A thousand-millisecond reveal on a curve read from the source, not chosen.*

**Export.** Playwright calls `seek()` 150 times per piece, screenshots each frame, and ffmpeg encodes to MP4 and GIF. Because the clock is the only input, take forty is identical to take one.

## What worked

The frequency data. Three of the eight pieces changed shape because of it. I had assumed the brand's indigo was a hero colour; the extraction said it appears nine times in four thousand elements. It isn't a hero colour, it's a *pointer* — it marks one thing at a time. Every animation in the set now carries exactly one accent element, and that single constraint is most of why they look like a family.

The absences were just as useful. The brand publishes eighteen easing curves and not one of them overshoots — no spring, no bounce, no elastic. You cannot see an absence on a mood board. You can see it immediately in a token file.

And `one object, one change` removed most of the decisions before I started. The pieces that needed real iteration were the two where I ignored it and had two things changing at once.

## What didn't

Three things, honestly:

**The gradient piece was nearly a failure.** My first version was a soft violet bloom drifting over black — restrained, technically correct, and indistinguishable from every AI gradient loop on the internet. It only became *this* brand's gradient when I put a still hairline grid in front of it. The restraint wasn't enough; the architecture was the tell.

**Measured isn't the same as composed.** The extraction gives you a palette, not a layout. Several pieces were correct and flat on the first pass, and needed brightness and scale decisions that no amount of scraping would have supplied.

**Type is where the substitution shows.** The source uses a licensed variable Inter at weight 510 with a custom feature set, and a commercial mono. Google Fonts Inter gets me the weight and the tracking; the mono is a stand-in and a trained eye would clock it.

## Where this goes next

For brand teams, the useful artefact isn't the loops — it's that "is this on brand?" becomes a question you can answer by reading a file rather than convening a meeting. A token file is checkable. An adjective isn't.

For content teams, it's a way to produce a lot of on-system motion quickly without a designer rebuilding the brand from memory each time. The style file is the expensive part, and you write it once.

The natural next step is to run the extraction against your *own* site and see whether the system you think you have is the system you actually ship. In my experience that gap is where the interesting conversation starts.

![08 Card stack → tilt](../export/gif/08-card-stack-tilt.gif)
*08 — Card stack → tilt. Perspective and depth-of-field borrowed from the source site's hero treatment.*

---

*Unofficial design study. Not affiliated with Linear. No logo, wordmark or trademarked imagery is used — colours, type feel, shapes, radii, depth and easing only. Fonts substituted with Google Fonts Inter and JetBrains Mono.*
