import puppeteer from "puppeteer-core";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const URL = process.env.QA_URL ?? "http://localhost:5190/";
const OUT = path.resolve("qa/shots");

const width = Number(process.argv[2] ?? 1440);
const height = Number(process.argv[3] ?? 900);
const dpr = Number(process.argv[4] ?? 1);

await mkdir(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--hide-scrollbars", "--force-color-profile=srgb"],
  defaultViewport: { width, height, deviceScaleFactor: dpr },
});

const page = await browser.newPage();
const errors = [];

if (process.env.QA_REDUCED === "1") {
  await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
}

page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
page.on("console", (message) => {
  if (message.type() === "error") errors.push(`console: ${message.text().slice(0, 300)}`);
});

await page.goto(URL, { waitUntil: "load", timeout: 60000 });

// Let the preloader finish (it is rAF driven, which runs normally in headless).
const entryWaitStart = Date.now();
await page.waitForFunction(() => !document.querySelector(".pre"), { timeout: 20000 }).catch(() => {});
const entryWaitMs = Date.now() - entryWaitStart;
await page.evaluate(() => document.fonts.ready);
await page.evaluate(() => {
  const style = document.createElement("style");
  style.textContent = "html,body{transition:none!important} *{scroll-behavior:auto!important}";
  document.head.appendChild(style);
});

const metrics = await page.evaluate(() => ({
  docHeight: document.documentElement.scrollHeight,
  innerWidth: window.innerWidth,
  overflowX: document.documentElement.scrollWidth > window.innerWidth + 1,
  scrollWidth: document.documentElement.scrollWidth,
  pinSpacers: document.querySelectorAll(".pin-spacer").length,
  reduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
}));

const stops = [
  ["01-hero", "#hero", 0],
  ["02-manifest", "#standard", 0],
  ["03-work", "#work", 0],
  ["04-work-pin", "#work", 720],
  ["05-systems", "#systems", 0],
  ["06-anatomy-1", "#systems", 1000],
  ["07-anatomy-2", "#systems", 2000],
  ["08-anatomy-3", "#systems", 3300],
  ["09-composition", ".comp-root", 0],
  ["10-matrix", ".matrix-root", 0],
  ["10b-ticker", ".ticker", 0],
  ["11-capabilities", "#capabilities", 0],
  ["12-process", "#process", 0],
  ["13-about", "#about", 0],
  ["14-contact", "#contact", 0],
  ["15-footer", "footer", 0],
];

const results = [];

for (const [name, selector, offset] of stops) {
  const y = await page.evaluate(
    (target, extra) => {
      const el = document.querySelector(target);
      if (!el) return null;
      window.scrollTo(0, Math.max(0, el.getBoundingClientRect().top + window.scrollY + extra));
      return Math.round(window.scrollY);
    },
    selector,
    offset,
  );

  if (y === null) {
    results.push({ name, skipped: `${selector} missing` });
    continue;
  }

  await new Promise((resolve) => setTimeout(resolve, 850));
  const file = path.join(OUT, `${width}-${name}.png`);
  await page.screenshot({ path: file });
  const ground = await page.evaluate(() => document.documentElement.dataset.ground);
  results.push({ name, y, ground, file });
}

// Interaction check: open the first case sheet.
await page.evaluate(() => {
  document.querySelector("#work .work-row")?.click();
});
await new Promise((resolve) => setTimeout(resolve, 900));
const sheetOpen = await page.evaluate(() => Boolean(document.querySelector(".case-sheet")));
if (sheetOpen) {
  await page.screenshot({ path: path.join(OUT, `${width}-16-case.png`) });
  await page.keyboard.press("Escape");
  await new Promise((resolve) => setTimeout(resolve, 400));
}
const sheetClosed = await page.evaluate(() => !document.querySelector(".case"));

// Overflow audit across widths.
const widths = [360, 390, 768, 1024, 1440, 1920];
const overflow = [];
for (const w of widths) {
  await page.setViewport({ width: w, height: 900, deviceScaleFactor: 1 });
  await new Promise((resolve) => setTimeout(resolve, 400));
  overflow.push(
    await page.evaluate(() => ({
      w: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
    })),
  );
}

console.log(
  JSON.stringify({ width, height, dpr, entryWaitMs, metrics, errors, results, sheetOpen, sheetClosed, overflow }, null, 2),
);

await browser.close();
