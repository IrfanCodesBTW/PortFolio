import { useEffect, useRef, useState } from "react";

import { gsap, ScrollTrigger } from "@/lib/gsap";
import { LAYERS } from "@/lib/layers";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { about, site } from "@/data/content";

import "./About.css";

/**
 * A halftone field: dots are small at the centre so the monogram sits in clean
 * ground, and grow toward the frame edge where the eye expects weight.
 */
const HALFTONE_DOTS = (() => {
  const dots: { cx: number; cy: number; r: number }[] = [];
  const columns = 24;
  const rows = 30;
  const pitch = 16;

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const cx = 8 + column * pitch + (row % 2 === 0 ? 0 : pitch / 2);
      const cy = 8 + row * pitch;
      const nx = (cx - 200) / 200;
      const ny = (cy - 250) / 250;
      const distance = Math.min(1, Math.sqrt(nx * nx * 0.85 + ny * ny * 0.7));
      dots.push({ cx, cy, r: 0.65 + Math.pow(distance, 1.7) * 3 });
    }
  }

  return dots;
})();

function MonogramPlate() {
  return (
    <svg
      className="about-fallback"
      viewBox="0 0 400 500"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={`Halftone monogram plate for ${site.name}`}
    >
      <rect width="400" height="500" className="about-fallback-bg" />
      <g className="about-halftone-dots" aria-hidden="true">
        {HALFTONE_DOTS.map((dot, index) => (
          <circle key={index} cx={dot.cx} cy={dot.cy} r={dot.r} />
        ))}
      </g>
      <text x="40" y="50" className="about-plate-label" fontSize="10" letterSpacing="2.2">
        {site.name.toUpperCase()}
      </text>
      <text
        x="360"
        y="50"
        className="about-plate-label"
        fontSize="10"
        letterSpacing="2.2"
        textAnchor="end"
      >
        01
      </text>
      <text
        x="200"
        y="254"
        className="about-monogram"
        fontSize="150"
        letterSpacing="-7"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        SIB
      </text>
      <line x1="40" y1="424" x2="360" y2="424" className="about-plate-rule" />
      <text x="40" y="450" className="about-plate-label" fontSize="10" letterSpacing="2">
        {site.role.toUpperCase()}
      </text>
      <text
        x="360"
        y="450"
        className="about-plate-label"
        fontSize="10"
        letterSpacing="2"
        textAnchor="end"
      >
        {site.location.toUpperCase()}
      </text>
    </svg>
  );
}

export function About() {
  const root = useRef<HTMLElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const tickerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [hasPortrait, setHasPortrait] = useState(true);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      if (reduced) return;

      gsap.from(".about-title .line", {
        yPercent: 130,
        duration: 1.1,
        ease: "expo.out",
        stagger: 0.08,
        scrollTrigger: { trigger: el, start: "top 70%", once: true },
      });

      gsap.from(".about-meta", {
        y: 14,
        opacity: 0,
        duration: 0.8,
        ease: "expo.out",
        stagger: 0.06,
        scrollTrigger: { trigger: el, start: "top 70%", once: true },
      });

      const facts = el.querySelector<HTMLElement>(".about-facts") ?? el;

      gsap.from(".about-fact", {
        y: 14,
        opacity: 0,
        duration: 0.7,
        ease: "expo.out",
        stagger: 0.07,
        scrollTrigger: { trigger: facts, start: "top 88%", once: true },
      });

      const plate = plateRef.current;
      const media = mediaRef.current;
      if (plate && media) {
        gsap.fromTo(
          media,
          { yPercent: -6 },
          {
            yPercent: 6,
            ease: "none",
            scrollTrigger: {
              trigger: plate,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          },
        );
      }
    }, el);

    return () => ctx.revert();
  }, [reduced]);

  /* Tools ticker: one loop, reversed when the page scrolls back up. */
  useEffect(() => {
    const ticker = tickerRef.current;
    const track = trackRef.current;
    if (!ticker || !track || reduced) return;

    let tween: gsap.core.Tween | undefined;

    const ctx = gsap.context(() => {
      tween = gsap.to(track, {
        xPercent: -50,
        duration: 28,
        ease: "none",
        repeat: -1,
      });

      ScrollTrigger.create({
        trigger: ticker,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          if (tween) tween.timeScale(self.direction === -1 ? -1 : 1);
        },
      });
    }, track);

    const pause = () => tween?.pause();
    const resume = () => tween?.play();

    ticker.addEventListener("pointerenter", pause);
    ticker.addEventListener("pointerleave", resume);

    return () => {
      ticker.removeEventListener("pointerenter", pause);
      ticker.removeEventListener("pointerleave", resume);
      ctx.revert();
    };
  }, [reduced]);

  return (
    <section ref={root} id="about" data-ground="bone" className="section about">
      <div className="shell">
        <div className="grid12 about-grid">
          <figure className={`about-plate${hasPortrait ? " about-plate--image" : ""}`}>
            <div className="about-plate-frame" ref={plateRef}>
              <div className="about-plate-media" ref={mediaRef}>
                {hasPortrait ? (
                  <img
                    className="about-portrait"
                    src="/portrait.jpg"
                    srcSet="/portrait-500.jpg 500w, /portrait-800.jpg 800w, /portrait.jpg 1000w"
                    sizes="(max-width: 900px) 100vw, 420px"
                    alt={`Portrait of ${site.name}`}
                    width={1000}
                    height={1250}
                    loading="lazy"
                    decoding="async"
                    onError={() => setHasPortrait(false)}
                  />
                ) : (
                  <MonogramPlate />
                )}
              </div>
              {hasPortrait ? (
                <>
                  <span className="about-plate-tone" aria-hidden="true" />
                  <svg className="about-plate-halftone" aria-hidden="true">
                    <defs>
                      <pattern
                        id="about-halftone"
                        width="5"
                        height="5"
                        patternUnits="userSpaceOnUse"
                      >
                        <circle cx="1.4" cy="1.4" r="0.95" fill="currentColor" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#about-halftone)" />
                  </svg>
                </>
              ) : null}
            </div>
            <figcaption className="about-plate-cap about-meta">
              <span className="label">Portrait</span>
              <span className="label">
                {site.location} — {site.timezoneLabel}
              </span>
            </figcaption>
          </figure>

          <div className="about-content">
            <p className="label label--strong about-eyebrow about-meta">{about.eyebrow}</p>
            <h2 className="display display-3 about-title">
              {about.title.map((line) => (
                <span className="mask" key={line}>
                  <span className="line">{line}</span>
                </span>
              ))}
            </h2>
            <p className="body about-copy about-meta">{about.body}</p>

            <dl className="about-facts">
              {about.facts.map((fact) => (
                <div className="about-fact" key={fact.key}>
                  <dt className="label">{fact.key}</dt>
                  <dd className="about-fact-value display display-4 tnum">{fact.value}</dd>
                </div>
              ))}
            </dl>

            <p className="about-note serif-italic about-meta">{about.note}</p>
          </div>
        </div>
      </div>

      <div className="about-ticker" ref={tickerRef} role="group" aria-label="Tools and technologies">
        <div className="about-ticker-track" ref={trackRef}>
          {[0, 1].map((copy) => (
            <div className="about-ticker-group" key={copy} aria-hidden={copy === 1}>
              {about.tools.map((tool, index) => (
                <span className="about-tool" key={`${copy}-${tool}`}>
                  <span
                    className="about-tool-dot"
                    style={{ backgroundColor: LAYERS[index % LAYERS.length].color }}
                    aria-hidden="true"
                  />
                  {tool}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
