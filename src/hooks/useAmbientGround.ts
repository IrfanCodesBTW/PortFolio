import { useEffect } from "react";
import { ScrollTrigger } from "@/lib/gsap";

const GROUNDS = ["bone", "ink", "cobalt", "acid", "vermilion"] as const;

/**
 * One canvas, many grounds. Each [data-ground] section tells the page what
 * temperature it should be. We resolve the active section from its position
 * against the viewport middle on every scroll update rather than relying on
 * enter/leave callbacks, so jumps, pins and restored scroll can never desync
 * the ground from what is actually on screen.
 */
export function useAmbientGround(enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("main [data-ground], footer[data-ground]"),
    ).filter((section) =>
      GROUNDS.includes(section.dataset.ground as (typeof GROUNDS)[number]),
    );

    if (sections.length === 0) return;

    let current = "";

    const apply = () => {
      const middle = window.innerHeight * 0.5;
      let ground = sections[0].dataset.ground ?? "bone";

      for (const section of sections) {
        if (section.getBoundingClientRect().top <= middle) {
          ground = section.dataset.ground ?? ground;
        }
      }

      if (ground !== current) {
        current = ground;
        document.documentElement.dataset.ground = ground;
      }
    };

    const trigger = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: apply,
      onRefresh: apply,
    });

    apply();

    return () => {
      trigger.kill();
      delete document.documentElement.dataset.ground;
    };
  }, [enabled]);
}
