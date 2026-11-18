# Build Log

Record of the parallel build, integration decisions and verification. The contract lives in `BUILD_PROMPT.md` / `AGENT_BRIEFS.md`; this file records what actually shipped and where it deviated.

## Streams

| Stream | Delivered |
|---|---|
| Entry | Preloader (real load signal, four layer thresholds, panel curtain, session fast path, reduced path), hero with IST clock and draggable four-layer deck, ink-ground manifest with word-colour scrub |
| Work | Five-row index with sticky preview and clip wipe, generated SVG posters, proportional layer strips, full-screen case sheet with Flip open/close, focus trap, ESC, `#work/<slug>` deep links |
| Systems | Pinned isometric anatomy (separation → leaders → captions → Vaani call path), layer-balance bar chart, capability matrix with derived filters and Flip reflow, honest empty state |
| Practice | Expanding service rows with layer washes, process ruler with scrub and counters, about with halftone portrait fallback, facts grid and tool ticker |
| Chrome | Ground-aware nav with hide/reveal and mobile menu, difference-blend cursor with label states, contact with copy/mailto/magnet, clipped footer wordmark and live clock |

## Integration fixes (post-stream)

1. **Ambient ground rewritten.** Enter/leave triggers desynced after programmatic jumps and pins, leaving the page on the wrong ground. Replaced with a single scroll-update resolver that picks the last section above the viewport middle. Source of truth: section top, not callbacks.
2. **Cobalt collision.** The Application layer shares its hue with the Systems ground, so its slab, swatch and bar segment vanished. `--application` is lifted to `#9aa4ff` only inside `html[data-ground="cobalt"]`; every other ground keeps `#2438e8`.
3. **Pin budget trimmed.** Anatomy pin reduced from 3200 px to 2400 px; total page height came down ~800 px with no loss of beats.
4. **Case sheet focus.** Opening used to focus the close button, painting a vermilion focus ring on a reading surface. Focus now lands on the dialog container (`tabIndex={-1}`); the trap still starts at the first control.
5. **Mobile fixes.** Rotated hero deck was clipped at the left edge on phones — stage now inset. Work index no longer opens the first project by default; all five read as a list. About content comes before the portrait on narrow screens.
6. **LCP.** The hero headline is painted at full size from the first frame behind the curtain (it was the LCP element and its mask animation delayed the largest paint). Secondary elements slide; the headline does not. Preloader trimmed ~350 ms. LCP 3.7 s → 0.8 s.
7. **Accessibility.** Removed opacity from legible labels (layer names, scale ticks, chip counts, watermark index), removed the slab `aria-label` so the accessible name is the visible text, and raised small mono text to full foreground tokens. Contrast audit 19 → 0 items; name mismatch 4 → 0.
8. **Cursor opt-ins.** `data-cursor` added to work rows (`view`), the hero deck (`drag`), service rows (`open`) and the copy button (`copy`).
9. **OG image.** Generated from a real-font poster capture at 1200×630 (`scripts/og.mjs`).

## Verification

| Check | Result |
|---|---|
| `npm run typecheck` | clean |
| `npm run build` | clean, 152 KB gzip JS / 13 KB gzip CSS |
| Console errors | none (desktop, mobile, reduced) |
| Horizontal overflow | none at 360 / 390 / 768 / 1024 / 1440 / 1920 |
| Pinned sections | 2 desktop, 0 reduced motion |
| Case sheet | opens, traps focus, ESC closes, restores focus, deep link works |
| Lighthouse (production preview) | Performance 99 · Accessibility 100 · Best Practices 100 · SEO 100 |
| LCP / CLS | 0.8 s / 0 |
| Preloader | ~1.7 s typical, session fast path, skip on Enter/Escape |

Lighthouse is simulated mobile (slow 4G, 4× CPU). Desktop is faster still.

## Deliberate deviations

- Service rows have no CTA links; nothing in the data supplies a destination, and a dead link is worse than none.
- Process has no pin — the scrub and counters carry it, per the two-pin budget.
- Matrix cards are reading surfaces, not navigation; the Work sheet is the only case reader.
- Contact title spans full width above both columns; at `--display-2` a five-column track broke the authored line into three ragged lines.
- No external images. Posters and the portrait fallback are code-drawn so the site has no asset debt.
- The cursor never hides the native pointer; the dot and ring read as an accent, not a replacement.

## v2.1 — Repositioning (post-launch revision)

**Brief:** the site read as a web developer's portfolio; the four-slab hero was decorative; Systems and Services overlapped in the nav.

**Changes**
- Positioning: `Independent web developer` → **AI & software systems**. Title/meta/JSON-LD updated; headline is `I build projects that hold up.` with a support line covering AI integration, full-stack engineering and automation.
- Hero: the draggable four-slab deck and the first trace panel were removed. The hero now carries the **System Dial** — four domain arcs on a rotating tick ring, a needle that follows the pointer, a centre readout and a 2×2 control grid with real project evidence. It reads as an instrument without interaction; the pointer and buttons drive it; reduced motion stops the tick rotation.
- Domain label: `Interface` → **Experience** (cascades through preloader, anatomy, composition, case sheet).
- Nav/IA: `Services` → **Capabilities**, moved before Systems. Section numbering corrected (03 Capabilities, 04 Systems). Nav is Work · Capabilities · Systems · About.
- Capabilities: regrouped as AI & intelligent systems / Software & applications / Automation & integrations, each with an evidence list. No claim without a project behind it.
- Manifest: the closing line `No account layer. No handover telephone game.` was removed.
- Ticker: a full-bleed ink band between Work and Capabilities — mono capability labels, scroll-direction aware, pauses on hover, static under reduced motion.
- About: title and facts reframed (`Focus — AI & systems`).
- OG image regenerated from the new headline.

**Why the dial:** the first trace panel read as a form — tabs, rows, a caption. The dial is one object: an engraved instrument with four arcs, a needle and a readout. It is decorative (ticks, coordinates, rotation) and meaningful (each arc is a domain with a real project), and it does not repeat the axonometric anatomy in Systems.

**Verified after the change:** typecheck and build clean; Lighthouse 99 / 100 / 100 / 100 (LCP 0.8 s, CLS 0.006); no console errors; no horizontal overflow 360–1920; reduced-motion path has zero pins; pointer angle, control clicks and keyboard focus all drive the readout; the needle rotates around the dial centre.

**Not changed (deliberately):** Work index and case sheet, Systems anatomy/composition/matrix, Process, Contact, footer, palette, type, preloader, motion budget.


## Left for the owner

- Fill `site.socials` in `content.ts` (GitHub, LinkedIn, Instagram) — the footer hides empty entries.
- Add live project URLs to `projects[].links` when the concepts are public; the case sheet already renders a links row when present.
- Replace `og:url` / canonical once the final domain is set.
