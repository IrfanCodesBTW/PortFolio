import { memo } from "react";

import { LAYERS, layerByKey } from "@/lib/layers";
import { projects } from "@/data/projects";
import type { Project } from "@/data/types";

import "./ProjectPlate.css";

const W = 800;
const H = 1000;
const PAD = 44;
const INNER = W - PAD * 2;
const BAR_Y = 898;
const BAR_H = 12;
const GRID_COLUMNS = [1, 2, 3, 4, 5, 6, 7];
const GRID_ROWS = [1, 2, 3, 4, 5, 6, 7];

const pad2 = (value: number) => String(value).padStart(2, "0");

interface ProjectPlateProps {
  project: Project;
}

/**
 * A code-drawn poster: hairline grid, oversized index, title, kind and the
 * project's proportional layer bar. Deterministic from project data.
 */
export const ProjectPlate = memo(function ProjectPlate({ project }: ProjectPlateProps) {
  const total = pad2(projects.length);
  const lead = layerByKey[project.lead];
  const sum = LAYERS.reduce((acc, layer) => acc + project.layers[layer.key], 0) || 1;
  const titleSize = Math.min(88, Math.floor(INNER / (project.title.length * 0.6)));

  let cursor = PAD;
  const segments = LAYERS.map((layer) => {
    const value = project.layers[layer.key];
    const width = (value / sum) * INNER;
    const x = cursor;
    cursor += width;
    return { key: layer.key, x, width, color: layer.color };
  }).filter((segment) => segment.width > 0);

  return (
    <svg
      className="plate-svg"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`${project.title} — ${project.kind}. ${lead.label} layer leads at ${project.layers[project.lead]} percent.`}
    >
      <rect className="plate-surface" x="0.5" y="0.5" width={W - 1} height={H - 1} />

      <g className="plate-grid" aria-hidden="true">
        {GRID_COLUMNS.map((i) => (
          <line key={`v${i}`} x1={i * 100} y1="0" x2={i * 100} y2={H} />
        ))}
        {GRID_ROWS.map((i) => (
          <line key={`h${i}`} x1="0" y1={i * 125} x2={W} y2={i * 125} />
        ))}
      </g>

      <g aria-hidden="true">
        <text className="plate-mono" x={PAD} y="64">
          {project.index} / {total}
        </text>
        <text className="plate-mono" x={W - PAD} y="64" textAnchor="end">
          FOUR DOMAINS
        </text>
      </g>

      <text className="plate-index" x={PAD - 6} y="700" aria-hidden="true">
        {project.index}
      </text>

      <g aria-hidden="true">
        <rect x={PAD} y="766" width="11" height="11" fill={lead.color} />
        <text className="plate-mono plate-mono--strong" x={PAD + 24} y="777">
          LEAD — {lead.label} {project.layers[project.lead]}%
        </text>
      </g>

      <text
        className="plate-title"
        x={PAD - 4}
        y="862"
        fontSize={titleSize}
        aria-hidden="true"
      >
        {project.title}
      </text>

      <g className="plate-bar" aria-hidden="true">
        {segments.map((segment) => (
          <rect
            key={segment.key}
            x={segment.x}
            y={BAR_Y}
            width={segment.width}
            height={BAR_H}
            fill={segment.color}
          />
        ))}
      </g>

      <g aria-hidden="true">
        <text className="plate-mono plate-mono--foot" x={PAD} y="952">
          {project.kind.toUpperCase()}
        </text>
        <text
          className="plate-mono plate-mono--foot"
          x={W - PAD}
          y="952"
          textAnchor="end"
        >
          {pad2(project.stack.length)} TOOLS
        </text>
      </g>
    </svg>
  );
});
