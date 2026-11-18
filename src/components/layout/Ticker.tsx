import { useEffect, useRef } from "react";

import { ticker } from "@/data/content";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

import "./Ticker.css";

const DOT_COLORS = ["var(--interface)", "var(--application)", "var(--data)", "var(--intelligence)"];

export function Ticker() {
  const reduced = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || reduced) return;

    const ctx = gsap.context(() => {
      const tween = gsap.to(track, {
        xPercent: -50,
        duration: 34,
        ease: "none",
        repeat: -1,
      });

      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => {
          tween.timeScale(self.direction === 1 ? 1 : -1);
        },
      });

      const pause = () => tween.pause();
      const play = () => tween.play();
      track.addEventListener("pointerenter", pause);
      track.addEventListener("pointerleave", play);

      return () => {
        track.removeEventListener("pointerenter", pause);
        track.removeEventListener("pointerleave", play);
      };
    }, track);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section className="ticker" aria-label="Capabilities at a glance">
      <div className="ticker-track" ref={trackRef}>
        {[0, 1].map((copy) => (
          <ul className="ticker-list" key={copy} aria-hidden={copy === 1 ? true : undefined}>
            {ticker.map((item, index) => (
              <li className="ticker-item" key={`${copy}-${item}`}>
                <span
                  className="ticker-dot"
                  style={{ background: DOT_COLORS[index % DOT_COLORS.length] }}
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  );
}
