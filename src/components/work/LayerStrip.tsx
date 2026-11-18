import { useEffect, useRef } from "react";

import { gsap } from "@/lib/gsap";
import { LAYERS } from "@/lib/layers";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { LayerKey } from "@/data/types";

import "./LayerStrip.css";

interface LayerStripProps {
  layers: Record<LayerKey, number>;
  height?: number;
}

/**
 * Four proportional segments in layer colours. The widths are the authored
 * composition from the project data, never an even split.
 */
export function LayerStrip({ layers, height = 4 }: LayerStripProps) {
  const stripRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip || reduced) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".strip-seg",
        { scaleX: 0 },
        { scaleX: 1, duration: 0.9, ease: "expoOut", stagger: 0.05 },
      );
    }, strip);

    return () => ctx.revert();
  }, [reduced]);

  const sum = LAYERS.reduce((total, layer) => total + layers[layer.key], 0);
  const denominator = sum > 0 ? sum : 1;

  const label = `Domain balance — ${LAYERS.map(
    (layer) => `${layer.label} ${layers[layer.key]}%`,
  ).join(", ")}`;

  return (
    <div
      ref={stripRef}
      className="strip"
      role="img"
      aria-label={label}
      style={{ height }}
    >
      {LAYERS.map((layer) => {
        const value = layers[layer.key];
        if (value <= 0) return null;

        return (
          <span
            key={layer.key}
            className="strip-seg"
            style={{
              width: `${(value / denominator) * 100}%`,
              background: layer.color,
            }}
          />
        );
      })}
    </div>
  );
}
