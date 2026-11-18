import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

import { site } from "@/data/content";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { pad2, pad3 } from "@/lib/format";
import { gsap } from "@/lib/gsap";
import { LAYERS } from "@/lib/layers";
import { startScroll, stopScroll } from "@/lib/scroll";

import "./Preloader.css";

/**
 * Contract with Hero: fired at the exact frame the exit curtain starts to
 * lift, so the hero reveal runs underneath it.
 */
export const ENTER_EVENT = "fourlayers:enter";

const ENTRY_KEY = "entered";
const PANEL_COUNT = 5;
const PANEL_STAGGER = 0.034;
/** Floor for the counter: progress may not land before this. */
const DWELL_MS = 420;

const nameParts = site.name.split(" ");
const NAME_LINES = [nameParts.slice(0, -1).join(" "), nameParts[nameParts.length - 1]];

type FlaggedWindow = Window & { __fourLayersEntered?: boolean };

/** Hero uses this so a re-entered page never waits for an event that already passed. */
export function entryAlreadyFired() {
  return Boolean((window as FlaggedWindow).__fourLayersEntered);
}

function readEntered() {
  try {
    return window.sessionStorage.getItem(ENTRY_KEY) === "1";
  } catch {
    return false;
  }
}

function writeEntered() {
  try {
    window.sessionStorage.setItem(ENTRY_KEY, "1");
  } catch {
    // Private mode can refuse storage. The plate still exits; it just replays.
  }
}

export function Preloader({ onDone }: { onDone: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const controlsRef = useRef<{ skip: () => void } | null>(null);

  const reduced = useReducedMotion();
  const [replay] = useState(readEntered);

  const finishedRef = useRef(false);
  const announcedRef = useRef(false);
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  /** The single exit hatch: every path ends here, exactly once. */
  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    writeEntered();
    startScroll();
    onDoneRef.current();
  }, []);

  const announce = useCallback(() => {
    if (announcedRef.current) return;
    announcedRef.current = true;
    (window as FlaggedWindow).__fourLayersEntered = true;
    window.dispatchEvent(new CustomEvent(ENTER_EVENT));
  }, []);

  const skip = useCallback(() => {
    controlsRef.current?.skip();
  }, []);

  // Scroll is locked for the life of the overlay, and released on any unmount.
  useEffect(() => {
    stopScroll();
    return () => startScroll();
  }, []);

  // ---- reduced motion: no counter, no panels, 200 ms fade ------------------
  useEffect(() => {
    if (!reduced) return;
    const root = rootRef.current;
    announce();
    if (!root) {
      finish();
      return;
    }
    const tween = gsap.to(root, { opacity: 0, duration: 0.2, ease: "none", onComplete: finish });
    const guard = window.setTimeout(finish, 400);
    return () => {
      tween.kill();
      window.clearTimeout(guard);
    };
  }, [reduced, announce, finish]);

  // ---- the real plate ------------------------------------------------------
  useLayoutEffect(() => {
    if (reduced) return;
    const root = rootRef.current;
    if (!root) return;

    const q = gsap.utils.selector(root);
    const panels = q(".pre-panel") as HTMLElement[];
    const inner = q(".pre-inner") as HTMLElement[];
    const rows = q(".pre-layer") as HTMLElement[];
    const fills = q(".pre-layer-fill") as HTMLElement[];
    const hairlines = q(".pre-hairline") as HTMLElement[];
    const nameLines = q(".pre-name-line") as HTMLElement[];
    const chrome = q(".pre-top, .pre-foot") as HTMLElement[];

    const timers: number[] = [];
    const mountedAt = performance.now();
    let introTl: gsap.core.Timeline | null = null;
    let exitTl: gsap.core.Timeline | null = null;
    let creep: gsap.core.Tween | null = null;
    let poll = 0;
    let skipping = false;
    let disposed = false;

    const tick = { value: 0 };
    let lit = 0;

    const renderCount = () => {
      const value = Math.round(tick.value);
      if (countRef.current) countRef.current.textContent = pad3(value);
      while (lit < rows.length && value >= (lit + 1) * 25) {
        rows[lit].classList.add("is-live");
        gsap.to(fills[lit], { scaleX: 1, duration: 0.5, ease: "expo.out" });
        lit += 1;
      }
    };

    // A skip must never be queued behind a 2 second timeline.
    const hardSkip = () => {
      if (skipping || finishedRef.current) return;
      skipping = true;
      introTl?.kill();
      exitTl?.kill();
      creep?.kill();
      gsap.killTweensOf(tick);
      if (poll) window.clearInterval(poll);
      poll = 0;
      renderCount();
      announce();
      gsap
        .timeline({ onComplete: finish })
        .to(q(".pre-inner"), { opacity: 0, duration: 0.18, ease: "none" }, 0)
        .to(panels, { yPercent: -100, duration: 0.5, ease: "power3.inOut", stagger: 0.02 }, 0.02);
    };

    controlsRef.current = { skip: hardSkip };

    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Enter" && event.key !== "Escape") return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      event.preventDefault();
      hardSkip();
    };
    window.addEventListener("keydown", onKey);

    // Second visit in this session: one plate, one lift, no counter.
    if (replay) {
      announce();
      gsap
        .timeline({ onComplete: finish })
        .to(q(".pre-fast-mark"), { opacity: 0, duration: 0.16, ease: "none" }, 0)
        .to(panels, { yPercent: -100, duration: 0.44, ease: "power3.inOut" }, 0.02);
      return () => {
        disposed = true;
        window.removeEventListener("keydown", onKey);
        controlsRef.current = null;
        timers.forEach((id) => window.clearTimeout(id));
        if (poll) window.clearInterval(poll);
      };
    }

    const ctx = gsap.context(() => {
      gsap.set(hairlines, { scaleY: 0, transformOrigin: "50% 0%" });
      gsap.set(nameLines, { yPercent: 135 });
      gsap.set(fills, { scaleX: 0, transformOrigin: "0% 50%" });
      gsap.set(chrome, { opacity: 0, y: 10 });

      gsap.to(hairlines, { scaleY: 1, duration: 0.8, ease: "expo.out", stagger: 0.04 });
      gsap.to(chrome, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "expo.out",
        stagger: 0.08,
        delay: 0.08,
      });

      // ---- counter: real signals, authored rhythm -------------------------
      const gate = { ready: false };
      let fontsDone = false;
      let loadDone = document.readyState === "complete";

      const settle = () => {
        if (fontsDone && loadDone) gate.ready = true;
      };

      if (document.fonts) {
        document.fonts.ready
          .then(() => {
            fontsDone = true;
            settle();
          })
          .catch(() => {
            fontsDone = true;
            settle();
          });
      } else {
        fontsDone = true;
      }

      if (loadDone) {
        settle();
      } else {
        window.addEventListener(
          "load",
          () => {
            loadDone = true;
            settle();
          },
          { once: true },
        );
      }

      // Ceiling: never hold the page for a slow font.
      timers.push(window.setTimeout(() => (gate.ready = true), 1100));

      const reveal = () => {
        if (disposed || skipping) return;
        exitTl = gsap.timeline({ onComplete: finish });
        exitTl
          .to(q(".pre-count-wrap"), { opacity: 0, duration: 0.16, ease: "none" }, 0)
          .to(nameLines, { yPercent: 0, duration: 0.8, ease: "expo.out", stagger: 0.08 }, 0.04)
          .add(() => announce(), 0.3)
          .to(hairlines, { opacity: 0, duration: 0.2, ease: "none" }, 0.3)
          .to(inner, { yPercent: -104, duration: 0.7, ease: "power3.inOut" }, 0.26)
          .to(panels, { yPercent: -100, duration: 0.5, ease: "power3.inOut", stagger: PANEL_STAGGER }, 0.32);
      };

      let landed = false;
      const land = () => {
        if (landed || disposed || skipping) return;

        // Never let a fast connection skip the opening beat.
        const remaining = DWELL_MS - (performance.now() - mountedAt);
        if (remaining > 0) {
          timers.push(window.setTimeout(land, remaining + 16));
          return;
        }

        landed = true;
        gsap.to(tick, { value: 100, duration: 0.16, ease: "power1.out", onUpdate: renderCount, onComplete: reveal });
      };

      const hold = () => {
        // Already loaded inside the minimum dwell: finish cleanly.
        if (gate.ready) {
          land();
          return;
        }
        // Otherwise keep the number alive for at most 220 ms more.
        const started = performance.now();
        creep = gsap.to(tick, { value: 96, duration: 0.35, ease: "none", onUpdate: renderCount });
        poll = window.setInterval(() => {
          if (!gate.ready && performance.now() - started < 220) return;
          window.clearInterval(poll);
          poll = 0;
          creep?.kill();
          land();
        }, 30);
      };

      introTl = gsap.timeline({ onUpdate: renderCount, onComplete: hold });
      introTl
        .to(tick, { value: 6, duration: 0.07, ease: "power2.out" })
        .to(tick, { value: 8, duration: 0.05, ease: "none" })
        .to(tick, { value: 26, duration: 0.1, ease: "power2.out" })
        .to(tick, { value: 31, duration: 0.05, ease: "none" })
        .to(tick, { value: 47, duration: 0.11, ease: "power2.inOut" })
        .to(tick, { value: 58, duration: 0.07, ease: "power1.out" })
        .to(tick, { value: 71, duration: 0.1, ease: "power2.out" })
        .to(tick, { value: 76, duration: 0.06, ease: "none" })
        .to(tick, { value: 86, duration: 0.08, ease: "power2.inOut" })
        .to(tick, { value: 92, duration: 0.09, ease: "power2.out" });
    }, root);

    return () => {
      disposed = true;
      timers.forEach((id) => window.clearTimeout(id));
      if (poll) window.clearInterval(poll);
      window.removeEventListener("keydown", onKey);
      controlsRef.current = null;
      ctx.revert();
    };
  }, [reduced, replay, announce, finish]);

  return (
    <div
      className={`pre${replay ? " pre--replay" : ""}${reduced ? " pre--reduced" : ""}`}
      ref={rootRef}
      role={reduced ? undefined : "dialog"}
      aria-modal={reduced ? undefined : true}
      aria-label="Loading the portfolio"
    >
      {reduced ? (
        <p className="pre-static-mark">{site.wordmark}</p>
      ) : replay ? (
        <p className="pre-fast-mark">{site.wordmark}</p>
      ) : (
        <div className="pre-inner">
          <div className="pre-top">
            <span className="label">Four domains</span>
            <span className="label pre-top-role">{site.role}</span>
          </div>

          <p className="pre-name">
            <span className="pre-name-mask">
              <span className="pre-name-line">{NAME_LINES[0]}</span>
            </span>
            <span className="pre-name-mask">
              <span className="pre-name-line pre-name-line--b">
                <span>{NAME_LINES[1]}</span>
                <span className="pre-name-role">
                  {site.location} — {site.timezoneLabel}
                </span>
              </span>
            </span>
          </p>

          <ol className="pre-layers">
            {LAYERS.map((layer, index) => (
              <li
                key={layer.key}
                className="pre-layer"
                data-on={layer.key === "application" || layer.key === "data" ? "bone" : "ink"}
                style={{ "--layer": layer.color } as CSSProperties}
              >
                <span className="pre-layer-index label tnum">{pad2(index + 1)}</span>
                <span className="pre-layer-name">{layer.label}</span>
                <span className="pre-layer-track" aria-hidden="true">
                  <span className="pre-layer-fill" />
                </span>
                <span className="pre-layer-pct label tnum">{pad3((index + 1) * 25)}</span>
              </li>
            ))}
          </ol>

          <div className="pre-foot">
            <span className="pre-wordmark">{site.wordmark}</span>
            <button type="button" className="pre-skip" onClick={skip}>
              Skip intro
            </button>
            <div className="pre-count-wrap">
              <span className="pre-count tnum" ref={countRef} aria-hidden="true">
                {pad3(0)}
              </span>
              <span className="pre-count-total" aria-hidden="true">
                /100
              </span>
              <span className="sr-only">Loading, please wait.</span>
            </div>
          </div>
        </div>
      )}

      <div className="pre-hairlines" aria-hidden="true">
        {Array.from({ length: 6 }, (_, index) => (
          <span key={index} className="pre-hairline" />
        ))}
      </div>

      <div className="pre-curtain" aria-hidden="true">
        {Array.from({ length: replay ? 1 : PANEL_COUNT }, (_, index) => (
          <span key={index} className="pre-panel" />
        ))}
      </div>
    </div>
  );
}
