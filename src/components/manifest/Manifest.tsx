import { useLayoutEffect, useRef } from "react";

import { manifest } from "@/data/content";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { gsap } from "@/lib/gsap";

import "./Manifest.css";

const PARAGRAPH_WORDS = manifest.paragraph.split(" ");

// Authored line break: the last word carries the line on its own.
const LEAD_PARTS = manifest.lead.split(" ");
const LEAD_LINES = [
  LEAD_PARTS.slice(0, -1).join(" "),
  LEAD_PARTS[LEAD_PARTS.length - 1],
];

export function Manifest() {
  const rootRef = useRef<HTMLElement>(null);
  const paraRef = useRef<HTMLParagraphElement>(null);

  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    const root = rootRef.current;
    const para = paraRef.current;
    if (!root || !para) return;

    const ctx = gsap.context(() => {
      if (reduced) return;

      const lead = gsap.utils.toArray<HTMLElement>(".man-lead .line", root);
      const words = gsap.utils.toArray<HTMLElement>(".man-word", root);

      gsap.set(lead, { yPercent: 126 });

      gsap.to(lead, {
        yPercent: 0,
        duration: 1.1,
        stagger: 0.08,
        ease: "expo.out",
        scrollTrigger: { trigger: root, start: "top 78%", once: true },
      });

      // One trigger, one scrub: dim → foreground, word by word.
      gsap.fromTo(
        words,
        { "--w": 0 },
        {
          "--w": 1,
          duration: 0.5,
          ease: "none",
          stagger: 0.35,
          immediateRender: false,
          scrollTrigger: {
            trigger: para,
            start: "top 70%",
            end: "bottom 55%",
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        },
      );
    }, root);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      id="standard"
      data-ground="ink"
      className={`man section${reduced ? " man--still" : ""}`}
      ref={rootRef}
    >
      <div className="shell">
        <div className="man-head">
          <p className="label">{manifest.eyebrow}</p>
        </div>

        <div className="man-body">
          <div className="man-main">
            <h2 className="man-lead display display-2">
              {LEAD_LINES.map((line) => (
                <span className="mask" key={line}>
                  <span className="line">{line}</span>
                </span>
              ))}
            </h2>

            <p className="man-para" ref={paraRef}>
              {PARAGRAPH_WORDS.map((word, index) => (
                <span className="man-word" key={`${word}-${index}`}>
                  {word}
                  {index < PARAGRAPH_WORDS.length - 1 ? " " : ""}
                </span>
              ))}
            </p>
          </div>

          <aside className="man-aside">
            <p className="man-aside-body">{manifest.aside}</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
