import { useEffect, useRef, useState } from "react";
import type { CSSProperties, FocusEvent } from "react";

import { gsap, ScrollTrigger } from "@/lib/gsap";
import { layerByKey } from "@/lib/layers";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { capabilities } from "@/data/content";

import "./Capabilities.css";

type LayerStyle = CSSProperties & { "--svc-layer": string };

const DESKTOP_POINTER = "(hover: hover) and (pointer: fine) and (min-width: 900px)";

function isDesktopPointer() {
  return typeof window !== "undefined" && window.matchMedia(DESKTOP_POINTER).matches;
}

export function Capabilities() {
  const root = useRef<HTMLElement>(null);
  const ctxRef = useRef<ReturnType<typeof gsap.context> | null>(null);
  /** Why the current row is open — hover closes on leave, click/focus stay put. */
  const sourceRef = useRef<"hover" | "focus" | "click" | null>(null);
  const previousOpen = useRef<number | null>(null);
  const lastPointerAt = useRef(0);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const reduced = useReducedMotion();

  /* Entrance: the header and the three rows arrive once. */
  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      if (reduced) return;

      const list = el.querySelector<HTMLElement>(".svc-list") ?? el;

      gsap.from(".svc-title .line", {
        yPercent: 130,
        duration: 1.1,
        ease: "expo.out",
        stagger: 0.08,
        scrollTrigger: { trigger: el, start: "top 72%", once: true },
      });

      gsap.from(".svc-meta", {
        y: 12,
        opacity: 0,
        duration: 0.8,
        ease: "expo.out",
        stagger: 0.06,
        scrollTrigger: { trigger: el, start: "top 72%", once: true },
      });

      gsap.from(".svc-row", {
        y: 26,
        opacity: 0,
        duration: 0.9,
        ease: "expo.out",
        stagger: 0.1,
        scrollTrigger: { trigger: list, start: "top 84%", once: true },
      });
    }, el);

    ctxRef.current = ctx;

    return () => {
      ctx.revert();
      ctxRef.current = null;
    };
  }, [reduced]);

  /* Accordion: GSAP measures the panel, so height animates without a max-height guess. */
  useEffect(() => {
    const context = ctxRef.current;
    if (!context) return;

    let detachResize: (() => void) | null = null;

    context.add(() => {
      const el = root.current;
      if (!el) return;

      const panels = Array.from(el.querySelectorAll<HTMLElement>(".svc-panel"));

      panels.forEach((panel, index) => {
        const inner = panel.querySelector<HTMLElement>(".svc-panel-inner");
        const wasOpen = previousOpen.current === index;
        const isOpen = openIndex === index;

        gsap.killTweensOf(panel);
        if (inner) gsap.killTweensOf(inner);

        if (!wasOpen && !isOpen) {
          gsap.set(panel, { height: 0 });
          if (inner) gsap.set(inner, { opacity: 0, y: 6 });
          return;
        }

        const settle = () => {
          if (reduced) return;
          ScrollTrigger.refresh(true);
        };

        if (isOpen) {
          gsap.to(panel, {
            height: "auto",
            duration: reduced ? 0 : 0.5,
            ease: "expo.out",
            overwrite: "auto",
            onComplete: settle,
          });
          if (inner) {
            gsap.to(inner, {
              opacity: 1,
              y: 0,
              duration: reduced ? 0 : 0.4,
              delay: reduced ? 0 : 0.06,
              ease: "power2.out",
              overwrite: "auto",
            });
          }
        } else {
          gsap.to(panel, {
            height: 0,
            duration: reduced ? 0 : 0.32,
            ease: "power2.inOut",
            overwrite: "auto",
            onComplete: settle,
          });
          if (inner) {
            gsap.to(inner, {
              opacity: 0,
              y: 6,
              duration: reduced ? 0 : 0.18,
              ease: "power2.out",
              overwrite: "auto",
            });
          }
        }
      });

      previousOpen.current = openIndex;

      const handleResize = () => {
        if (openIndex === null) return;
        const openPanel = panels[openIndex];
        if (openPanel) gsap.set(openPanel, { height: "auto" });
      };

      window.addEventListener("resize", handleResize);
      detachResize = () => window.removeEventListener("resize", handleResize);
    });

    return () => {
      if (detachResize) detachResize();
    };
  }, [openIndex, reduced]);

  const handlePointerEnter = (index: number) => {
    if (!isDesktopPointer() || sourceRef.current === "click") return;
    sourceRef.current = "hover";
    setOpenIndex(index);
  };

  const handleListLeave = () => {
    if (sourceRef.current !== "hover") return;
    sourceRef.current = null;
    setOpenIndex(null);
  };

  const handleToggle = (index: number) => {
    if (openIndex === index) {
      /* A hover preview becomes a pinned row on the first click. */
      if (sourceRef.current === "hover") {
        sourceRef.current = "click";
        return;
      }
      sourceRef.current = null;
      setOpenIndex(null);
      return;
    }
    sourceRef.current = "click";
    setOpenIndex(index);
  };

  const handleFocus = (event: FocusEvent<HTMLButtonElement>, index: number) => {
    /* Keyboard focus reveals the row; a pointer focus must not pre-empt the click. */
    if (Date.now() - lastPointerAt.current < 600) return;
    if (!event.currentTarget.matches(":focus-visible")) return;
    if (sourceRef.current === "click" && openIndex === index) return;
    sourceRef.current = "focus";
    setOpenIndex(index);
  };

  return (
    <section ref={root} id="capabilities" data-ground="bone" className="section svc">
      <div className="shell">
        <header className="svc-head">
          <p className="label label--strong svc-eyebrow svc-meta">{capabilities.eyebrow}</p>
          <p className="svc-note svc-meta">{capabilities.note}</p>
          <h2 className="display display-2 svc-title">
            {capabilities.title.map((line) => (
              <span className="mask" key={line}>
                <span className="line">{line}</span>
              </span>
            ))}
          </h2>
        </header>

        <ul
          className="svc-list"
          onPointerLeave={handleListLeave}
          onPointerDown={() => {
            lastPointerAt.current = Date.now();
          }}
        >
          {capabilities.items.map((item, index) => {
            const layer = layerByKey[item.layer];
            const isOpen = openIndex === index;

            return (
              <li
                key={item.index}
                className="svc-row"
                data-cursor="open"
                data-open={isOpen}
                style={{ "--svc-layer": layer.color } as LayerStyle}
                onPointerEnter={() => handlePointerEnter(index)}
              >
                <span className="svc-wash" aria-hidden="true" />

                <h3 className="svc-row-heading">
                  <button
                    type="button"
                    className="svc-trigger"
                    id={`svc-trigger-${item.index}`}
                    aria-expanded={isOpen}
                    aria-controls={`svc-panel-${item.index}`}
                    onClick={() => handleToggle(index)}
                    onFocus={(event) => handleFocus(event, index)}
                  >
                    <span className="svc-index label tnum">{item.index}</span>
                    <span className="svc-head-main">
                      <span className="svc-name display display-3">{item.title}</span>
                      <span className="svc-layer label">
                        <span className="svc-dot" aria-hidden="true" />
                        {layer.label}
                      </span>
                    </span>
                    <span className="svc-plus" aria-hidden="true" />
                  </button>
                </h3>

                <div
                  className="svc-panel"
                  id={`svc-panel-${item.index}`}
                  role="region"
                  aria-labelledby={`svc-trigger-${item.index}`}
                  aria-hidden={!isOpen}
                >
                  <div className="svc-panel-inner">
                    <div className="svc-panel-grid">
                      <div className="svc-col">
                        <span className="label">The work</span>
                        <p className="body svc-body">{item.body}</p>
                      </div>
                      <div className="svc-col">
                        <span className="label">Deliverables</span>
                        <ul className="svc-deliverables">
                          {item.deliverables.map((deliverable) => (
                            <li key={deliverable}>{deliverable}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="svc-col">
                        <span className="label">Evidence</span>
                        <ul className="svc-evidence">
                          {item.evidence.map((name) => (
                            <li key={name}>{name}</li>
                          ))}
                        </ul>
                        <p className="svc-layer-note">{layer.blurb}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
