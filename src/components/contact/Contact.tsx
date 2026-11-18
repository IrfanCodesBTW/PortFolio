import { useEffect, useRef, useState } from "react";

import { contact, site } from "@/data/content";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { clamp } from "@/lib/format";
import { gsap } from "@/lib/gsap";

import "./Contact.css";

const COPIED_MS = 1600;
const MAGNET_REACH = 80;
const MAGNET_MAX = 6;

async function copyText(value: string) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // insecure context or a denied permission — fall back to the old path
  }

  try {
    const field = document.createElement("textarea");
    field.value = value;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.top = "0";
    field.style.left = "-9999px";
    field.style.opacity = "0";
    document.body.appendChild(field);

    try {
      field.select();
      field.setSelectionRange(0, value.length);
      return document.execCommand("copy");
    } finally {
      field.remove();
    }
  } catch {
    return false;
  }
}

function buildMailto(subject: string) {
  return `mailto:${site.email}?subject=${encodeURIComponent(subject)}`;
}

/**
 * The loudest plate on the page: one address, one choice, no form.
 */
export function Contact() {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const copyRef = useRef<HTMLButtonElement>(null);
  const pulseRef = useRef<HTMLSpanElement>(null);
  const ctxRef = useRef<ReturnType<typeof gsap.context> | null>(null);
  const copiedTimer = useRef<number | null>(null);

  const [selected, setSelected] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(
    () => () => {
      if (copiedTimer.current !== null) window.clearTimeout(copiedTimer.current);
    },
    [],
  );

  /* magnetic primary: 80px of reach, 6px of travel, pointer devices only */
  useEffect(() => {
    const section = sectionRef.current;
    const button = copyRef.current;
    if (!section || !button || reduced) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const ctx = gsap.context(() => {
      const xTo = gsap.quickTo(button, "x", { duration: 0.42, ease: "power3.out" });
      const yTo = gsap.quickTo(button, "y", { duration: 0.42, ease: "power3.out" });
      let pulled = false;

      const reset = () => {
        if (!pulled) return;
        pulled = false;
        xTo(0);
        yTo(0);
      };

      const onMove = (event: PointerEvent) => {
        const rect = button.getBoundingClientRect();
        const nearestX = clamp(event.clientX, rect.left, rect.right);
        const nearestY = clamp(event.clientY, rect.top, rect.bottom);
        const distance = Math.hypot(event.clientX - nearestX, event.clientY - nearestY);

        if (distance > MAGNET_REACH) {
          reset();
          return;
        }

        pulled = true;
        const strength = 1 - distance / MAGNET_REACH;
        const offsetX = event.clientX - (rect.left + rect.width / 2);
        const offsetY = event.clientY - (rect.top + rect.height / 2);

        xTo(clamp(offsetX * 0.16, -MAGNET_MAX, MAGNET_MAX) * strength);
        yTo(clamp(offsetY * 0.16, -MAGNET_MAX, MAGNET_MAX) * strength);
      };

      section.addEventListener("pointermove", onMove, { passive: true });
      section.addEventListener("pointerleave", reset);

      return () => {
        section.removeEventListener("pointermove", onMove);
        section.removeEventListener("pointerleave", reset);
        gsap.set(button, { x: 0, y: 0 });
      };
    });

    ctxRef.current = ctx;
    return () => {
      ctx.revert();
      ctxRef.current = null;
    };
  }, [reduced]);

  const handleCopy = async () => {
    const copiedOk = await copyText(site.email);

    if (!copiedOk) {
      setStatus(`Copy failed. The address is ${site.email}`);
      return;
    }

    setCopied(true);
    setStatus("Email address copied to clipboard");

    const pulse = pulseRef.current;
    if (pulse && !reduced) {
      gsap.killTweensOf(pulse);
      const run = () => {
        gsap.fromTo(
          pulse,
          { autoAlpha: 0.9, scale: 1 },
          { autoAlpha: 0, scale: 1.08, duration: 0.7, ease: "expo.out" },
        );
      };
      if (ctxRef.current) ctxRef.current.add(run);
      else run();
    }

    if (copiedTimer.current !== null) window.clearTimeout(copiedTimer.current);
    copiedTimer.current = window.setTimeout(() => {
      setCopied(false);
      setStatus("");
      copiedTimer.current = null;
    }, COPIED_MS);
  };

  const subject = selected ? `${contact.subject} — ${selected}` : contact.subject;
  const mailto = buildMailto(subject);

  return (
    <section
      id="contact"
      className="section contact"
      data-ground="vermilion"
      ref={sectionRef}
      aria-labelledby="contact-title"
    >
      <div className="shell contact-inner">
        <div className="contact-top">
          <p className="label label--strong">{contact.eyebrow}</p>
          <p className="label label--strong">{site.availability}</p>
        </div>

        <h2 className="display display-2 contact-title" id="contact-title">
          {contact.title.map((line) => (
            <span className="contact-title-line" key={line}>
              {line}
            </span>
          ))}
        </h2>

        <div className="contact-grid">
          <div className="contact-left">
            <p className="body contact-body">{contact.body}</p>

            <div className="contact-scope" role="group" aria-labelledby="contact-scope-label">
              <p className="label label--strong" id="contact-scope-label">
                Scope
              </p>
              <div className="contact-chips">
                {contact.chips.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    className="contact-chip"
                    aria-pressed={selected === chip}
                    onClick={() => setSelected((value) => (value === chip ? null : chip))}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            <div className="contact-socials">
              <p className="label label--strong">Elsewhere</p>
              <ul className="contact-social-list">
                {site.socials.map((social) => (
                  <li key={social.href}>
                    <a
                      className="contact-social"
                      href={social.href}
                      target="_blank"
                      rel="noreferrer"
                      data-cursor="open"
                    >
                      {social.label}
                      <span aria-hidden="true">&#8599;</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="contact-right">
            <p className="label label--strong">Email</p>

            <a className="contact-email display display-4" href={mailto} data-cursor="open">
              {site.email}
            </a>

            <div className="contact-actions">
              <button
                className="btn btn--solid contact-copy"
                data-cursor="copy"
                type="button"
                ref={copyRef}
                onClick={handleCopy}
                aria-describedby="contact-copy-status"
              >
                <span className="contact-copy-label">
                  {copied ? contact.copiedLabel : contact.emailLabel}
                </span>
                <span className="contact-copy-mark" aria-hidden="true" />
                <span className="contact-copy-pulse" ref={pulseRef} aria-hidden="true" />
              </button>

              <a className="link contact-alt" href={mailto} data-cursor="open">
                {contact.orLabel}
                <span aria-hidden="true">&#8599;</span>
              </a>
            </div>

            <p className="contact-subject">{`Subject — ${subject}`}</p>
          </div>
        </div>

        <p className="contact-note">{contact.note}</p>

        <span className="sr-only" id="contact-copy-status" role="status" aria-live="polite">
          {status}
        </span>
      </div>
    </section>
  );
}
