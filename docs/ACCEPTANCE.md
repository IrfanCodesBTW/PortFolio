# Acceptance Checklist

## Global

- [ ] `npm run typecheck` passes clean.
- [ ] `npm run build` passes and the bundle stays under 220 KB gzip JS.
- [ ] No console errors or warnings on load, scroll, resize, or sheet open.
- [ ] Page looks designed with JavaScript animations disabled.
- [ ] No horizontal overflow at 360, 390, 768, 1024, 1440, 1920.
- [ ] All five sections sit on their intended ground; text contrast holds on each.
- [ ] Fonts resolve before any measurement-based animation runs.
- [ ] `prefers-reduced-motion` path: no pin, no cursor, no scrub, content complete.

## Preloader

- [ ] Counter is driven by real load signals, not a fixed timer.
- [ ] Layer labels appear in order and in their colours.
- [ ] Exit uses panels, not a fade to white.
- [ ] ≤ 2.3 s total; second visit in the same session ≤ 500 ms.
- [ ] Skip works with mouse, Enter and Escape.
- [ ] Scroll is locked during and released after, in every path.
- [ ] `onDone` fires exactly once.

## Hero

- [ ] Headline is the largest object on screen at 1440.
- [ ] IST clock ticks and is correct.
- [ ] Layer stack is draggable with pointer, keyboard-reachable, and readable at rest.
- [ ] Clicking a slab goes to Systems.
- [ ] CTAs target contact and work.
- [ ] On 390 px the stack does not push content into overflow.

## Manifest

- [ ] Word-colour scrub completes exactly once and never leaves words unreadable.
- [ ] Paragraph measure ≤ 60ch.

## Work

- [ ] Five rows, index, kind, lead tag, proportional layer strip.
- [ ] Hovering changes the preview with a wipe, not a fade.
- [ ] Case sheet contains problem, approach, boundary, stack, layer balance.
- [ ] ESC closes, focus returns to the triggering row, background does not scroll.
- [ ] `#work/<slug>` opens the right case on load; closing restores `#work`.
- [ ] Mobile has no pin and the plate appears inline.

## Systems

- [ ] Anatomy pin holds and releases cleanly; final frame is a complete diagram.
- [ ] The diagram reads as four layers, not as decoration.
- [ ] Composition bars are proportional to real data and labelled.
- [ ] Matrix filters reflow without layout jumps; counts update; empty state exists.
- [ ] Chips are keyboard operable and expose `aria-pressed`.
- [ ] Pin is disabled under 900 px and under reduced motion.

## Services / Process / About

- [ ] One service row open at a time, height animation has no jump at the end.
- [ ] Process ruler draws progressively and is legible on acid.
- [ ] Portrait fallback looks intentional with no image present; `/portrait.jpg` overrides it.
- [ ] Tool ticker pauses on hover and is static under reduced motion.

## Chrome / Contact / Footer

- [ ] Nav bar background matches the current ground at every section boundary.
- [ ] Nav hides down / returns up; mobile menu traps focus and closes on ESC.
- [ ] Cursor is absent on touch and reduced motion.
- [ ] Copy email works, announces, and resets; mailto includes the selected scope.
- [ ] Footer wordmark reveal is clipped and never causes overflow.
- [ ] Back to top works.

## Content integrity

- [ ] Every project is labelled concept / study / prototype.
- [ ] No invented clients, testimonials, years or metrics.
- [ ] Layer percentages are presented as authored estimates.
- [ ] No banned words (passionate, cutting-edge, solutions, journey, elevate, seamless, robust).
