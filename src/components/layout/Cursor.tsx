import { useEffect, useRef } from "react";

import { useReducedMotion } from "@/hooks/useReducedMotion";
import { gsap } from "@/lib/gsap";

import "./Cursor.css";

const INTERACTIVE = "a, button, [role='button'], summary, label, select, [data-cursor]";

type CursorMode = "default" | "link" | "label";

/**
 * A difference-blended dot and ring. It marks the pointer, it does not
 * replace it: the native cursor stays, so forms and precise targets keep
 * their default affordance.
 */
export function Cursor() {
  const reduced = useReducedMotion();
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<SVGSVGElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!dot || !ring || !label) return;
    if (reduced) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const ctx = gsap.context(() => {
      let shown = false;
      let mode: CursorMode = "default";

      gsap.set([dot, ring, label], { xPercent: -50, yPercent: -50, autoAlpha: 0 });
      gsap.set(label, { x: window.innerWidth / 2, y: window.innerHeight / 2 });

      const dotX = gsap.quickTo(dot, "x", { duration: 0.1, ease: "power2.out" });
      const dotY = gsap.quickTo(dot, "y", { duration: 0.1, ease: "power2.out" });
      const ringX = gsap.quickTo(ring, "x", { duration: 0.44, ease: "power3.out" });
      const ringY = gsap.quickTo(ring, "y", { duration: 0.44, ease: "power3.out" });
      const labelX = gsap.quickTo(label, "x", { duration: 0.16, ease: "power2.out" });
      const labelY = gsap.quickTo(label, "y", { duration: 0.16, ease: "power2.out" });

      const apply = (next: CursorMode, text = "") => {
        if (next === mode && next !== "label") return;
        mode = next;

        if (next === "label") {
          label.textContent = text;
          gsap.to(ring, { scale: 2.3, duration: 0.34, ease: "power3.out", overwrite: "auto" });
          gsap.to(label, { autoAlpha: 1, duration: 0.18, overwrite: "auto" });
          gsap.to(dot, { autoAlpha: 0, duration: 0.18, overwrite: "auto" });
          return;
        }

        gsap.to(ring, {
          scale: next === "link" ? 1.45 : 1,
          duration: 0.32,
          ease: "power3.out",
          overwrite: "auto",
        });
        gsap.to(label, { autoAlpha: 0, duration: 0.14, overwrite: "auto" });
        gsap.to(dot, { autoAlpha: 1, duration: 0.18, overwrite: "auto" });
      };

      const onMove = (event: PointerEvent) => {
        if (event.pointerType === "touch") return;

        if (!shown) {
          shown = true;
          gsap.set([dot, ring, label], { x: event.clientX, y: event.clientY });
          gsap.to([dot, ring], { autoAlpha: 1, duration: 0.28, overwrite: "auto" });
          gsap.to(label, { autoAlpha: mode === "label" ? 1 : 0, duration: 0.2, overwrite: "auto" });
        }

        dotX(event.clientX);
        dotY(event.clientY);
        ringX(event.clientX);
        ringY(event.clientY);
        labelX(event.clientX);
        labelY(event.clientY);
      };

      const onOver = (event: PointerEvent) => {
        const target = event.target;
        if (!(target instanceof Element)) return;

        const labelled = target.closest<HTMLElement>("[data-cursor]");
        if (labelled) {
          const text = labelled.dataset.cursor?.trim() ?? "";
          if (text) {
            apply("label", text);
            return;
          }
        }

        apply(target.closest(INTERACTIVE) ? "link" : "default");
      };

      const onDown = () => {
        gsap.to(dot, { scale: 0.7, duration: 0.18, ease: "power2.out", overwrite: "auto" });
      };

      const onUp = () => {
        gsap.to(dot, { scale: 1, duration: 0.26, ease: "power2.out", overwrite: "auto" });
      };

      const onLeave = () => {
        shown = false;
        gsap.to([dot, ring, label], { autoAlpha: 0, duration: 0.18, overwrite: "auto" });
      };

      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerover", onOver, { passive: true });
      window.addEventListener("pointerdown", onDown, { passive: true });
      window.addEventListener("pointerup", onUp, { passive: true });
      window.addEventListener("blur", onLeave);
      document.addEventListener("pointerleave", onLeave);

      return () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerover", onOver);
        window.removeEventListener("pointerdown", onDown);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("blur", onLeave);
        document.removeEventListener("pointerleave", onLeave);
      };
    });

    return () => ctx.revert();
  }, [reduced]);

  return (
    <div className="cursor" aria-hidden="true">
      <div className="cursor-dot" ref={dotRef} />
      <svg className="cursor-ring" ref={ringRef} viewBox="0 0 64 64" focusable="false">
        <circle className="cursor-ring-line" cx="32" cy="32" r="13.5" />
      </svg>
      <span className="cursor-label" ref={labelRef} />
    </div>
  );
}
