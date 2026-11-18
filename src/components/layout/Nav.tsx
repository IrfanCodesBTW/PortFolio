import { useEffect, useRef, useState } from "react";
import type { CSSProperties, MouseEvent as ReactMouseEvent } from "react";

import { nav, site } from "@/data/content";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { scrollToTarget, startScroll, stopScroll } from "@/lib/scroll";

import "./Nav.css";

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Fixed chrome. Its background is the live ground token, so the bar changes
 * temperature with the section underneath instead of floating above it.
 */
export function Nav() {
  const reduced = useReducedMotion();
  const headerRef = useRef<HTMLElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  const openRef = useRef(open);
  useEffect(() => {
    openRef.current = open;
  }, [open]);

  /* hide on the way down, return on the way up ---------------------------- */
  useEffect(() => {
    const header = headerRef.current;
    const bar = barRef.current;
    if (!header || !bar) return;

    if (reduced) {
      gsap.set(bar, { yPercent: 0 });
      return;
    }

    let hidden = false;

    const setHidden = (next: boolean) => {
      if (next === hidden) return;
      hidden = next;
      gsap.to(bar, {
        yPercent: next ? -100 : 0,
        duration: 0.4,
        ease: next ? "power2.in" : "power3.out",
        overwrite: true,
      });
    };

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => {
          if (openRef.current) {
            setHidden(false);
            return;
          }
          if (self.scroll() < 96) {
            setHidden(false);
            return;
          }
          setHidden(self.direction === 1);
        },
      });
    }, header);

    // keyboard users must never chase a bar that has slid away
    const onFocusIn = () => setHidden(false);
    header.addEventListener("focusin", onFocusIn);

    return () => {
      header.removeEventListener("focusin", onFocusIn);
      ctx.revert();
      gsap.set(bar, { yPercent: 0 });
    };
  }, [reduced]);

  /* mobile menu: lock, focus, trap, escape -------------------------------- */
  useEffect(() => {
    if (!open) return;

    stopScroll();
    const header = headerRef.current;
    const overlay = overlayRef.current;
    const first = overlay?.querySelector<HTMLElement>(FOCUSABLE);
    const raf = requestAnimationFrame(() => first?.focus({ preventScroll: true }));

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab" || !header) return;

      const items = Array.from(header.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (element) => element.getClientRects().length > 0,
      );
      if (items.length === 0) return;

      const firstItem = items[0];
      const lastItem = items[items.length - 1];
      const current = document.activeElement;

      if (!event.shiftKey && current === lastItem) {
        event.preventDefault();
        firstItem.focus({ preventScroll: true });
      } else if (event.shiftKey && (current === firstItem || !header.contains(current))) {
        event.preventDefault();
        lastItem.focus({ preventScroll: true });
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKeyDown);
      startScroll();
      toggleRef.current?.focus({ preventScroll: true });
    };
  }, [open]);

  /* the overlay only exists below 900px ----------------------------------- */
  useEffect(() => {
    const query = window.matchMedia("(min-width: 900px)");
    const onChange = () => {
      if (query.matches) setOpen(false);
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  /* quiet current-section marker ----------------------------------------- */
  useEffect(() => {
    const sections = nav
      .map((item) => document.getElementById(item.target))
      .filter((element): element is HTMLElement => element !== null);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const goTo =
    (target: string | number, closeMenu: boolean) => (event: ReactMouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      if (closeMenu && openRef.current) {
        setOpen(false);
        // release the lock before Lenis is asked to travel
        startScroll();
      }
      scrollToTarget(target);
    };

  const mailto = `mailto:${site.email}`;

  return (
    <header className="nav" ref={headerRef}>
      <div className="nav-bar" ref={barRef}>
        <div className="nav-inner">
          <a
            className="nav-wordmark"
            href="#main"
            onClick={goTo(0, true)}
            aria-label={`${site.name} — back to top`}
          >
            {site.wordmark}
          </a>

          <div className="nav-right">
            <nav className="nav-links" aria-label="Sections">
              {nav.map((item) => (
                <a
                  key={item.target}
                  className="nav-link"
                  href={`#${item.target}`}
                  aria-current={active === item.target ? "location" : undefined}
                  onClick={goTo(item.target, false)}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <p className="nav-status">
              <span className="nav-dot" aria-hidden="true" />
              {site.availabilityShort}
            </p>

            <a className="btn btn--sm nav-cta" href="#contact" onClick={goTo("contact", false)}>
              Let&rsquo;s talk
              <span className="arrow" aria-hidden="true">
                &#8599;
              </span>
            </a>
          </div>

          <button
            className="nav-toggle"
            ref={toggleRef}
            type="button"
            aria-expanded={open}
            aria-controls="nav-menu"
            onClick={() => setOpen((value) => !value)}
          >
            <span className="nav-toggle-label">{open ? "Close" : "Menu"}</span>
            <span className="nav-toggle-mark" aria-hidden="true">
              <span />
              <span />
            </span>
          </button>
        </div>
      </div>

      <div
        className="nav-overlay"
        id="nav-menu"
        ref={overlayRef}
        data-open={open}
        data-lenis-prevent
        aria-hidden={!open}
        inert={!open}
      >
        <nav className="nav-overlay-inner shell" aria-label="Menu">
          <ul className="nav-overlay-list">
            {nav.map((item, index) => (
              <li
                className="nav-overlay-item"
                key={item.target}
                style={{ "--i": index } as CSSProperties}
              >
                <a
                  className="nav-overlay-link"
                  href={`#${item.target}`}
                  onClick={goTo(item.target, true)}
                >
                  <span className="nav-overlay-index label tnum">{`0${index + 1}`}</span>
                  <span className="nav-overlay-word">{item.label}</span>
                </a>
              </li>
            ))}
          </ul>

          <div className="nav-overlay-foot">
            <a className="nav-overlay-mail" href={mailto}>
              {site.email}
            </a>
            <p className="label">{site.availability}</p>
          </div>
        </nav>
      </div>
    </header>
  );
}
