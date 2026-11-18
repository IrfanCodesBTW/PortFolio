import { useEffect, useRef } from "react";

import { gsap } from "@/lib/gsap";
import { pad2 } from "@/lib/format";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { process as processContent } from "@/data/content";

import "./Process.css";

export function Process() {
  const root = useRef<HTMLElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const fillHorizontal = useRef<HTMLSpanElement>(null);
  const fillVertical = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = root.current;
    const body = bodyRef.current;
    if (!el || !body) return;

    const ctx = gsap.context(() => {
      const horizontal = fillHorizontal.current;
      const vertical = fillVertical.current;
      const nodes = el.querySelectorAll<HTMLElement>(".proc-node-dot");
      const numbers = el.querySelectorAll<HTMLElement>(".proc-num");

      if (reduced) {
        gsap.set(nodes, { opacity: 1 });
        if (horizontal) gsap.set(horizontal, { scaleX: 1 });
        if (vertical) gsap.set(vertical, { scaleY: 1 });
        return;
      }

      /* The ruler draws as you read; the scrub is the one dominant move here. */
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: body,
          start: "top 78%",
          end: "bottom 72%",
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      });

      if (horizontal) timeline.to(horizontal, { scaleX: 1, ease: "none", duration: 1 }, 0);
      if (vertical) timeline.to(vertical, { scaleY: 1, ease: "none", duration: 1 }, 0);
      if (nodes.length) {
        timeline.to(
          nodes,
          { opacity: 1, duration: 0.2, stagger: 0.25, ease: "power1.out" },
          0,
        );
      }

      numbers.forEach((node) => {
        const target = Number(node.dataset.value ?? "0");
        const counter = { value: 0 };

        gsap.to(counter, {
          value: target,
          duration: 0.9,
          ease: "expo.out",
          scrollTrigger: { trigger: node, start: "top 88%", once: true },
          onStart: () => {
            node.textContent = pad2(0);
          },
          onUpdate: () => {
            node.textContent = pad2(counter.value);
          },
        });
      });

      gsap.from(".proc-step", {
        y: 22,
        opacity: 0,
        duration: 0.9,
        ease: "expo.out",
        stagger: 0.06,
        scrollTrigger: { trigger: body, start: "top 84%", once: true },
      });

      gsap.from(".proc-title .line", {
        yPercent: 130,
        duration: 1.1,
        ease: "expo.out",
        stagger: 0.08,
        scrollTrigger: { trigger: el, start: "top 72%", once: true },
      });

      gsap.from(".proc-meta", {
        y: 12,
        opacity: 0,
        duration: 0.8,
        ease: "expo.out",
        stagger: 0.06,
        scrollTrigger: { trigger: el, start: "top 72%", once: true },
      });
    }, el);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={root} id="process" data-ground="acid" className="section proc">
      <div className="shell">
        <header className="proc-head">
          <p className="label label--strong proc-eyebrow proc-meta">{processContent.eyebrow}</p>
          <p className="proc-note proc-meta">{processContent.note}</p>
          <h2 className="display display-2 proc-title">
            {processContent.title.map((line) => (
              <span className="mask" key={line}>
                <span className="line">{line}</span>
              </span>
            ))}
          </h2>
        </header>

        <div className="proc-body" ref={bodyRef}>
          <span className="proc-rule proc-rule--h" aria-hidden="true" />
          <span className="proc-rule proc-rule--v" aria-hidden="true" />
          <span className="proc-fill proc-fill--h" ref={fillHorizontal} aria-hidden="true" />
          <span className="proc-fill proc-fill--v" ref={fillVertical} aria-hidden="true" />

          <ol className="proc-steps">
            {processContent.steps.map((step) => (
              <li className="proc-step" key={step.index}>
                <span className="proc-node" aria-hidden="true">
                  <span className="proc-node-dot" />
                </span>
                <span
                  className="proc-num display display-3 tnum"
                  aria-hidden="true"
                  data-value={Number(step.index)}
                >
                  {step.index}
                </span>
                <h3 className="proc-step-title display display-4">{step.title}</h3>
                <p className="proc-summary">{step.summary}</p>
                <p className="proc-detail">{step.detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
