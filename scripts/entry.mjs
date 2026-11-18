import puppeteer from "puppeteer-core";
import path from "node:path";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const OUT = path.resolve("qa/shots");

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--hide-scrollbars"],
  defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1 },
});

const page = await browser.newPage();
await page.goto("http://localhost:5190/", { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForSelector(".pre", { timeout: 5000 });

await new Promise((r) => setTimeout(r, 420));
await page.screenshot({ path: path.join(OUT, "entry-01.png") });

await new Promise((r) => setTimeout(r, 780));
await page.screenshot({ path: path.join(OUT, "entry-02.png") });

await browser.close();
console.log("done");
