# FOUR LAYERS — portfolio v2

Personal portfolio of Shaik Irfan Basha — AI integration, full-stack engineering and automation. Built as a technical document: a live system trace in the hero, project evidence, and the anatomy of a build.

## Run

```bash
cd portfolio-v2
npm install
npm run dev        # http://localhost:5190
npm run build      # typecheck + production build
npm run preview    # http://localhost:4190
```

## Structure

```
src/
  App.tsx                page shell, preloader state, ambient ground, Lenis
  main.tsx               fonts + styles entry
  styles/                tokens, base reset, shared primitives (owned by integrator)
  lib/                   gsap registration, Lenis controller, layers, format
  hooks/                 reduced motion, smooth scroll, ambient ground
  data/                  content.ts, projects.ts, types.ts — all copy lives here
  components/
    preloader/           entry sequence
    hero/                headline + draggable layer stack
    manifest/            word-colour statement
    work/                index, preview plate, layer strip, case sheet
    systems/             anatomy, composition, capability matrix
    services/            three offers → now capabilities/ (AI, software, automation)
    process/             four steps
    about/               portrait, facts, tools
    contact/             copy email, mailto
    footer/              wordmark, colophon
    layout/              nav, cursor, grain
docs/                    PRD, design system, motion spec, content deck, briefs, acceptance, build log
```

## Editing content

- Copy: `src/data/content.ts`
- Projects and layer balance: `src/data/projects.ts`
- Portrait: `public/portrait.jpg` (1000 × 1250) with 500/800 variants served via `srcset`. Replace all three to update the About plate; without them the site falls back to the halftone monogram.
- Social links: fill `site.socials` in `content.ts`; the footer hides empty entries.

Layer percentages are authored estimates, not analytics. Keep them honest.

## Quality gate

```bash
npm run qa          # 1440×900 captures + overflow audit → qa/shots
npm run qa:mobile   # 390×844 captures
npm run og          # regenerates public/og.png from real fonts
QA_REDUCED=1 node scripts/shoot.mjs 1440 900 1   # reduced-motion path
```

The harness drives the installed Chrome headlessly (puppeteer-core), waits for the
preloader to finish, disables CSS transitions for stable frames, and reports console
errors, horizontal overflow at 360–1920 px, pin count and the case-sheet open/close cycle.


## Deploy

The repository root is the app. On Vercel: framework preset **Vite**, build `npm run build`, output `dist` (also declared in `vercel.json`). Add the domain and update `index.html` metadata (`og:url`, canonical) once the final URL is known.

## Notes

- No Tailwind. Tokens and primitives in `src/styles`.
- No external images. Project posters and the portrait fallback are code-drawn.
- Two pinned sections maximum (`work`, `systems`).
- Reduced motion is a first-class path, not a fallback.
