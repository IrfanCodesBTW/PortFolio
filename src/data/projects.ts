import type { Project } from "./types";

export const projects: Project[] = [
  {
    slug: "10kicks",
    index: "01",
    title: "10kicks",
    kind: "Concept storefront",
    summary:
      "An editorial sneaker storefront with product discovery, saved items and a persistent cart.",
    challenge:
      "Sneaker retail sites are dense catalogues. This one had to read like a magazine while still behaving like a shop.",
    approach:
      "Product-first layout, taste-led typography, a cart that survives a reload, and a checkout that says plainly that it is simulated.",
    boundary:
      "Frontend concept. Client-side cart and simulated checkout — no payment provider, no backend.",
    stack: ["React", "TypeScript", "GSAP", "Lenis"],
    layers: { interface: 45, application: 30, data: 15, intelligence: 10 },
    lead: "interface",
  },
  {
    slug: "bawarchi",
    index: "02",
    title: "Bawarchi",
    kind: "Interface concept",
    summary:
      "A restaurant menu built for legibility: dietary filters, sorting, dish detail and a saved shortlist.",
    challenge:
      "Menus are read on phones, in bad light, by hungry people. Most of them are still PDFs.",
    approach:
      "Filter by diet, sort by preference, inspect a dish without losing your place, keep a shortlist that survives the visit.",
    boundary: "Interface concept. Browser-local state and sample menu data.",
    stack: ["React", "TypeScript", "Vite"],
    layers: { interface: 60, application: 25, data: 15, intelligence: 0 },
    lead: "interface",
  },
  {
    slug: "quizrush",
    index: "03",
    title: "QuizRush",
    kind: "System study",
    summary:
      "A multiplayer quiz with rooms, timed questions and a leaderboard, built on real-time infrastructure.",
    challenge:
      "Everyone answers at once. State has to agree, scores have to settle, and a late join cannot break a round.",
    approach:
      "Socket.IO rooms, server-authoritative timers, Postgres for the durable record, Valkey for the hot path.",
    boundary:
      "Architecture study reviewed from source. Not presented as a live public deployment.",
    stack: ["Next.js", "TypeScript", "Socket.IO", "Postgres", "Valkey"],
    layers: { interface: 25, application: 40, data: 35, intelligence: 0 },
    lead: "application",
  },
  {
    slug: "vaani",
    index: "04",
    title: "Vaani",
    kind: "Source-led study",
    summary:
      "A voice-agent console connecting tenant accounts, configurable speech and LLM providers, and call transcripts.",
    challenge:
      "Voice stacks are brittle. Provider swaps, transcript drift and outbound calls all need guardrails.",
    approach:
      "Provider adapters behind one interface, guarded outbound calling through Dograh, transcripts kept as the source of truth.",
    boundary:
      "Engineering study from source. Architectural diagram, not a live call capture.",
    stack: ["Node.js", "Provider APIs", "TTS / STT / LLM", "Dograh"],
    layers: { interface: 30, application: 30, data: 20, intelligence: 20 },
    lead: "intelligence",
  },
  {
    slug: "smartfinance",
    index: "05",
    title: "SmartFinance",
    kind: "Repository prototype",
    summary:
      "A SQL-first personal finance tracker: transactions, budgets, recurring entries and dashboard views.",
    challenge:
      "A spreadsheet does not explain a month. The data model has to support the questions people actually ask.",
    approach:
      "SQL views doing the arithmetic, a thin API, and optional AI categorisation kept out of the critical path.",
    boundary:
      "Single-user SQLite prototype. Not presented as production deployment proof.",
    stack: ["Node.js", "Express", "SQLite", "SQL views", "AI (optional)"],
    layers: { interface: 25, application: 30, data: 35, intelligence: 10 },
    lead: "data",
  },
];

export const projectBySlug = (slug: string) => projects.find((project) => project.slug === slug);
