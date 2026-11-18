# Master Build Prompt

> **v2.1 amendment.** The positioning is **AI & software systems**, not web development. The hero centrepiece is the `SystemTrace` instrument (four domains, three real scenarios) — the old draggable slab deck is gone. `Services` is now **Capabilities** (AI & intelligent systems / Software & applications / Automation & integrations), placed before Systems. Domain labels are Experience, Application, Data, Intelligence. Anything below that mentions services or the hero deck predates this and should be read through that lens.

Paste this at the top of any agent session working on this project. It is the contract.

---

## Context

You are building **FOUR LAYERS**, the personal portfolio of Shaik Irfan Basha — an independent web developer working across interfaces, full-stack applications and AI integrations.

The site is an interactive field report on the work. Reference behaviour (not layouts, copy or palettes): sebg.ch, two26.studio, arshawnarbabi.com, charbeltannous.com, skhiladze.com. The taste: one committed colour field per chapter, oversized typography, a designed preloader, minimal chrome, mono micro-labels, exactly one memorable interaction, two pinned scroll moments, honest first-person copy.

Read in this order before writing code:

1. `docs/PRD.md`
2. `docs/DESIGN_SYSTEM.md`
3. `docs/MOTION_SPEC.md`
4. `docs/CONTENT_DECK.md`
5. `docs/AGENT_BRIEFS.md` (your assignment only)

## Project

Root: `portfolio-v2/` (sibling to the existing `cooling-deficit` app — never touch that app).

```
npm run dev        # vite on :5190
npm run build      # tsc --noEmit && vite build
npm run typecheck  # tsc --noEmit
```

Stack: Vite 8, React 19, TypeScript (strict, `noUnusedLocals`), GSAP 3.15, Lenis, d3-scale/shape/array. **No Tailwind.** Hand-authored CSS with shared tokens. No new dependencies.

## Shared API (do not modify these)

```ts
import { gsap, ScrollTrigger, Flip } from "@/lib/gsap";
import { scrollToTarget, stopScroll, startScroll, getLenis } from "@/lib/scroll";
import { LAYERS, layerByKey } from "@/lib/layers";
import { clamp, pad2, pad3, lerp, formatTime } from "@/lib/format";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { site, nav, hero, manifest, work, systems, services, process, about, contact, footer } from "@/data/content";
import { projects, projectBySlug } from "@/data/projects";
import type { Project, LayerKey, Ground } from "@/data/types";
```

`App.tsx` owns the page shell: it renders `Grain`, `Cursor`, `Nav`, all sections in order, `Footer`, and `Preloader` on first visit. It also initialises Lenis and the ambient ground system. **Do not edit `App.tsx`, `main.tsx`, `src/styles/*`, `src/lib/*`, `src/hooks/*` or `src/data/*`.** Section components receive no props.

Sections set their ground themselves:

```tsx
<section id="work" data-ground="bone" className="section">
```

Valid grounds: `bone`, `ink`, `cobalt`, `acid`, `vermilion`.

## House rules

- Type, colour, spacing come from tokens (`var(--display-1)`, `var(--fg)`, `var(--gutter)`). Never hardcode hex values in components.
- Use the shared primitives: `.shell`, `.section`, `.display`, `.display-1…4`, `.label`, `.body`, `.btn`, `.rule`, `.mask > .line`, `.tnum`, `.serif-italic`.
- Prefix every component class with your section's prefix. Component CSS imports only its own file.
- Motion: follow `docs/MOTION_SPEC.md`. Transform/opacity only. Max one pin per section, two pins on the page (`work`, `systems`).
- Wrap GSAP in `gsap.context(...)` inside `useEffect`, `ctx.revert()` on cleanup. `ScrollTrigger.refresh()` after fonts, never during render.
- Respect `useReducedMotion()`: static end states, no pin, no parallax, no cursor.
- Accessibility: real headings, `aria-expanded` where relevant, 44 px touch targets, focus-visible, ESC closes overlays, focus restored.
- Responsive: 360, 390, 768, 1024, 1440. No horizontal overflow. Pins disabled under 900 px.
- Copy comes from `src/data`. Do not invent clients, metrics, years or testimonials.

## Definition of done

- `npm run typecheck` passes with no errors.
- The section looks intentional with animation disabled.
- Both dark and light grounds switch text colours correctly via tokens.
- No console errors, no layout shift, no scroll trap.
- Your files only — no cross-section edits.
- Report: files changed, what you implemented, what you verified, anything the integrator must wire.
