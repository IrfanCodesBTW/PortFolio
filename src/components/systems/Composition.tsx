import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";

import { systems } from "@/data/content";
import { projects } from "@/data/projects";
import type { LayerKey, Project } from "@/data/types";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { gsap } from "@/lib/gsap";
import { LAYERS } from "@/lib/layers";

import "./Composition.css";

/** Mono numerals are set in the segment itself, so each layer needs an ink
    that survives its own fill. */
const SEGMENT_INK: Record<LayerKey, string> = {
  interface: "var(--ink)",
  application: "var(--bone)",
  data: "var(--bone)",
  intelligence: "var(--ink)",
};

const total = (project: Project) =>
  LAYERS.reduce((sum, layer) => sum + project.layers[layer.key], 0);

const balanceLabel = (project: Project) =>
  `${project.title} — domain balance: ${LAYERS.map(
    (layer) => `${layer.label} ${project.layers[layer.key]} percent`,
  ).join(", ")}.`;

/**
 * FIG. 02 — Layer balance.
 *
 * One row per build, always summing to a full bar. The percentages are
 * authored, not measured, and they only appear when a row is read (hover or
 * focus) — the accessible label always carries them.
 */
export function Composition() {
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return;

    const ctx = gsap.context(() => {
      gsap.from(".comp-bar", {
        scaleX: 0,
        transformOrigin: "left center",
        duration: 0.9,
        ease: "expo.out",
        stagger: 0.08,
        scrollTrigger: { trigger: root, start: "top 74%", once: true },
      });
    }, root);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section className="comp-root" aria-labelledby="comp-title" ref={rootRef}>
      <header className="comp-head">
        <p className="label tnum comp-fig">Fig. 02</p>
        <h3 className="display display-3 comp-title" id="comp-title">
          {systems.compositionTitle}
        </h3>
        <p className="label comp-hint">Hover for the split</p>
      </header>

      <ul className="comp-legend">
        {LAYERS.map((layer) => (
          <li className="comp-legend-item" key={layer.key}>
            <span
              className="comp-swatch"
              style={{ "--layer": layer.color } as CSSProperties}
              aria-hidden="true"
            />
            <span className="comp-legend-name">{layer.label}</span>
            <span className="comp-legend-blurb">{layer.blurb}</span>
          </li>
        ))}
      </ul>

      <div className="comp-scale" aria-hidden="true">
        <span />
        <div className="comp-scale-track">
          {[0, 25, 50, 75, 100].map((tick) => (
            <span
              className={`comp-scale-label tnum${
                tick === 0 ? " comp-scale-label--start" : tick === 100 ? " comp-scale-label--end" : ""
              }`}
              key={tick}
              style={{ left: `${tick}%` }}
            >
              {tick}
            </span>
          ))}
        </div>
        <span className="label comp-scale-total">Total</span>
      </div>

      <ul className="comp-rows">
        {projects.map((project) => (
          <li className="comp-row" key={project.slug} tabIndex={0}>
            <div className="comp-id">
              <span className="label tnum comp-index">{project.index}</span>
              <span className="comp-name">{project.title}</span>
              <span className="label comp-kind">{project.kind}</span>
            </div>

            <div className="comp-bar" role="img" aria-label={balanceLabel(project)}>
              {LAYERS.map((layer) => {
                const value = project.layers[layer.key];
                if (value === 0) return null;
                return (
                  <span
                    className="comp-seg"
                    key={layer.key}
                    style={
                      {
                        "--layer": layer.color,
                        "--seg-ink": SEGMENT_INK[layer.key],
                        flexGrow: value,
                      } as CSSProperties
                    }
                  >
                    <span className="comp-seg-pct tnum">{value}</span>
                  </span>
                );
              })}
            </div>

            <p className="comp-total tnum">{total(project)}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
