export type LayerKey = "interface" | "application" | "data" | "intelligence";

export type Ground = "bone" | "ink" | "cobalt" | "acid" | "vermilion";

export interface Project {
  slug: string;
  index: string;
  title: string;
  kind: string;
  summary: string;
  challenge: string;
  approach: string;
  boundary: string;
  stack: string[];
  layers: Record<LayerKey, number>;
  lead: LayerKey;
  links?: { label: string; href: string }[];
}

export interface Capability {
  index: string;
  title: string;
  body: string;
  deliverables: string[];
  evidence: string[];
  layer: LayerKey;
}

export interface TraceScenario {
  id: string;
  tab: string;
  project: string;
  summary: string;
  layers: Record<LayerKey, string>;
}

export interface ProcessStep {
  index: string;
  title: string;
  summary: string;
  detail: string;
}

export interface Fact {
  key: string;
  value: string;
}
