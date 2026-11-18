# Motion Spec

Motion here does three jobs: it marks hierarchy, it explains structure, and it gives the site one moment people remember. It is not decoration.

## 1. Principles

1. Every animation ends in a state that looks finished on its own.
2. One dominant move per screen. If a section already has a pin, it gets no entrance flourish.
3. Transform and opacity only. No animating layout, filters or box-shadow.
4. Scroll-tied motion uses `scrub`, not autoplay-on-enter, for anything that tells a story.
5. Max two pinned sections (`work`, `systems`). Everything else reveals.
6. Mobile keeps the reading order; pins become stacks.
7. Reduced motion removes pinning, parallax, scrub and the cursor — never the content.

## 2. Tokens

```
easing  expo.out (0.16, 1, 0.3, 1)  → reveals
        power3.inOut                 → curtains / panels
        power2.out                   → hovers
durations  0.18 hover · 0.32 state · 0.56 micro · 0.9 reveal · 1.1 headline
stagger    0.06–0.08 (lines), 0.05 (panels), 0.1 (rows)
scrub      0.8 (diagram 1.2)
```

## 3. Preloader — beat sheet

| Time | Event |
|---|---|
| 0.00 | Bone plate. 6 vertical hairlines fade in at 0.5 opacity. Wordmark bottom-left, `000` bottom-right, both mono. Content is already rendered underneath; the overlay is fixed and creates no layout shift. |
| 0.00–1.30 | Counter runs from 0 to 100 driven by `document.fonts.ready` + `window.load` + a 600 ms minimum dwell, eased with irregular steps (never linear, never fake-fast). Each 25 % threshold draws one horizontal rule across the plate and lands a layer label in its colour. Tied to progress, not timers. |
| 1.30 | At 100: counter and status fade in 180 ms. Name splits into two lines inside `.mask` wrappers and rises with 0.08 s stagger, 0.9 s expo.out. |
| 1.55 | Exit: 5 vertical panels rise `yPercent: -100`, 0.85 s, 55 ms stagger, `power3.inOut`. Hero is already at its start state. |
| ≤2.30 | `onDone`. Remove overlay from DOM. `ScrollTrigger.refresh()` after entry. |

Rules:
- Skip control always visible; keyboard Enter skips; ESC skips.
- `sessionStorage.setItem("entered", "1")` → next visit uses a 450 ms single-panel curtain, no counter.
- Reduced motion: render nothing interactive, call `onDone()` on mount after a 200 ms fade.
- Lock scroll while active (`stopScroll()`), release in every exit path including unmount.
- Never wait on network resources; the counter uses only fonts + load + dwell.

## 4. Section recipes

### Hero
- Headline lines: `.mask > .line`, `yPercent: 110 → 0`, 1.1 s, expo.out, stagger 0.08, delay after preloader 0.05.
- Kicker/meta: `opacity 0 → 1`, `y 12 → 0`, 0.8 s, stagger 0.06.
- Layer stack: pointer drag rotates `rotateX` (−60°…−10°) and `rotateZ` (−12°…12°); scroll adds `rotateX` up to 18° via ScrollTrigger scrub; release eases back with `elastic.out(1, 0.6)` capped at 0.5 s.
- Click/tap a slab: `scrollToTarget("systems")`. Hover: slab lifts 8 px, label strengthens.
- All of it is a `<div role="group">` with keyboard arrow support; it is not the only way to reach the legend.

### Manifest
- Paragraph split into word spans at build time (authored, not SplitText). One ScrollTrigger with `start: "top 70%"`, `end: "bottom 55%"`, `scrub: 0.6` tweens word colour from `--fg-soft` to `--fg` with a 0.35 stagger across the paragraph.
- Lead line reveals with a mask. No pin — the section is tall enough to let the scrub breathe.

### Work
- Desktop: section pinned for the length of the list (`end: "+=120%"`), rows translate minimally; the preview plate is sticky inside the pin.
- Row hover/focus: preview image gets `clip-path: inset(0 0 100% 0)` → `inset(0 0 0% 0)`, 0.7 s, expo.out; the outgoing image fades under it.
- Rows: `background-size` rule grows from 0→100 %, index number switches to the lead layer colour.
- Case sheet: opens from the clicked row using GSAP Flip (row rect → sheet rect), 0.55 s, expo.out. Content staggers in after. Close reverses. Lock scroll, trap focus, ESC, restore focus to the row.
- Mobile: no pin; rows are stacked, preview plate inline under the active row.

### Systems — the centrepiece
- Pinned wrapper, `end: "+=3200"`, `scrub: 1`.
- Stage 1 (0–35 %): four slabs sit stacked isometrically; `y` separates them by 80–110 px each, slight `rotateX` change; connector SVG paths draw via `strokeDashoffset`.
- Stage 2 (35–70 %): captions land one per slab (opacity + 12 px rise), the active slab's colour saturates while the others drop to 45 % opacity.
- Stage 3 (70–100 %): a hairline frame draws around the Vaani flow; STT → LLM → TTS nodes populate; the Dograh handoff label appears. Final frame holds.
- Mobile: the pin is removed and each stage becomes a static stacked figure with a 0.6 s entrance.
- Layer balance: stacked bars animate `scaleX` 0→1 from the left on enter, 0.9 s, stagger 0.08. Hover a project → other rows drop to 55 %.
- Matrix: chips toggle filters. Reflow with `Flip.getState` → update → `Flip.from(state, { duration: 0.6, ease: "expo.out", absolute: true, stagger: 0.03 })`. Counts animate with a 0.4 s tween. Empty state fades in.

### Services
- Rows: hover/focus expands the detail block with `height: auto` measured by GSAP, 0.5 s expo.out. Only one open at a time on desktop; on mobile it's a tap accordion.
- Row background: a colour wash scales from the left at 0.18 opacity.

### Process
- Vertical ruler on mobile, horizontal on desktop. A progress line draws across on scrub. Each step number counts up once.
- No pin. Sticky step labels on desktop only.

### About
- Portrait plate: 6 % parallax (`yPercent: -6 → 6`, scrub).
- Tool ticker: infinite marquee, `xPercent: -50` loop, duration 28 s, reverses when scroll direction reverses (velocity-based), max skew 3°.
- Facts: stagger 0.07 reveal.

### Contact / Footer
- Copy email: click copies, label swaps to "Copied" for 1.6 s, button border pulses once.
- Magnetic CTA: pointer within 80 px translates the button up to 6 px toward the cursor; resets on leave. Disabled on touch.
- Footer wordmark: `yPercent: 22 → 0` scrub over the last 40 % of the page, clipped by `overflow: hidden`.

## 5. Scroll system

```ts
Lenis({ lerp: 0.09, wheelMultiplier: 1, touchMultiplier: 1.2 });
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
// refresh after fonts and after the preloader exits
```

Hygiene:
- Create all triggers inside `gsap.context(() => {...}, ref)` and `ctx.revert()` on unmount.
- `ScrollTrigger.refresh()` after `document.fonts.ready` and after preloader exit.
- Never create triggers during render.
- Use `invalidateOnRefresh` for values derived from viewport size.
- Clamp all delays; no animation longer than 1.4 s except scrubbed timelines.

## 6. Reduced motion

- No Lenis (App already handles this).
- Preloader: 200 ms fade, immediate `onDone`.
- No scroll scrub; show end states.
- No custom cursor, no magnetic buttons, no marquee movement (static row).
- Reveals become 200 ms opacity fades.
