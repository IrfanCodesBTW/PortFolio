# Design System — FOUR LAYERS

The site is organised around one idea: every build is four layers. The four colours are a legend, not decoration. Chrome stays neutral so the legend keeps its meaning.

> **v2.1:** the domains are now named **Experience, Application, Data, Intelligence**. The `--interface` token keeps its name but means Experience.

## 1. Palette

| Token | Value | Use |
|---|---|---|
| `--bone` | `#F3F1E9` | default ground |
| `--ink` | `#0F0F0D` | text, dark ground |
| `--soft` | `#5C5A52` | secondary text on bone |
| `--rule` | `#D8D4C7` | hairlines on bone |
| `--interface` | `#E8462A` | vermilion — interface layer, contact ground |
| `--application` | `#2438E8` | cobalt — application layer, systems ground |
| `--data` | `#1C7C54` | forest — data layer |
| `--intelligence` | `#C9F24C` | acid — intelligence layer, process ground |

**Ratio:** ~70 % neutral ground, 20 % type/rules, 10 % chroma. Chroma never appears as a gradient.

Ground themes are set by `data-ground` on a section (`bone`, `ink`, `cobalt`, `acid`, `vermilion`) and produce `--ground`, `--fg`, `--fg-soft`, `--hairline`, `--accent-live` at the root. Never hardcode a section background or text colour; use the tokens.

## 2. Type

| Role | Family | Rules |
|---|---|---|
| Display | Archivo Variable | weight 700, `font-stretch: 108–113%`, tracking −0.035/−0.045em, leading 0.86–0.94 |
| UI / body | Schibsted Grotesk Variable | 400–500, tracking −0.012em, body 1.55–1.6 |
| Labels / data | IBM Plex Mono | 500, uppercase, tracking 0.14em, tabular numbers |
| Accent | Fraunces Variable italic | only for pull-quotes and margin notes; max two uses per page |

Class helpers: `.display`, `.display-1…4`, `.label`, `.body`, `.serif-italic`, `.tnum`.

Rules:
- Display type is the primary visual event. Do not add effects to compensate for small type.
- Body measure ≤ 60ch.
- Never centre-align paragraphs longer than two lines.
- Labels are always uppercase mono; never use mono for sentences.

## 3. Grid and spacing

- Shell: `max-width: 1680px`, horizontal padding `clamp(1.25rem, 4vw, 3.5rem)`.
- 12 columns desktop, 6 under 640 px. Gap `clamp(0.75rem, 1.4vw, 1.25rem)`.
- Section rhythm: `--section-y: clamp(5rem, 9vw, 9.5rem)`.
- Hairlines are 1px `--hairline`; they are structure, so keep them visible.
- Corners: 0 except pills (999px). No shadows, no glass, no gradients.

## 4. Components

**Buttons** — `.btn`, `.btn--solid`, `.btn--sm`. Pill, 1px border, 2.9rem min height, 44 px touch target, arrow nudges on hover.
**Label** — `.label`, with optional `.label--strong`.
**Rules** — `.rule`.
**Masks** — `.mask > .line` for line reveals. Each line is a block; the wrapper hides overflow.
**Sections** — `.section`, `.shell`, and `data-ground`.
**Layer strip** — four proportional segments in layer colours, 3–5 px tall, with an accessible label. Proportional, not evenly split.
**Case sheet** — full-screen surface on the ground colour of the opening section; 12-col grid; close control top-right; body copy maximum 60ch.
**Charts** — hand-built SVG. Hairline axes only, mono tick labels, annotations above grid lines, no legends when direct labels fit.

## 5. Imagery

All project imagery is code-drawn: SVG poster plates using the project's layer proportions, index, title and kind. No screenshots required, no fake browser chrome.

Portrait: `public/portrait.jpg` if present, rendered with a duotone + halftone treatment via CSS filters and an SVG dot overlay. If absent, a halftone monogram plate is shown — it must look intentional, never like a broken image.

## 6. Voice in UI

- Micro-labels are factual: `05 BUILDS`, `IST 14:32`, `CONCEPT STORE`.
- Numbers use tabular figures and leading zeros (`01`, `05`).
- Hover states may be witty once; the work section stays plain.
- No exclamation marks, no emoji, no "let's".

## 7. Do / Don't

Do:
- let one element per screen dominate;
- use empty space as a material;
- align everything to the grid and to hairlines;
- keep one accent per composition;
- test the design with motion disabled.

Don't:
- add a gradient "for depth";
- put cards inside cards;
- use more than two type sizes in one block;
- animate everything — motion marks hierarchy, it does not decorate;
- copy a reference's layout, copy, avatar, cat, or exact palette.

## 8. CSS ownership (multi-agent build)

- Shared: `src/styles/{tokens,base,utilities}.css`. Only the integrator edits these.
- Every component imports its own CSS file (`Hero.css`) and prefixes every class (`hero-`, `work-`, `sys-`, `svc-`, `proc-`, `about-`, `contact-`, `nav-`, `cursor-`, `pre-`, `man-`, `case-`).
- No global element selectors from component CSS. No `!important`. No styling another section's classes.
