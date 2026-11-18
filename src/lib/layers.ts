import type { LayerKey } from "@/data/types";

export interface LayerMeta {
  key: LayerKey;
  label: string;
  color: string;
  blurb: string;
}

export const LAYERS: LayerMeta[] = [
  {
    key: "interface",
    label: "Experience",
    color: "var(--interface)",
    blurb: "What a person touches: layout, type, motion, states.",
  },
  {
    key: "application",
    label: "Application",
    color: "var(--application)",
    blurb: "What makes it work: routing, auth, jobs, real-time.",
  },
  {
    key: "data",
    label: "Data",
    color: "var(--data)",
    blurb: "What it remembers: schema, queries, the durable record.",
  },
  {
    key: "intelligence",
    label: "Intelligence",
    color: "var(--intelligence)",
    blurb: "What it infers: models, adapters, guardrails.",
  },
];

export const layerByKey = Object.fromEntries(
  LAYERS.map((layer) => [layer.key, layer]),
) as Record<LayerKey, LayerMeta>;
