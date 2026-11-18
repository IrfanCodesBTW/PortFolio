import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

import { systems } from "@/data/content";
import { projects } from "@/data/projects";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { gsap } from "@/lib/gsap";
import { LAYERS } from "@/lib/layers";

import "./Anatomy.css";

/* ------------------------------------------------------------------
   Geometry. One isometric plate, drawn once in user units and repeated
   four times; the stack opens by translating each plate vertically.
   ------------------------------------------------------------------ */

const ISO_X = Math.cos(Math.PI / 6);
const PLATE = { w: 266, d: 80, cx: 200, skirt: 12 };
const VIEW = { w: 900, h: 520 };
/** Plate centre Y once the stack is open. */
const OPEN_Y = [110, 210, 310, 410];
/** Plate centre Y while the stack is closed. */
const SHUT_Y = [245, 255, 265, 275];
/** The right vertex of every plate, where its leader starts. */
const LEADER_X = 350;

const round = (value: number) => Math.round(value * 100) / 100;

function plateGeometry(cy: number) {
  const aw = PLATE.w * ISO_X;
  const ad = PLATE.d * ISO_X;
  const ox = PLATE.cx - (aw + ad) / 2;
  const oy = cy - (PLATE.w - PLATE.d) / 4;

  const p0 = [ox, oy] as const;
  const p1 = [ox + aw, oy + PLATE.w / 2] as const;
  const p2 = [ox + aw + ad, oy + (PLATE.w - PLATE.d) / 2] as const;
  const p3 = [ox + ad, oy - PLATE.d / 2] as const;

  const at = (x: number, y: number) => `${round(x)} ${round(y)}`;
  const face = `M${at(p0[0], p0[1])}L${at(p1[0], p1[1])}L${at(p2[0], p2[1])}L${at(p3[0], p3[1])}Z`;
  const skirt =
    `M${at(p0[0], p0[1])}L${at(p1[0], p1[1])}L${at(p2[0], p2[1])}` +
    `L${at(p2[0], p2[1] + PLATE.skirt)}L${at(p1[0], p1[1] + PLATE.skirt)}` +
    `L${at(p0[0], p0[1] + PLATE.skirt)}Z`;
  const leader = `M${LEADER_X} ${round(p2[1])}H372V${round(cy)}H398`;

  return { face, skirt, leader };
}

const PLATES = OPEN_Y.map((cy) => plateGeometry(cy));
const NARROW_VIEWBOX = "38 16 324 500";

/* ------------------------------------------------------------------ */

function useNarrow() {
  const [narrow, setNarrow] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 899px)").matches,
  );

  useEffect(() => {
    const query = window.matchMedia("(max-width: 899px)");
    const handle = () => setNarrow(query.matches);
    query.addEventListener("change", handle);
    return () => query.removeEventListener("change", handle);
  }, []);

  return narrow;
}

/**
 * Anatomy of a build.
 *
 * Above 900 px — and only when motion is allowed — the stage is pinned for
 * 3200 px and scrubbed: the stack separates, the leaders draw, the captions
 * land one per plate, and the last third resolves into one real call path
 * (Vaani). Every state it passes through is also the state it ends in, so
 * the figure reads without a single frame of animation.
 */
export function Anatomy() {
  const reduced = useReducedMotion();
  const narrow = useNarrow();
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const vaani = projects.find((project) => project.slug === "vaani");

  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    if (!root || !stage) return;

    const q = gsap.utils.selector(root);
    const mm = gsap.matchMedia();

    const ctx = gsap.context(() => {
      /* --- pinned, scrubbed anatomy ---------------------------------- */
      mm.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
        const plates = q<SVGGElement>(".anat-plate");
        const captions = q<HTMLElement>(".anat-cap-inner");
        const leaders = q<SVGPathElement>(".anat-leader");
        const frame = q<SVGPathElement>(".anat-flow-frame-line");
        const nodes = q<HTMLElement>(".anat-node");
        const links = q<SVGPathElement>(".anat-link-path");
        const heads = q<SVGPathElement>(".anat-link-head");
        const handoff = q<HTMLElement>(".anat-handoff");
        const note = q<HTMLElement>(".anat-flow-note");
        const progress = q<HTMLElement>(".anat-progress-fill");

        /* Resting (CSS) state is the finished figure. The split happens here,
           before the pin exists, so nothing is ever seen mid-setup. */
        plates.forEach((plate, index) => {
          gsap.set(plate, { y: SHUT_Y[index] - OPEN_Y[index] });
        });
        gsap.set(captions, { opacity: 0, y: 12 });
        gsap.set(leaders, { strokeDashoffset: 1 });
        gsap.set(frame, { strokeDashoffset: 1 });
        gsap.set(nodes, { opacity: 0, y: 10 });
        gsap.set(links, { strokeDashoffset: 1 });
        gsap.set(heads, { opacity: 0 });
        gsap.set(handoff, { opacity: 0 });
        gsap.set(note, { opacity: 0 });
        gsap.set(progress, { scaleX: 0, transformOrigin: "left center" });

        const stageElement = stage;
        stageElement.dataset.stage = "1";

        const timeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: stageElement,
            start: "top top",
            end: "+=2400",
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            onUpdate: (self) => {
              const next = self.progress < 0.34 ? "1" : self.progress < 0.68 ? "2" : "3";
              if (stageElement.dataset.stage !== next) stageElement.dataset.stage = next;
            },
          },
        });

        timeline.to(progress, { scaleX: 1, duration: 10 }, 0);

        /* 0.0 – 3.1 — the stack opens; every plate leaves its edge behind */
        plates.forEach((plate, index) => {
          timeline.to(plate, { y: 0, duration: 2.8, ease: "power2.inOut" }, index * 0.1);
        });

        /* 3.1 – 6.5 — one leader, one caption, one plate lit, per layer */
        timeline.to(plates, { opacity: 0.45, duration: 0.5 }, 3.1);

        LAYERS.forEach((_layer, index) => {
          const start = 3.45 + index * 0.72;
          timeline.to(leaders[index], { strokeDashoffset: 0, duration: 0.45 }, start);
          timeline.to(
            plates[index],
            { opacity: 1, duration: 0.55 },
            start + 0.3,
          );
          timeline.to(captions[index], { opacity: 1, y: 0, duration: 0.55 }, start + 0.32);
        });

        /* 6.9 – 9.0 — one build, resolved into its call path */
        timeline.to(frame, { strokeDashoffset: 0, duration: 0.8 }, 6.9);
        nodes.forEach((node, index) => {
          timeline.to(node, { opacity: 1, y: 0, duration: 0.5 }, 7.15 + index * 0.22);
        });
        links.forEach((link, index) => {
          timeline.to(link, { strokeDashoffset: 0, duration: 0.35 }, 7.3 + index * 0.22);
          timeline.to(heads[index], { opacity: 1, duration: 0.2 }, 7.52 + index * 0.22);
        });
        timeline.to(handoff, { opacity: 1, duration: 0.5 }, 8.05);
        timeline.to(note, { opacity: 1, duration: 0.5 }, 8.15);

        /* the final frame holds */
        timeline.to({}, { duration: 1 }, 9);

        return () => {
          delete stageElement.dataset.stage;
        };
      });

      /* --- the same figure, stacked, below 900 px -------------------- */
      mm.add("(max-width: 899px) and (prefers-reduced-motion: no-preference)", () => {
        const canvas = q<HTMLElement>(".anat-canvas")[0];
        const flow = q<HTMLElement>(".anat-flow")[0];
        const captions = q<HTMLElement>(".anat-cap");

        gsap.from([canvas, flow].filter((el): el is HTMLElement => Boolean(el)), {
          opacity: 0,
          y: 16,
          duration: 0.6,
          ease: "expo.out",
          stagger: 0.08,
          scrollTrigger: { trigger: root, start: "top 78%", once: true },
        });

        gsap.from(captions, {
          opacity: 0,
          y: 10,
          duration: 0.5,
          ease: "expo.out",
          stagger: 0.06,
          delay: 0.15,
          scrollTrigger: { trigger: canvas ?? root, start: "top 62%", once: true },
        });

        // no custom teardown: matchMedia reverts these tweens on a breakpoint cross
        return undefined;
      });
    }, root);

    return () => {
      mm.revert();
      ctx.revert();
    };
  }, []);

  const captionStyle = (index: number) =>
    ({ "--anat-y": `${round((OPEN_Y[index] / VIEW.h) * 100)}%` }) as CSSProperties;

  return (
    <section className="anat-root" aria-labelledby="anat-title" ref={rootRef}>
      <header className="anat-head">
        <p className="label tnum anat-fig">Fig. 01</p>
        <h3 className="display display-3 anat-title" id="anat-title">
          {systems.anatomyTitle}
        </h3>
        {reduced ? null : <p className="label anat-hint">{systems.anatomyIntro}</p>}
      </header>

      <div className="anat-stage" ref={stageRef}>
        <div className="anat-figure">
          <div className="anat-canvas">
            <svg
              className="anat-svg"
              viewBox={narrow ? NARROW_VIEWBOX : `0 0 ${VIEW.w} ${VIEW.h}`}
              preserveAspectRatio="xMidYMid meet"
              aria-hidden="true"
              focusable="false"
            >
              <g className="anat-leaders">
                {PLATES.map((geometry, index) => (
                  <path
                    className="anat-leader"
                    key={`leader-${LAYERS[index].key}`}
                    d={geometry.leader}
                    pathLength={1}
                    strokeDasharray={1}
                  />
                ))}
              </g>

              {LAYERS.map((layer, index) => {
                const geometry = PLATES[index];
                return (
                  <g
                    className="anat-plate"
                    key={layer.key}
                    data-layer={layer.key}
                    style={{ "--layer": layer.color } as CSSProperties}
                  >
                    <path className="anat-plate-skirt" d={geometry.skirt} />
                    <path className="anat-plate-shade" d={geometry.skirt} />
                    <path className="anat-plate-face" d={geometry.face} />
                    <path className="anat-plate-edge" d={geometry.face} />
                  </g>
                );
              })}
            </svg>

            <ol className="anat-caps">
              {LAYERS.map((layer, index) => (
                <li className="anat-cap" key={layer.key} style={captionStyle(index)}>
                  <div className="anat-cap-inner">
                    <p className="label tnum anat-cap-index">{`0${index + 1}`}</p>
                    <p className="anat-cap-name">{layer.label}</p>
                    <p className="anat-cap-blurb">{layer.blurb.split(":")[0]}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="anat-flow">
            <svg
              className="anat-flow-frame"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
              focusable="false"
            >
              <path
                className="anat-flow-frame-line"
                d="M0 0H100V100H0Z"
                pathLength={1}
                strokeDasharray={1}
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            <div className="anat-flow-head">
              <p className="label tnum">Fig. 01.3</p>
              <p className="label label--strong anat-flow-title">
                {vaani ? vaani.title : "Vaani"} — call path
              </p>
            </div>

            <p className="sr-only">
              One call path: speech to text, then the language model, then text to speech. Outbound
              calls are guarded through Dograh.
            </p>

            <div className="anat-chain" aria-hidden="true">
              <div className="anat-node">
                <span className="label anat-node-tag">STT</span>
                <span className="anat-node-name">Transcript</span>
              </div>

              <div className="anat-link">
                <svg viewBox="0 0 48 8" preserveAspectRatio="none" focusable="false">
                  <path className="anat-link-path" d="M0 4H44" pathLength={1} strokeDasharray={1} />
                  <path className="anat-link-head" d="M37 1L44 4L37 7" />
                </svg>
              </div>

              <div className="anat-node">
                <span className="label anat-node-tag">LLM</span>
                <span className="anat-node-name">Response</span>
              </div>

              <div className="anat-link">
                <svg viewBox="0 0 48 8" preserveAspectRatio="none" focusable="false">
                  <path className="anat-link-path" d="M0 4H44" pathLength={1} strokeDasharray={1} />
                  <path className="anat-link-head" d="M37 1L44 4L37 7" />
                </svg>
              </div>

              <div className="anat-node">
                <span className="label anat-node-tag">TTS</span>
                <span className="anat-node-name">Voice</span>
              </div>

              <p className="anat-handoff">
                <span className="anat-handoff-key">Dograh</span>
                <span className="anat-handoff-sep">/</span>
                <span className="anat-handoff-rest">Guarded call</span>
              </p>
            </div>

            <p className="anat-flow-note">{vaani ? vaani.approach : null}</p>
          </div>

          <div className="anat-readout" aria-hidden="true">
            <p className="label tnum anat-step" data-step="1">
              01 Separate
            </p>
            <p className="label tnum anat-step" data-step="2">
              02 Label
            </p>
            <p className="label tnum anat-step" data-step="3">
              03 Resolve
            </p>
            <span className="anat-progress">
              <span className="anat-progress-fill" />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
