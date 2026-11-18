import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";

import { systems } from "@/data/content";
import { projects } from "@/data/projects";
import type { Project } from "@/data/types";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Flip, gsap } from "@/lib/gsap";
import { pad2 } from "@/lib/format";
import { LAYERS } from "@/lib/layers";

import "./Matrix.css";

/** Chips come out of the data: deduped, most-used first, then alphabetical. */
function deriveTools(list: Project[]) {
  const counts = new Map<string, number>();
  list.forEach((project) => {
    project.stack.forEach((tool) => counts.set(tool, (counts.get(tool) ?? 0) + 1));
  });

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))
    .slice(0, 8)
    .map(([name, count]) => ({ name, count }));
}

const TOOLS = deriveTools(projects);
const ALL_TOOLS = new Set(projects.flatMap((project) => project.stack)).size;

const stripLabel = (project: Project) =>
  `${project.title} — ${LAYERS.map((layer) => `${layer.label} ${project.layers[layer.key]}%`).join(
    ", ",
  )}`;

/**
 * FIG. 03 — By capability.
 *
 * Cards are a reading surface, not navigation: they answer "which build used
 * this tool, and what did that do to its layer balance". Filtering is
 * multi-select and additive (AND) — pick two rare tools and you get nothing,
 * which is the honest answer.
 */
export function Matrix() {
  const reduced = useReducedMotion();
  const [active, setActive] = useState<string[]>([]);

  const gridRef = useRef<HTMLUListElement>(null);
  const flipRef = useRef<{ state: Flip.FlipState; count: number } | null>(null);
  const buildsRef = useRef<HTMLSpanElement>(null);
  const toolsRef = useRef<HTMLSpanElement>(null);
  const countsRef = useRef({ builds: projects.length, tools: ALL_TOOLS });

  const visible = useMemo(
    () => projects.filter((project) => active.every((tool) => project.stack.includes(tool))),
    [active],
  );

  const toolCount = useMemo(
    () => new Set(visible.flatMap((project) => project.stack)).size,
    [visible],
  );

  /* --- the count line moves, it does not jump ---------------------- */
  useEffect(() => {
    const builds = buildsRef.current;
    const tools = toolsRef.current;
    if (!builds || !tools) return;

    if (reduced) {
      builds.textContent = pad2(visible.length);
      tools.textContent = pad2(toolCount);
      countsRef.current = { builds: visible.length, tools: toolCount };
      return;
    }

    const proxy = { ...countsRef.current };
    const tween = gsap.to(proxy, {
      builds: visible.length,
      tools: toolCount,
      duration: 0.4,
      ease: "power2.out",
      onUpdate: () => {
        builds.textContent = pad2(proxy.builds);
        tools.textContent = pad2(proxy.tools);
        countsRef.current = { builds: proxy.builds, tools: proxy.tools };
      },
    });

    return () => {
      tween.kill();
    };
  }, [visible.length, toolCount, reduced]);

  /* --- reflow with Flip ------------------------------------------- */
  const toggle = (tool: string | null) => {
    const grid = gridRef.current;

    if (grid && !reduced) {
      const cards = Array.from(grid.children);
      if (cards.length > 0) {
        Flip.killFlipsOf(cards, true);
        flipRef.current = { state: Flip.getState(cards), count: cards.length };
      }
    }

    setActive((current) => {
      if (tool === null) return current.length === 0 ? current : [];
      return current.includes(tool)
        ? current.filter((item) => item !== tool)
        : [...current, tool];
    });
  };

  useLayoutEffect(() => {
    const capture = flipRef.current;
    flipRef.current = null;

    const grid = gridRef.current;
    if (!capture || !grid || reduced) return;

    const ctx = gsap.context(() => {
      if (capture.count === 0) {
        gsap.from(Array.from(grid.children), {
          opacity: 0,
          y: 8,
          duration: 0.4,
          ease: "expo.out",
          stagger: 0.03,
        });
        return;
      }

      Flip.from(capture.state, {
        duration: 0.6,
        ease: "expo.out",
        absolute: true,
        stagger: 0.03,
        onEnter: (elements) =>
          gsap.fromTo(
            elements,
            { opacity: 0, scale: 0.96 },
            { opacity: 1, scale: 1, duration: 0.45, ease: "expo.out", delay: 0.1 },
          ),
      });
    }, grid);

    // killed, never reverted: a finished Flip must not be rewound
    return () => ctx.kill();
  }, [active, reduced]);

  return (
    <section className="matrix-root" aria-labelledby="matrix-title">
      <header className="matrix-head">
        <p className="label tnum matrix-fig">Fig. 03</p>
        <h3 className="display display-3 matrix-title" id="matrix-title">
          {systems.matrixTitle}
        </h3>
        <p className="label matrix-hint">{systems.matrixNote}</p>
      </header>

      <div className="matrix-controls">
        <div className="matrix-chips" role="group" aria-label="Filter builds by capability">
          <button
            type="button"
            className="matrix-chip"
            aria-pressed={active.length === 0}
            onClick={() => toggle(null)}
          >
            All
            <span className="matrix-chip-count tnum">{pad2(projects.length)}</span>
          </button>

          {TOOLS.map((tool) => (
            <button
              type="button"
              className="matrix-chip"
              key={tool.name}
              aria-pressed={active.includes(tool.name)}
              onClick={() => toggle(tool.name)}
            >
              {tool.name}
              <span className="matrix-chip-count tnum">{pad2(tool.count)}</span>
            </button>
          ))}
        </div>

        <p className="matrix-count label">
          <span className="matrix-count-n tnum" ref={buildsRef}>
            {pad2(visible.length)}
          </span>{" "}
          builds
          <span className="matrix-count-dot" aria-hidden="true">
            ·
          </span>
          <span className="matrix-count-n tnum" ref={toolsRef}>
            {pad2(toolCount)}
          </span>{" "}
          tools
        </p>
      </div>

      <p className="sr-only" role="status">
        Builds shown: {visible.length}.
      </p>

      {visible.length > 0 ? (
        <ul className="matrix-grid" ref={gridRef}>
          {visible.map((project) => (
            <li className="matrix-card" key={project.slug}>
              <div className="matrix-card-top">
                <span className="label tnum matrix-card-index">{project.index}</span>
                <span className="label matrix-card-kind">{project.kind}</span>
              </div>

              <h4 className="matrix-card-title">{project.title}</h4>
              <p className="matrix-card-summary">{project.summary}</p>

              <ul className="matrix-stack">
                {project.stack.map((tool) => (
                  <li
                    className={`matrix-tag${active.includes(tool) ? " matrix-tag--on" : ""}`}
                    key={tool}
                  >
                    {tool}
                  </li>
                ))}
              </ul>

              <div
                className="matrix-strip"
                role="img"
                aria-label={stripLabel(project)}
              >
                {LAYERS.map((layer) => {
                  const value = project.layers[layer.key];
                  if (value === 0) return null;
                  return (
                    <span
                      className="matrix-strip-seg"
                      key={layer.key}
                      style={
                        {
                          "--layer": layer.color,
                          flexGrow: value,
                        } as CSSProperties
                      }
                    />
                  );
                })}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="matrix-empty">{systems.emptyState}</p>
      )}
    </section>
  );
}
