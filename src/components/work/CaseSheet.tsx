import { useCallback, useEffect, useRef } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { createPortal } from "react-dom";

import { Flip, gsap } from "@/lib/gsap";
import { startScroll, stopScroll } from "@/lib/scroll";
import { LAYERS, layerByKey } from "@/lib/layers";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { work } from "@/data/content";
import { projects } from "@/data/projects";
import type { Project } from "@/data/types";

import "./CaseSheet.css";

interface CaseSheetProps {
  project: Project;
  /** The row that opened the sheet, used for the Flip open/close. */
  origin?: HTMLElement | null;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

const pad2 = (value: number) => String(value).padStart(2, "0");

export function CaseSheet({ project, origin, onClose, onNext, onPrev }: CaseSheetProps) {
  const reduced = useReducedMotion();
  const sheetRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const closingRef = useRef(false);
  const firstSlug = useRef(project.slug);

  // Keep the latest preference available to one-shot GSAP effects.
  const reducedRef = useRef(reduced);
  useEffect(() => {
    reducedRef.current = reduced;
  }, [reduced]);

  const requestClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;

    const sheet = sheetRef.current;
    const canFlip = sheet && origin && origin.isConnected && !reducedRef.current;

    const finish = () => {
      onClose();
    };

    if (!sheet || !canFlip) {
      finish();
      return;
    }

    let done = false;
    const settle = () => {
      if (done) return;
      done = true;
      finish();
    };

    gsap.context(() => {
      gsap.to("[data-case-content]", {
        opacity: 0,
        y: -12,
        duration: 0.22,
        ease: "power2.in",
      });

      Flip.fit(sheet, origin, {
        duration: 0.5,
        delay: 0.08,
        scale: true,
        ease: "expoOut",
        onComplete: settle,
      });

      // If the Flip is interrupted, never leave the reader inside a dead sheet.
      gsap.delayedCall(0.95, () => {
        if (sheet.isConnected) settle();
      });
    }, sheet);
  }, [onClose, origin]);

  // Lock the page, flip the surface open from the clicked row, then land content.
  useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet) return;

    const reducedAtOpen = reducedRef.current;
    const originAtOpen = origin;
    stopScroll();

    const ctx = gsap.context(() => {
      if (reducedAtOpen) return;

      if (originAtOpen && originAtOpen.isConnected) {
        Flip.fit(sheet, originAtOpen, { duration: 0, scale: true });
        const startState = Flip.getState(sheet);
        gsap.set(sheet, { clearProps: "transform" });
        Flip.from(startState, { duration: 0.55, ease: "expoOut", scale: true });
      } else {
        gsap.fromTo(sheet, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power2.out" });
      }

      gsap.from("[data-case-content]", {
        opacity: 0,
        duration: 0.32,
        delay: 0.2,
        ease: "power2.out",
      });

      gsap.from("[data-case-bar]", {
        y: -14,
        opacity: 0,
        duration: 0.5,
        delay: 0.28,
        ease: "expoOut",
      });

      gsap.from("[data-case-rise]", {
        y: 20,
        opacity: 0,
        duration: 0.7,
        delay: 0.34,
        stagger: 0.045,
        ease: "expoOut",
      });

      gsap.from("[data-layer-fill]", {
        scaleX: 0,
        transformOrigin: "left center",
        duration: 0.9,
        delay: 0.45,
        stagger: 0.08,
        ease: "expoOut",
      });
    }, sheet);

    sheet.focus({ preventScroll: true });

    return () => {
      ctx.revert();
      startScroll();
    };
    // Open once per mounted sheet; next/prev animate in their own effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ESC anywhere closes, even if focus somehow left the surface.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        requestClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [requestClose]);

  // A new case in the same sheet resets the reading position.
  useEffect(() => {
    if (firstSlug.current === project.slug) return;

    scrollRef.current?.scrollTo({ top: 0 });
    if (reducedRef.current) return;

    const content = contentRef.current;
    if (!content) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-case-rise]",
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.04, ease: "expoOut" },
      );
      gsap.fromTo(
        "[data-layer-fill]",
        { scaleX: 0 },
        {
          scaleX: 1,
          transformOrigin: "left center",
          duration: 0.7,
          stagger: 0.06,
          ease: "expoOut",
        },
      );
    }, content);

    return () => ctx.revert();
  }, [project.slug]);

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") return;

    const sheet = sheetRef.current;
    if (!sheet) return;

    const focusable = Array.from(
      sheet.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      ),
    );

    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && (active === first || active === sheet)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const lead = layerByKey[project.lead];
  const index = projects.findIndex((item) => item.slug === project.slug);
  const nextProject = projects[(index + 1) % projects.length];
  const prevProject = projects[(index - 1 + projects.length) % projects.length];
  const titleId = `case-title-${project.slug}`;

  return createPortal(
    <div
      className="case-sheet"
      ref={sheetRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
    >
      <div className="case-bar" data-case-bar>
        <div className="case-bar-left">
          <span className="case-bar-index tnum">{project.index}</span>
          <span
            className="case-bar-dot"
            style={{ background: lead.color }}
            aria-hidden="true"
          />
          <span className="label case-bar-kind">{project.kind}</span>
        </div>

        <div className="case-bar-right">
          <button
            type="button"
            className="case-nav"
            onClick={onPrev}
            aria-label={`Previous case — ${prevProject.title}`}
          >
            <span aria-hidden="true">←</span>
          </button>
          <button
            type="button"
            className="case-nav"
            onClick={onNext}
            aria-label={`Next case — ${nextProject.title}`}
          >
            <span aria-hidden="true">→</span>
          </button>
          <button
            type="button"
            className="case-close"
            data-case-close
            onClick={requestClose}
            aria-label={work.closeLabel}
          >
            <span className="case-close-label">{work.closeLabel}</span>
            <span className="case-close-glyph" aria-hidden="true">
              ×
            </span>
          </button>
        </div>
      </div>

      <div className="case-scroll" ref={scrollRef} data-lenis-prevent>
        <div className="case-body shell" data-case-content ref={contentRef}>
          <h2 id={titleId} className="display display-2 case-title">
            {project.title}
          </h2>
          <p className="case-summary">{project.summary}</p>

          <hr className="rule case-rule" />

          <div className="case-notes">
            <section className="case-note" data-case-rise>
              <h3 className="label label--strong">{work.caseLabels.challenge}</h3>
              <p>{project.challenge}</p>
            </section>
            <section className="case-note" data-case-rise>
              <h3 className="label label--strong">{work.caseLabels.approach}</h3>
              <p>{project.approach}</p>
            </section>
            <section className="case-note" data-case-rise>
              <h3 className="label label--strong">{work.caseLabels.boundary}</h3>
              <p>{project.boundary}</p>
            </section>
          </div>

          <div className="case-meta">
            <section className="case-stack" data-case-rise>
              <h3 className="label label--strong">{work.caseLabels.stack}</h3>
              <ul className="case-chips">
                {project.stack.map((tool) => (
                  <li key={tool} className="case-chip">
                    {tool}
                  </li>
                ))}
              </ul>
            </section>

            <section className="case-balance" data-case-rise>
              <h3 className="label label--strong">{work.caseLabels.layers}</h3>
              <div className="case-layers">
                {LAYERS.map((layer) => {
                  const value = project.layers[layer.key];
                  return (
                    <div className="case-layer" key={layer.key}>
                      <span className="label case-layer-name">{layer.label}</span>
                      <span className="case-layer-track">
                        <span
                          className="case-layer-fill"
                          data-layer-fill
                          style={{ width: `${value}%`, background: layer.color }}
                        />
                      </span>
                      <span className="label label--strong tnum case-layer-value">
                        {pad2(value)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          <div className="case-foot">
            <button
              type="button"
              className="case-next"
              onClick={onNext}
              aria-label={`Next case — ${nextProject.title}`}
            >
              <span className="case-next-index label tnum">{nextProject.index}</span>
              <span className="display display-4 case-next-title">{nextProject.title}</span>
              <span className="case-next-arrow" aria-hidden="true">
                →
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
