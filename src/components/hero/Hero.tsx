import { useEffect, useLayoutEffect, useRef } from "react";

import { hero } from "@/data/content";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { formatTime } from "@/lib/format";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { scrollToTarget } from "@/lib/scroll";
import { ENTER_EVENT, entryAlreadyFired } from "@/components/preloader/Preloader";

import { SystemDial } from "./SystemDial";
import "./Hero.css";

export function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const clockRef = useRef<HTMLSpanElement>(null);

  const reduced = useReducedMotion();

  // IST clock — written straight to the node, no re-render per second.
  useEffect(() => {
    const paint = () => {
      if (clockRef.current) clockRef.current.textContent = formatTime(new Date());
    };
    paint();
    const id = window.setInterval(paint, 1000);
    return () => window.clearInterval(id);
  }, []);

  // Entrance waits for the preloader's curtain, then reveals under it.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      if (reduced) return;

      const rises = gsap.utils.toArray<HTMLElement>(".hero-rise", root);

      gsap.set(rises, { y: 14 });

      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: "expo.out" },
        // Measured after the entry, when the curtain and scroll lock are gone.
        onComplete: () => ScrollTrigger.refresh(),
      });
      // The headline is painted at full size from the first frame: it is the
      // LCP element and it is already covered by the curtain, so animating it
      // would only delay the largest paint.
      tl.to(rises, { y: 0, duration: 0.8, stagger: 0.06 }, 0);

      let played = false;
      let fallback = 0;
      const start = () => {
        if (played) return;
        played = true;
        tl.play();
        window.clearTimeout(fallback);
        window.removeEventListener(ENTER_EVENT, start);
      };

      if (entryAlreadyFired()) {
        start();
      } else {
        window.addEventListener(ENTER_EVENT, start);
        fallback = window.setTimeout(start, 1800);
      }

      return () => {
        window.clearTimeout(fallback);
        window.removeEventListener(ENTER_EVENT, start);
      };
    }, root);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section id="hero" data-ground="bone" className="hero" ref={rootRef}>
      <div className="shell hero-shell">
        <div className="hero-top hero-rise">
          <p className="label hero-kicker">{hero.kicker}</p>
          <ul className="hero-meta">
            {hero.meta.map((fact) => (
              <li className="hero-fact" key={fact.key}>
                <span className="label hero-fact-key">{fact.key}</span>
                <span className="label hero-fact-value tnum">
                  {fact.key === "Clock" ? (
                    <>
                      <span ref={clockRef}>{formatTime(new Date())}</span> IST
                    </>
                  ) : (
                    fact.value
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <h1 className="hero-title display display-1">
          {hero.lines.map((line) => (
            <span className="mask" key={line}>
              <span className="line">{line}</span>
            </span>
          ))}
        </h1>

        <div className="hero-base">
          <div className="hero-copy">
            <p className="body hero-sub hero-rise">{hero.sub}</p>

            <div className="hero-actions hero-rise">
              <button
                type="button"
                className="btn btn--solid"
                onClick={() => scrollToTarget("contact")}
                data-cursor="open"
              >
                {hero.primary}
                <span className="arrow" aria-hidden="true">
                  ↗
                </span>
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => scrollToTarget("work")}
                data-cursor="view"
              >
                {hero.secondary}
                <span className="arrow" aria-hidden="true">
                  ↘
                </span>
              </button>
            </div>

            <p className="hero-legend hero-rise">{hero.note}</p>
          </div>

          <div className="hero-dial-wrap hero-rise">
            <SystemDial />
          </div>
        </div>
      </div>
    </section>
  );
}
