import Lenis from "lenis";
import { gsap, ScrollTrigger } from "./gsap";

let lenis: Lenis | null = null;
let ticker: ((time: number) => void) | null = null;

export function initSmoothScroll(): Lenis | null {
  if (lenis) return lenis;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return null;

  lenis = new Lenis({
    lerp: 0.09,
    wheelMultiplier: 1,
    touchMultiplier: 1.2,
    smoothWheel: true,
  });

  lenis.on("scroll", ScrollTrigger.update);

  ticker = (time: number) => {
    lenis?.raf(time * 1000);
  };

  gsap.ticker.add(ticker);
  gsap.ticker.lagSmoothing(0);

  return lenis;
}

export function destroySmoothScroll() {
  if (ticker) gsap.ticker.remove(ticker);
  ticker = null;
  lenis?.destroy();
  lenis = null;
}

export function getLenis() {
  return lenis;
}

/** Scroll to an element id ("work") or an absolute pixel value. */
export function scrollToTarget(target: string | number, offset = 0) {
  const value = typeof target === "number" ? target : `#${target.replace(/^#/, "")}`;
  if (lenis) {
    lenis.scrollTo(value, { offset, duration: 1.1 });
    return;
  }
  if (typeof target === "string") {
    document.getElementById(target.replace(/^#/, ""))?.scrollIntoView({ behavior: "smooth" });
  } else {
    window.scrollTo({ top: target + offset, behavior: "smooth" });
  }
}

export function stopScroll() {
  lenis?.stop();
  if (!lenis) document.documentElement.style.overflow = "hidden";
}

export function startScroll() {
  lenis?.start();
  document.documentElement.style.overflow = "";
}
