import { useEffect, useRef, useState } from "react";

import { footer, site } from "@/data/content";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { formatTime } from "@/lib/format";
import { gsap } from "@/lib/gsap";
import { scrollToTarget } from "@/lib/scroll";

import "./Footer.css";

/**
 * Ink plate. The wordmark is the only thing that moves here: it rises out of
 * its own overflow as the page finishes.
 */
export function Footer() {
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);
  const [time, setTime] = useState(() => formatTime(new Date()));

  const year = new Date().getFullYear();

  useEffect(() => {
    const tick = window.setInterval(() => setTime(formatTime(new Date())), 1000);
    return () => window.clearInterval(tick);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const word = wordRef.current;
    if (!root || !word) return;

    if (reduced) {
      gsap.set(word, { yPercent: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        word,
        { yPercent: 22 },
        {
          yPercent: 0,
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "top bottom",
            end: "bottom bottom",
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        },
      );
    }, root);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <footer className="foot" data-ground="ink" ref={rootRef}>
      <div className="shell foot-inner">
        <p className="foot-line">{footer.line}</p>

        <div className="foot-word" aria-hidden="true">
          <span className="foot-word-inner display" ref={wordRef}>
            {site.wordmark}
          </span>
        </div>

        <div className="foot-bottom">
          <p className="foot-credit label">
            <span className="tnum">{`© ${year}`}</span>
            <span className="foot-credit-sep" aria-hidden="true">
              /
            </span>
            <span>{site.name}</span>
          </p>

          <p className="foot-colophon">{footer.colophon}</p>

          <div className="foot-actions">
            {site.socials.length > 0 ? (
              <ul className="foot-socials">
                {site.socials.map((social) => (
                  <li key={social.href}>
                    <a
                      className="foot-social"
                      href={social.href}
                      target="_blank"
                      rel="noreferrer"
                      data-cursor="open"
                    >
                      {social.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}

            <p className="foot-clock">
              <span className="label">{site.timezoneLabel}</span>
              <time className="foot-time tnum">{time}</time>
            </p>

            <button className="foot-top" type="button" onClick={() => scrollToTarget(0)}>
              {footer.top}
              <span className="foot-top-arrow" aria-hidden="true">
                &#8593;
              </span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
