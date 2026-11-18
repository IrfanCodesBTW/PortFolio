# Agent Briefs

Five parallel build streams. Every agent reads `docs/BUILD_PROMPT.md` first, then its own brief.

**Ownership is strict.** Only the files listed under *Owns* may be created or edited. If something outside is broken, report it; do not fix it.

---

## Agent A — Entry suite

**Owns:** `src/components/preloader/*`, `src/components/hero/*`, `src/components/manifest/*`

### Preloader (`Preloader.tsx`, `Preloader.css`)

Props: `{ onDone: () => void }`. Full-screen fixed overlay, `z-index: var(--z-preloader)`.

- Bone ground, 6 vertical hairlines (1px, `--rule`, 0.5 opacity), wordmark bottom-left, mono counter bottom-right.
- Counter 000→100 driven by `document.fonts.ready` + `window.load` + 600 ms minimum dwell. Eased, irregular increments. Each 25 % threshold draws one rule across the plate and reveals a layer label in its colour: INTERFACE, APPLICATION, DATA, INTELLIGENCE.
- At 100: fade counter, mask the name up in two lines (0.08 s stagger), then 5 panels exit upward (`power3.inOut`, 0.85 s, 0.055 s stagger) and call `onDone`.
- Skip button (mono, bottom bar) + Enter/Escape. `stopScroll()` on mount, `startScroll()` in every exit path.
- `sessionStorage.entered` → 450 ms single curtain, no counter.
- Reduced motion: 200 ms fade, immediate `onDone()`, no panels.
- Must never block content for more than 2.3 s and must always call `onDone` exactly once.

### Hero (`Hero.tsx`, `Hero.css`, `LayerStack.tsx`, `LayerStack.css`)

Section: `id="hero" data-ground="bone"`, min-height `100svh`, 12-col grid, no pin.

- Top row: kicker (mono) + three meta facts on the right (Based / Clock / Status). Clock ticks every second via `formatTime(new Date())`.
- Headline: `hero.lines` at `--display-1`, each line in `.mask > .line`, 2 lines max width 11 cols.
- Right/bottom: the **LayerStack** — four slabs in CSS 3D (`perspective: 1200px`), 4:3 proportions, max 300 px, each slab a layer colour with a mono label and its blurb number. Stacked with `translateZ`/`translateY` offsets so all four labels are readable without interaction.
- Drag (pointer events) rotates `rotateX` between −58° and −12°, `rotateZ` between −12° and 12°; release eases back. Scroll adds up to 18° of tilt with a scrub trigger. Click/tap a slab → `scrollToTarget("systems")`. Arrow keys cycle focus between slabs.
- Sub-line, primary CTA (`scrollToTarget("contact")`), secondary (`scrollToTarget("work")`), legend line, and a small "drag" hint.
- Mobile: stack sits under the headline, drag still works, no scroll-tilt.

### Manifest (`Manifest.tsx`, `Manifest.css`)

Section `id="standard" data-ground="ink"`.

- Eyebrow, lead at `--display-2`, then the paragraph split into word spans with a scrubbed colour tween from `--fg-soft` to `--fg` (one ScrollTrigger, `scrub: 0.6`, stagger 0.35).
- Aside in a 4-col offset block, max 46ch, with a hairline above. Closing line as `.serif-italic` at `--text-xl`.
- No pin.

**Done when:** the first three screens feel like the references' confidence — one loud type moment, one interaction, one quiet paragraph.

---

## Agent B — Work index and case sheet

**Owns:** `src/components/work/*`

### Work (`Work.tsx`, `Work.css`)

Section `id="work" data-ground="bone"`.

- Header: eyebrow, three-line title at `--display-2`, note right-aligned on desktop.
- Two columns desktop: rows (7 cols) / sticky preview (5 cols). Rows are buttons with index, title, kind, lead-layer tag, and a `LayerStrip`. Hairline separators, ~88 px row height, index turns the lead layer colour on hover.
- Sticky preview: `ProjectPlate` (4:5) changes on hover/focus with a clip-path wipe. Default = first project.
- Desktop pin: `end: "+=120%"` only above 900 px and only without reduced motion. The preview stays sticky inside it.
- Mobile: no pin, plate inline under the active row.
- Hint line from `work.hint`.

### `ProjectPlate.tsx`, `ProjectPlate.css`

Code-drawn SVG poster per project: hairline grid, huge index at low opacity, title, kind, and a proportional layer bar at the bottom. Deterministic from project data. No images.

### `LayerStrip.tsx`, `LayerStrip.css`

Props `{ layers, height? }`. Four proportional segments using layer colours, `role="img"` with an `aria-label` listing percentages. Animates `scaleX` from 0 on mount (unless reduced motion).

### `CaseSheet.tsx`, `CaseSheet.css`

Props `{ project, onClose, onNext, onPrev }`.

- Fixed full-screen dialog, `z-index: var(--z-sheet)`, bone surface, own scroll container.
- Top bar: index, kind, close (44 px), prev/next.
- Body: title at `--display-2`, summary at `--text-xl`, then Problem / Approach / Boundary in a 3-col block, stack chips, layer balance bars with percentages.
- Opens with GSAP Flip from the clicked row element (accept an `origin` rect), 0.55 s; content staggers after. Close reverses then unmounts.
- `role="dialog" aria-modal="true"`, focus trap, ESC closes, body scroll locked (`stopScroll`), focus restored to the triggering row.
- Deep link: opening pushes `#work/<slug>`; closing restores `#work`. On mount Work reads the hash and opens the matching case.

**Done when:** the index reads like an editorial table of contents, and the sheet is a real reading surface, not a modal card.

---

## Agent C — Systems (the data chapter)

**Owns:** `src/components/systems/*`

Section `id="systems" data-ground="cobalt"`. This is the most memorable screen on the site.

### `Systems.tsx`, `Systems.css`

Header: eyebrow, two-line title at `--display-2`, intro at 46ch. Then `Anatomy`, `Composition`, `Matrix` separated by hairlines.

### `Anatomy.tsx`, `Anatomy.css`

- Pinned figure, `end: "+=3200"`, `scrub: 1`, only above 900 px and not reduced motion. `gsap.matchMedia`.
- SVG (viewBox ~900×620) with 4 parallelogram slabs in isometric projection, one per layer, stacked; HTML labels absolutely positioned beside the stack (avoid SVG text scaling problems).
- Timeline: slabs separate (0–35 %), connector paths draw via `strokeDashoffset` (0–50 %), captions land one by one (35–70 %), final frame draws the Vaani flow — `STT → LLM → TTS` nodes with a `DOGRAH / GUARDED CALL` handoff label (70–100 %). Hold the final frame.
- Final state must look complete without scrolling back.
- Mobile/reduced: four static stacked figures, captions visible, no pin.

### `Composition.tsx`, `Composition.css`

- Legend of four layers (dot + label + blurb).
- One row per project: index + title left, stacked bar centre (width 100 %), total right.
- Bars animate `scaleX` 0→1 on enter, 0.9 s, stagger 0.08. Hover a row → others drop to 55 % opacity.
- Percentages are authored values; show them on hover/focus and always in the accessible label.

### `Matrix.tsx`, `Matrix.css`

- Filter chips derived from real stacks: dedupe `Project.stack`, sort by frequency, cap at 8, plus "All".
- Toggling filters reflows the project cards with `Flip.getState` / `Flip.from` (0.6 s, expo.out, `absolute: true`, stagger 0.03).
- Each card: index, title, kind, small stack chips, LayerStrip. Cards are buttons that open nothing — they are a reading surface, not navigation (do not import Work's sheet).
- Live count line: `03 builds · 07 tools` with a 0.4 s tween.
- Empty state uses `systems.emptyState`, honest and quiet.
- Keyboard: chips toggle with Enter/Space, `aria-pressed`.

**Done when:** a stranger understands the four-layer idea from this section alone, and the pin is smooth on a trackpad.

---

## Agent D — Services, Process, About

**Owns:** `src/components/services/*`, `src/components/process/*`, `src/components/about/*`

### Services (`Services.tsx`, `Services.css`)

Section `id="services" data-ground="bone"`.

- Header: eyebrow, two-line title, note on the right.
- Three rows, hairline separated, each: index, title (`--display-3`), layer tag, a `+` that rotates to `×`.
- Hover on desktop opens the row (GSAP height auto, 0.5 s); focus/click toggles. Only one open at a time. Body + deliverables list in 3 columns. A 6 % layer-colour wash scales in from the left.
- Mobile: tap accordion, 44 px targets.

### Process (`Process.tsx`, `Process.css`)

Section `id="process" data-ground="acid"`.

- Header + note.
- Desktop: four columns on a horizontal hairline ruler; numbers at `--display-3`; a progress line draws across on scrub.
- Mobile: vertical ruler on the left, steps stacked.
- Number counters run once on enter. No pin.

### About (`About.tsx`, `About.css`)

Section `id="about" data-ground="bone"`.

- Two columns: portrait plate (5 cols) / content (6 cols, offset 1).
- Portrait: `<img src="/portrait.jpg">` with `onError` → code-drawn halftone monogram plate (`SIB`) using an SVG dot pattern, duotone. It must look deliberate either way. Parallax max 6 %.
- Content: eyebrow, two-line title, body max 52ch, facts as a 2×2 grid with hairlines, note in `.serif-italic`.
- Tools ticker below, full width: mono items separated by a 4 px layer-coloured dot, infinite loop, pause on hover, static under reduced motion.

**Done when:** the practice reads as one person with a clear offer, not a services menu.

---

## Agent E — Chrome, contact, footer

**Owns:** `src/components/layout/Nav.tsx`, `Nav.css`, `Cursor.tsx`, `Cursor.css`, `Grain.tsx`; `src/components/contact/*`, `src/components/footer/*`

### Nav

- Fixed top bar, 64 px, background `var(--ground)` (matches the ambient ground, transition 650 ms), hairline bottom, `z-index: var(--z-nav)`.
- Left: wordmark `site.wordmark`. Centre/right: nav links (`nav[]`), availability dot + `site.availabilityShort`, and a `Let's talk` pill → `scrollToTarget("contact")`.
- Hides on scroll down, returns on scroll up (translateY, 0.4 s). Never hides while the mobile menu is open.
- Mobile (<900 px): wordmark + menu button; full-screen overlay menu with large links, contact email, close. Lock scroll, ESC closes, focus trap.
- Active section indication via ScrollTrigger or IntersectionObserver is optional; keep it subtle.

### Cursor

- Fixed 8 px dot + 28 px ring, `mix-blend-mode: difference`, `z-index: var(--z-cursor)`, pointer-events none.
- Grows/labels on `[data-cursor="view|drag|copy|open"]` elements (agents add this attribute; support it if present). Hide entirely on touch (`pointer: coarse`) and reduced motion. Never hide the native cursor on form fields.

### Contact

Section `id="contact" data-ground="vermilion"`.

- Two columns: left title (`--display-2`) + body + scope chips; right a large email link (`--display-4`), a Copy button with 1.6 s "Copied" state and a single border pulse, and a mailto link that includes the selected chip as the subject suffix.
- `navigator.clipboard.writeText` with `document.execCommand` fallback; announce via `aria-live`.
- Magnetic effect on the primary button (pointer within 80 px, max 6 px), disabled on touch/reduced.
- Note line at the bottom.

### Footer

`data-ground="ink"`.

- Giant wordmark clipped by `overflow: hidden`, `yPercent: 22 → 0` scrub over the last 40 %.
- Bottom row: copyright with year, colophon, local time (IST, ticking), socials only if `site.socials` is non-empty, and a back-to-top button using `scrollToTarget(0)`.
