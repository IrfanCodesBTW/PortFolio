import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

import { gsap } from "@/lib/gsap";
import { layerByKey } from "@/lib/layers";
import { projectBySlug, projects } from "@/data/projects";
import { work } from "@/data/content";
import { useReducedMotion } from "@/hooks/useReducedMotion";

import { CaseSheet } from "./CaseSheet";
import { LayerStrip } from "./LayerStrip";
import { ProjectPlate } from "./ProjectPlate";

import "./Work.css";

const COUNT = String(projects.length).padStart(2, "0");
const NARROW_QUERY = "(max-width: 900px)";
const CASE_HASH = /^#work\/([a-z0-9-]+)$/i;

const slugFromHash = () => {
  if (typeof window === "undefined") return null;
  const match = CASE_HASH.exec(window.location.hash);
  const project = match ? projectBySlug(match[1]) : undefined;
  return project ? project.slug : null;
};

const leadVars = (color: string) => ({ "--lead": color }) as CSSProperties;

export function Work() {
  const reduced = useReducedMotion();

  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const zRef = useRef(projects.length);
  const painted = useRef(false);
  const rowRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const [active, setActive] = useState(0);
  const [openIndex, setOpenIndex] = useState(-1);
  const [narrow, setNarrow] = useState(
    () => typeof window !== "undefined" && window.matchMedia(NARROW_QUERY).matches,
  );
  const [caseSlug, setCaseSlug] = useState<string | null>(() => slugFromHash());
  const [origin, setOrigin] = useState<HTMLElement | null>(null);

  /* --- responsive mode ------------------------------------- */

  useEffect(() => {
    const mq = window.matchMedia(NARROW_QUERY);
    const handle = () => setNarrow(mq.matches);
    mq.addEventListener("change", handle);
    return () => mq.removeEventListener("change", handle);
  }, []);

  /* --- preview wipe ---------------------------------------- */

  useEffect(() => {
    const stack = stackRef.current;
    if (!stack) return;

    if (!painted.current) {
      painted.current = true;
      return;
    }

    const plates = Array.from(stack.querySelectorAll<HTMLElement>(".work-plate"));
    const incoming = plates[active];
    if (!incoming) return;

    const others = plates.filter((plate) => plate !== incoming);

    if (reduced) {
      gsap.set(incoming, { clipPath: "inset(0% 0% 0% 0%)" });
      gsap.set(others, { clipPath: "inset(0% 0% 100% 0%)" });
      return;
    }

    zRef.current += 1;
    gsap.set(incoming, { zIndex: zRef.current, clipPath: "inset(0% 0% 100% 0%)" });

    tweenRef.current?.kill();
    tweenRef.current = gsap.to(incoming, {
      clipPath: "inset(0% 0% 0% 0%)",
      duration: 0.7,
      ease: "expoOut",
      onComplete: () => {
        gsap.set(others, { clipPath: "inset(0% 0% 100% 0%)" });
      },
    });
  }, [active, reduced]);

  useEffect(() => {
    return () => {
      tweenRef.current?.kill();
    };
  }, []);

  /* --- desktop pin: the index holds while the page moves ---- */

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage || reduced) return;

    const cleanups: Array<() => void> = [];

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      cleanups.push(() => mm.revert());

      mm.add("(min-width: 901px)", () => {
        const rows = gsap.utils.toArray<HTMLElement>(".work-list");
        const preview = gsap.utils.toArray<HTMLElement>(".work-preview-inner");

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: stage,
            start: "top 12%",
            end: "+=120%",
            pin: true,
            pinSpacing: true,
            scrub: 0.8,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        timeline
          .to(rows, { yPercent: -3, ease: "none" }, 0)
          .to(preview, { yPercent: 3, ease: "none" }, 0);

        return () => {
          timeline.scrollTrigger?.kill();
          timeline.kill();
        };
      }, section);
    }, section);

    return () => {
      cleanups.forEach((cleanup) => cleanup());
      ctx.revert();
    };
  }, [reduced]);

  /* --- deep link sync -------------------------------------- */

  useEffect(() => {
    const sync = () => {
      const slug = slugFromHash();
      setCaseSlug(slug);
      if (!slug) setOrigin(null);
    };
    window.addEventListener("hashchange", sync);
    window.addEventListener("popstate", sync);
    return () => {
      window.removeEventListener("hashchange", sync);
      window.removeEventListener("popstate", sync);
    };
  }, []);

  /* --- handlers -------------------------------------------- */

  const openCase = useCallback((slug: string) => {
    setOrigin(rowRefs.current[slug] ?? null);
    setCaseSlug(slug);
    window.history.pushState(null, "", `#work/${slug}`);
  }, []);

  const closeCase = useCallback(() => {
    const slug = caseSlug;
    setCaseSlug(null);
    setOrigin(null);
    window.history.replaceState(null, "", "#work");
    if (slug) rowRefs.current[slug]?.focus({ preventScroll: true });
  }, [caseSlug]);

  const stepCase = useCallback(
    (direction: 1 | -1) => {
      if (!caseSlug) return;
      const index = projects.findIndex((project) => project.slug === caseSlug);
      const next = projects[(index + direction + projects.length) % projects.length];
      setCaseSlug(next.slug);
      window.history.replaceState(null, "", `#work/${next.slug}`);
    },
    [caseSlug],
  );

  const handleRowClick = (index: number) => {
    setActive(index);
    if (narrow) {
      setOpenIndex((current) => (current === index ? -1 : index));
      return;
    }
    openCase(projects[index].slug);
  };

  const activeProject = projects[active];
  const activeLead = layerByKey[activeProject.lead];
  const openProject = caseSlug ? projectBySlug(caseSlug) : undefined;

  return (
    <>
      <section id="work" data-ground="bone" className="section work" ref={sectionRef}>
        <div className="shell">
          <header className="work-head">
            <div className="work-head-top">
              <p className="label work-eyebrow">{work.eyebrow}</p>
              <p className="body work-note">{work.note}</p>
            </div>
            <h2 className="display display-2 work-title">
              {work.title.map((line) => (
                <span className="work-title-line" key={line}>
                  {line}
                </span>
              ))}
            </h2>
          </header>

          <div className="work-stage" ref={stageRef}>
            <div className="work-grid">
              <div className="work-index">
                <ul className="work-list">
                  {projects.map((project, index) => {
                    const lead = layerByKey[project.lead];
                    const isOpen = openIndex === index;

                    return (
                      <li className="work-item" key={project.slug} data-open={isOpen}>
                        <button
                          type="button"
                          className="work-row"
                          data-cursor="view"
                          ref={(node) => {
                            rowRefs.current[project.slug] = node;
                          }}
                          style={leadVars(lead.color)}
                          data-active={active === index}
                          aria-haspopup={narrow ? undefined : "dialog"}
                          aria-expanded={narrow ? isOpen : undefined}
                          aria-controls={narrow ? `work-panel-${project.slug}` : undefined}
                          onClick={() => handleRowClick(index)}
                          onMouseEnter={() => setActive(index)}
                          onFocus={() => setActive(index)}
                        >
                          <span className="work-row-index label tnum" aria-hidden="true">
                            {project.index}
                          </span>
                          <span className="work-row-main">
                            <span className="work-row-title display display-4">
                              {project.title}
                            </span>
                            <span className="work-row-kind label">{project.kind}</span>
                          </span>
                          <span className="work-row-tag">
                            <span className="work-row-dot" aria-hidden="true" />
                            <span className="label label--strong">{lead.label}</span>
                          </span>
                          <span className="work-row-strip">
                            <LayerStrip layers={project.layers} height={4} />
                          </span>
                          <span className="work-row-go" aria-hidden="true">
                            <span className="work-row-go-arrow">→</span>
                            <span className="work-row-go-plus">+</span>
                          </span>
                        </button>

                        <div className="work-panel" id={`work-panel-${project.slug}`}>
                          <div className="work-panel-inner">
                            <div className="work-panel-plate">
                              <ProjectPlate project={project} />
                            </div>
                            <p className="body work-panel-copy">{project.summary}</p>
                            <button
                              type="button"
                              className="btn btn--sm work-panel-cta"
                              onClick={() => openCase(project.slug)}
                            >
                              {work.openLabel}
                              <span className="arrow" aria-hidden="true">
                                →
                              </span>
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
                <p className="label work-hint">{work.hint}</p>
              </div>

              <div className="work-preview">
                <div className="work-preview-inner">
                  <div className="work-preview-frame">
                    <div className="work-plate-stack" ref={stackRef} aria-hidden="true">
                      {projects.map((project, index) => (
                        <div
                          className="work-plate"
                          key={project.slug}
                          style={{
                            clipPath:
                              index === 0 ? "inset(0% 0% 0% 0%)" : "inset(0% 0% 100% 0%)",
                            zIndex: index + 1,
                          }}
                        >
                          <ProjectPlate project={project} />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="work-preview-meta">
                    <span className="label tnum">
                      {activeProject.index} / {COUNT}
                    </span>
                    <span className="work-preview-lead">
                      <span
                        className="work-row-dot"
                        style={{ background: activeLead.color }}
                        aria-hidden="true"
                      />
                      <span className="label">{activeLead.label}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {openProject ? (
        <CaseSheet
          project={openProject}
          origin={origin}
          onClose={closeCase}
          onNext={() => stepCase(1)}
          onPrev={() => stepCase(-1)}
        />
      ) : null}
    </>
  );
}
