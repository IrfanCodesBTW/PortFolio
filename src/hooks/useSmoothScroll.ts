import { useEffect } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import { destroySmoothScroll, initSmoothScroll } from "@/lib/scroll";

/** Wires Lenis once, refreshes ScrollTrigger when fonts settle. */
export function useSmoothScroll(enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    initSmoothScroll();
    document.fonts.ready.then(() => ScrollTrigger.refresh()).catch(() => undefined);

    return () => {
      destroySmoothScroll();
    };
  }, [enabled]);
}
