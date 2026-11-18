import type { Capability, Fact, LayerKey, ProcessStep } from "./types";

export const site = {
  name: "Shaik Irfan Basha",
  short: "Irfan",
  wordmark: "IRFAN.",
  role: "AI & software systems developer",
  location: "India",
  timezone: "Asia/Kolkata",
  timezoneLabel: "IST",
  email: "Irfanbasha.contact@gmail.com",
  availability: "Open for select projects",
  availabilityShort: "Available",
  socials: [
    { label: "GitHub", href: "https://github.com/IrfanCodesBTW" },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/shaik-irfan-basha-b73abb325/",
    },
    { label: "Instagram", href: "https://www.instagram.com/rex_af0/" },
  ] as { label: string; href: string }[],
};

export const nav = [
  { label: "Work", target: "work" },
  { label: "Capabilities", target: "capabilities" },
  { label: "Systems", target: "systems" },
  { label: "About", target: "about" },
];

export const hero = {
  kicker: "Shaik Irfan Basha — AI & software systems",
  lines: ["I build projects", "that hold up."],
  sub: "AI integration, full-stack engineering and automation — from the first screen to the model running behind it.",
  primary: "Start a project",
  secondary: "See selected work",
  note: "Concept, study or shipped — labelled either way.",
  meta: [
    { key: "Based", value: "India" },
    { key: "Clock", value: "IST" },
    { key: "Status", value: "Open for select projects" },
  ] as Fact[],
};

export const dial = {
  domains: [
    {
      key: "interface",
      project: "10kicks",
      line: "Interfaces, states and the details people notice.",
    },
    {
      key: "application",
      project: "QuizRush",
      line: "APIs, real-time rooms and provider adapters.",
    },
    {
      key: "data",
      project: "SmartFinance",
      line: "Schemas, views and the durable record.",
    },
    {
      key: "intelligence",
      project: "Vaani",
      line: "STT, LLM, TTS — with guardrails and fallbacks.",
    },
  ] as { key: LayerKey; project: string; line: string }[],
};


export const manifest = {
  eyebrow: "01 — Standard",
  lead: "Most sites are decoration.",
  paragraph:
    "Mine are instruments. A website should explain the business, survive real use, and still feel like someone thought about it.",
  aside:
    "I work directly with the people I build for. Scope is agreed, boundaries are named, and the work is labelled for what it is — concept, study, or shipped.",
};

export const ticker = [
  "AI integration",
  "Full-stack engineering",
  "Automation",
  "Real-time systems",
  "Provider adapters",
  "Systems design",
];

export const work = {
  eyebrow: "02 — Selected work",
  title: ["Five builds.", "Different problems.", "Same standard."],
  note: "Self-directed concepts and source-led studies. Each labelled honestly — a concept is a concept.",
  hint: "Hover to preview · click for the case",
  openLabel: "Read the case",
  closeLabel: "Close case",
  caseLabels: {
    challenge: "The problem",
    approach: "The approach",
    boundary: "The boundary",
    stack: "Stack",
    layers: "Domain balance",
  },
};

export const systems = {
  eyebrow: "04 — Systems",
  title: ["What a build is", "actually made of."],
  intro:
    "Four domains. The balance changes per project; the standard doesn't. Composition is an authored estimate from the build itself, not analytics.",
  anatomyTitle: "Anatomy of a build",
  anatomyIntro: "Scroll to separate the stack.",
  compositionTitle: "Domain balance",
  matrixTitle: "By capability",
  matrixNote: "Filter by what the project actually used.",
  emptyState: "No build used that combination yet.",
};

export const capabilities: {
  eyebrow: string;
  title: string[];
  note: string;
  items: Capability[];
} = {
  eyebrow: "03 — Capabilities",
  title: ["What I can", "build and connect."],
  note: "Grouped by the kind of system, not the framework. Each group is backed by work on this page.",
  items: [
    {
      index: "01",
      title: "AI & intelligent systems",
      body: "Model and speech providers behind one interface, with guardrails, fallbacks and a human where it matters.",
      deliverables: ["Provider and model integration", "Guardrails and fallbacks", "Transcripts and review"],
      evidence: ["Vaani", "SmartFinance"],
      layer: "intelligence",
    },
    {
      index: "02",
      title: "Software & applications",
      body: "Full-stack products and real-time infrastructure — from the first screen through the data layer.",
      deliverables: ["Interface and flows", "APIs and data model", "Deployment and docs"],
      evidence: ["QuizRush", "SmartFinance"],
      layer: "application",
    },
    {
      index: "03",
      title: "Automation & integrations",
      body: "Connected services and background workflows that remove manual steps without hiding them.",
      deliverables: ["Third-party APIs", "Jobs and retries", "Monitoring and handover"],
      evidence: ["Vaani", "SmartFinance"],
      layer: "data",
    },
  ],
};

export const process = {
  eyebrow: "05 — Process",
  title: ["Four steps.", "No mystery."],
  note: "A starting point for a scoped collaboration. Support terms are agreed separately.",
  steps: [
    {
      index: "01",
      title: "Understand",
      summary: "Audience, workflow, constraints.",
      detail: "A short call and a written read-back, so we start from the same brief.",
    },
    {
      index: "02",
      title: "Define",
      summary: "Scope, content, a testable first version.",
      detail:
        "A page list, a data model sketch where relevant, and a clear line around what is not included.",
    },
    {
      index: "03",
      title: "Build",
      summary: "Reviewable steps, not a black box.",
      detail: "You see the work as it lands. Important flows get checked on real devices.",
    },
    {
      index: "04",
      title: "Handover",
      summary: "Decisions documented, setup explained.",
      detail: "Documentation you can hand to anyone, plus a walkthrough of what needs ongoing care.",
    },
  ] as ProcessStep[],
};

export const about = {
  eyebrow: "06 — About",
  title: ["The person behind", "the system."],
  body: "I'm Irfan. I work across AI integration, application backends and the interfaces on top. I like taking a broad idea to a working system — and being straight about what is built, what is concept, and what still needs work.",
  facts: [
    { key: "Focus", value: "AI & systems" },
    { key: "Selected builds", value: "05" },
    { key: "Working style", value: "Direct" },
    { key: "Based in", value: "India, IST" },
  ] as Fact[],
  note: "Currently taking on a small number of projects. The best brief is three sentences and a link.",
  tools: [
    "React",
    "TypeScript",
    "Next.js",
    "Node.js",
    "Express",
    "PostgreSQL",
    "SQLite",
    "Socket.IO",
    "GSAP",
    "Lenis",
    "Python",
    "LLM APIs",
    "Speech APIs",
  ],
};

export const contact = {
  eyebrow: "07 — Contact",
  title: ["Tell me what", "you're building."],
  body: "A rough brief is enough. What it is, who it's for, and what has to work. I'll reply with an honest read on scope and the next step.",
  chips: ["A website", "A web application", "An AI integration", "Not sure yet"],
  emailLabel: "Copy email",
  copiedLabel: "Copied",
  orLabel: "or write it out",
  note: "No forms that go nowhere. This opens a draft in your mail app.",
  subject: "Project enquiry",
};

export const footer = {
  line: "Designed and built by Shaik Irfan Basha. No templates.",
  colophon: "Archivo, Schibsted Grotesk, IBM Plex Mono, Fraunces. React, GSAP, Lenis.",
  top: "Back to top",
};
