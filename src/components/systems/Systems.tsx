import { systems } from "@/data/content";
import { projects } from "@/data/projects";
import { pad2 } from "@/lib/format";
import { LAYERS } from "@/lib/layers";

import { Anatomy } from "./Anatomy";
import { Composition } from "./Composition";
import { Matrix } from "./Matrix";

import "./Systems.css";

/**
 * 03 — Systems. The cobalt chapter.
 *
 * One idea, three figures: what a build is made of (anatomy), how the balance
 * moves between builds (composition), and which build used which tool (matrix).
 * The ground is the application layer's own colour, so every other layer has to
 * earn its place on the field.
 */
export function Systems() {
  return (
    <section id="systems" data-ground="cobalt" className="section sys-root">
      <div className="shell">
        <header className="sys-head">
          <div className="sys-meta">
            <p className="label label--strong">{systems.eyebrow}</p>
            <p className="label tnum sys-meta-count">
              {pad2(LAYERS.length)} domains · {pad2(projects.length)} builds
            </p>
          </div>

          <h2 className="display display-2 sys-title">
            {systems.title.map((line) => (
              <span className="sys-title-line" key={line}>
                {line}
              </span>
            ))}
          </h2>

          <p className="body sys-intro">{systems.intro}</p>
        </header>

        <Anatomy />
        <Composition />
        <Matrix />
      </div>
    </section>
  );
}
