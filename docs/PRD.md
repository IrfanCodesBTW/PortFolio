# PRD — Irfan Portfolio v2

**Codename:** FOUR LAYERS
**Owner:** Shaik Irfan Basha
**Status:** Built — v2.1 repositioning applied (see `docs/BUILD_LOG.md`)
**Location:** `portfolio-v2/` (isolated from the existing `cooling-deficit` app)

> **v2.1.** The site presents **AI & software systems**, not web development. The hero carries the **System Dial** — four domains as arcs, a pointer-driven needle, a live readout — replacing the earlier slab deck. Services became Capabilities, grouped by system type and backed by project evidence; the nav label changed and the section moved before Systems. Interface → Experience across the domain model. The manifest closing line was removed and the headline is **I build projects that hold up.**

---

## 1. Problem

The current portfolio (`irfan-portfolio-xi.vercel.app`) is honest and well-written, but it reads like a document: warm paper, everything at the same visual volume, no colour identity, no single memorable moment, and work presented as stacked cards. It undersells the engineering behind it.

The references the owner chose (sebg.ch, two26.studio, arshawnarbabi.com, charbeltannous.com, skhiladze.com) all share a different behaviour:

- one committed colour field per chapter,
- type at 100–180px doing the design work,
- a designed preloader as the opening scene,
- minimal chrome, mono micro-labels, timestamps, availability,
- exactly one memorable interaction,
- long scroll with two or three pinned beats,
- dry, first-person, specific copy.

## 2. Goal

A portfolio that reads as **an interactive field report on the work**, with the confidence and colour of the references, without copying their layouts, copy, avatars or palettes.

Visitors should understand in ten seconds: who this is, what they build, and how to start.

## 3. Audience

1. Founders and small-business owners who need a website, an app, or an AI integration.
2. Studio leads and agencies looking for a reliable build partner.
3. Peers and hiring managers evaluating craft.

## 4. Success criteria

- Scope is clear above the fold (role, offer, availability).
- All five builds are reachable in one click from the work index.
- Contact is two clicks from anywhere; email copies without a form.
- The Systems chapter is the screen people remember and screenshot.
- The page still looks designed with all animation disabled.
- Lighthouse: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO 100.
- No invented clients, metrics, testimonials or deployment claims.

## 5. Non-goals

- No CMS, blog, newsletter, shop or auth.
- No fabricated analytics or "50+ projects" style numbers.
- No Three.js / WebGL scene. CSS 3D only.
- No dark-mode toggle; the page changes ground by chapter.
- No Tailwind; hand-authored CSS with shared tokens.
- No external stock photography. All visuals are code-drawn.

## 6. Structure

| Order | id | Ground | Purpose |
|---|---|---|---|
| 00 | — | bone | Preloader: the four layers assemble while the page loads |
| 01 | `hero` | bone | Name, proposition, draggable layer stack, availability, IST clock |
| 02 | `standard` | ink | Manifest: word-colour reveal, working principles |
| 03 | `work` | bone | Index of 5 builds, live preview plate, case sheet |
| 03 | `capabilities` | bone | Three capability groups, backed by project evidence |
| 04 | `systems` | cobalt | The data chapter: anatomy, layer balance, capability matrix |
| 05 | `process` | acid | Four steps on a ruler |
| 07 | `about` | bone | Portrait plate, facts, tools, one dry line |
| 08 | `contact` | vermilion | Copy email, scope chips, mailto draft |
| 09 | — | ink | Footer: giant wordmark, colophon, local time |

## 7. Functional requirements

### Preloader
- Fixed overlay, bone ground, 6 vertical hairlines.
- Mono counter 000→100 driven by real load signals (fonts + window load) plus a minimum dwell; never linear timer theatre.
- Four layer rows land at 25/50/75/100 %: INTERFACE, APPLICATION, DATA, INTELLIGENCE, each in its colour.
- At 100: counter fades, name masks up, 5 panels exit upward, hero reveal begins.
- Total ≤ 2.3 s. Session repeat ≤ 500 ms. Reduced motion: no counter, instant.
- Must always call `onDone` and must not trap scroll.

### Hero
- Kicker (mono), display headline (2 lines), sub-line, two CTAs, three meta facts, live IST clock.
- Draggable 3D stack of the four layers; scroll-scrubbed tilt; click a layer → scrolls to Systems.
- Layer legend is readable without interaction.

### Manifest
- Ink ground. Large statement with per-word colour scrub from muted to foreground.
- One aside paragraph, maximum 60ch.

### Work
- Rows: index, title, kind, lead-layer tag, layer strip.
- Hover/focus swaps a sticky preview plate with a clip-path wipe.
- Click opens a case sheet: summary, problem, approach, boundary, stack, layer balance, prev/next.
- Sheet is a dialog: focus trap, ESC closes, restores focus, locks scroll, `#work/<slug>` deep link.
- Mobile: previews stack inline; sheet becomes full-screen.

### Systems
- Project one: pinned anatomy — four slabs separate on scroll, connectors draw, captions land, resolves to the Vaani STT→LLM→TTS flow.
- Project two: layer balance — stacked horizontal bars per project, animated on enter, legend, hover emphasis.
- Project three: capability matrix — filter chips derived from real stacks, GSAP Flip reflow, live counts, honest empty state.

### Services / Process / About
- Services: three numbered rows, hover/focus expansion, deliverable list, layer tag.
- Process: four steps on a horizontal ruler; sticky labels; no pin needed.
- About: portrait plate (code-drawn halftone fallback, `public/portrait.jpg` overrides), four facts, tool ticker, note.

### Contact / Footer
- Copy-email with confirmation, mailto draft with selected scope chip, availability, local time.
- Footer: oversized wordmark reveal, colophon, back to top.

## 8. Content rules

- First person, short sentences, specifics over adjectives.
- Numbers only if true and traceable to `src/data/projects.ts` or `content.ts`.
- Every project labelled: concept / study / prototype. Boundaries are stated plainly.
- No invented clients, logos, testimonials, years or deployment claims.
- Banned: passionate, cutting-edge, solutions, journey, crafting digital experiences, "elevate your brand".

## 9. Constraints

- Vite + React 19 + TypeScript, no Tailwind.
- Shared tokens and primitives live in `src/styles`; components own prefixed CSS only.
- No new dependencies without the integrator's approval.
- All motion transform/opacity; max two pinned sections; no scroll-jacking.
- Keyboard operable, reduced-motion compliant, 360 px safe.
