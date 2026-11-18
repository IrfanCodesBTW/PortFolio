import { useEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent } from "react";

import { dial } from "@/data/content";
import { pad2 } from "@/lib/format";
import { gsap } from "@/lib/gsap";
import { LAYERS } from "@/lib/layers";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { LayerKey } from "@/data/types";

import "./SystemDial.css";

const SIZE = 400;
const CENTER = SIZE / 2;
const ARC_INNER = 138;
const ARC_OUTER = 164;

const TICKS = Array.from({ length: 72 }, (_, index) => index * 5);

/** d3-style angle: 0 = 12 o'clock, clockwise. */
const quadrantAt = (degrees: number) => Math.floor((degrees % 360) / 90);

const arcPath = (index: number) => {
  const start = (index * 90 + 5) * (Math.PI / 180);
  const end = ((index + 1) * 90 - 5) * (Math.PI / 180);
  const point = (radius: number, angle: number) => {
    const x = CENTER + radius * Math.sin(angle);
    const y = CENTER - radius * Math.cos(angle);
    return `${x.toFixed(2)} ${y.toFixed(2)}`;
  };
  const large = end - start > Math.PI ? 1 : 0;
  return [
    `M ${point(ARC_OUTER, start)}`,
    `A ${ARC_OUTER} ${ARC_OUTER} 0 ${large} 1 ${point(ARC_OUTER, end)}`,
    `L ${point(ARC_INNER, end)}`,
    `A ${ARC_INNER} ${ARC_INNER} 0 ${large} 0 ${point(ARC_INNER, start)}`,
    "Z",
  ].join(" ");
};

export function SystemDial() {
  const reduced = useReducedMotion();
  const [active, setActive] = useState<LayerKey | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const needleRef = useRef<SVGGElement>(null);
  const rotateRef = useRef<((value: number) => void) | null>(null);

  useEffect(() => {
    if (reduced) return;
    const needle = needleRef.current;
    if (!needle) return;
    const ctx = gsap.context(() => {
      gsap.set(needle, { svgOrigin: `${CENTER} ${CENTER}` });
      rotateRef.current = gsap.quickTo(needle, "rotation", {
        duration: 0.55,
        ease: "power3.out",
      });
    });
    return () => {
      rotateRef.current = null;
      ctx.revert();
    };
  }, [reduced]);

  const selectIndex = (index: number) => {
    setActive(LAYERS[index].key);
    rotateRef.current?.(index * 90 + 45);
  };

  const handlePointer = (event: PointerEvent<HTMLDivElement>) => {
    if (reduced || event.pointerType !== "mouse") return;
    const stage = stageRef.current;
    if (!stage) return;

    const rect = stage.getBoundingClientRect();
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    const degrees = ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360;

    rotateRef.current?.(degrees);
    setActive(LAYERS[quadrantAt(degrees)].key);
  };

  const activeLayer = active ? LAYERS.find((layer) => layer.key === active) : null;
  const activeDomain = active ? dial.domains.find((domain) => domain.key === active) : null;

  return (
    <div className="dial" aria-label="The four domains of a build">
      <div
        className="dial-stage"
        ref={stageRef}
        onPointerMove={handlePointer}
      >
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="dial-svg"
          focusable="false"
          aria-hidden="true"
        >
          <g className="dial-ticks" style={{ transformOrigin: `${CENTER}px ${CENTER}px` }}>
            {TICKS.map((angle) => (
              <line
                key={angle}
                x1={CENTER}
                y1={16}
                x2={CENTER}
                y2={angle % 30 === 0 ? 28 : 22}
                transform={`rotate(${angle} ${CENTER} ${CENTER})`}
                className={angle % 30 === 0 ? "dial-tick dial-tick--major" : "dial-tick"}
              />
            ))}
          </g>

          <circle cx={CENTER} cy={CENTER} r={182} className="dial-circle" />
          <circle cx={CENTER} cy={CENTER} r={124} className="dial-circle dial-circle--inner" />

          {LAYERS.map((layer, index) => (
            <path
              key={layer.key}
              d={arcPath(index)}
              className="dial-arc"
              data-active={active === layer.key}
              style={{ fill: layer.color, stroke: layer.color }}
            />
          ))}

          <text x={CENTER} y={30} className="dial-coord" textAnchor="middle">
            00
          </text>
          <text x={386} y={CENTER + 3} className="dial-coord" textAnchor="end">
            90
          </text>
          <text x={CENTER} y={384} className="dial-coord" textAnchor="middle">
            180
          </text>
          <text x={14} y={CENTER + 3} className="dial-coord">
            270
          </text>

          <g
            ref={needleRef}
            className="dial-needle"
          >
            <line x1={CENTER} y1={CENTER} x2={CENTER} y2={CENTER - 120} />
            <circle cx={CENTER} cy={CENTER - 120} r={3.5} className="dial-needle-tip" />
          </g>

          <circle cx={CENTER} cy={CENTER} r={3} className="dial-pin" />
        </svg>

        <div className="dial-center" aria-live="polite">
          <span className="display dial-index tnum">
            {activeLayer ? pad2(LAYERS.findIndex((layer) => layer.key === active) + 1) : "04"}
          </span>
          <span className="dial-name">{activeLayer ? activeLayer.label : "Four domains"}</span>
          <span className="dial-line">
            {activeDomain ? activeDomain.line : "One system, four responsibilities."}
          </span>
          {activeDomain ? <span className="label dial-project">{activeDomain.project}</span> : null}
        </div>
      </div>

      <div className="dial-controls" role="group" aria-label="Explore the four domains">
        {LAYERS.map((layer, index) => {
          const domain = dial.domains.find((item) => item.key === layer.key);
          const selected = active === layer.key;

          return (
            <button
              key={layer.key}
              type="button"
              className="dial-control"
              aria-pressed={selected}
              style={{ "--dial-color": layer.color } as CSSProperties}
              onClick={() => selectIndex(index)}
              onMouseEnter={() => selectIndex(index)}
              onFocus={() => selectIndex(index)}
            >
              <span className="dial-control-top">
                <span className="dial-dot" aria-hidden="true" />
                <span className="label tnum">{pad2(index + 1)}</span>
              </span>
              <span className="dial-control-name">{layer.label}</span>
              <span className="label dial-control-project">{domain?.project}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
