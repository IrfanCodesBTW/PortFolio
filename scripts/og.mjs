import puppeteer from "puppeteer-core";
import path from "node:path";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const URL = process.env.QA_URL ?? "http://localhost:5190/";
const OUT = path.resolve("public/og.png");

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--hide-scrollbars", "--force-color-profile=srgb"],
  defaultViewport: { width: 1200, height: 630, deviceScaleFactor: 1 },
});

const page = await browser.newPage();
await page.goto(URL, { waitUntil: "load", timeout: 60000 });
await page.waitForFunction(() => !document.querySelector(".pre"), { timeout: 20000 }).catch(() => {});
await page.evaluate(() => document.fonts.ready);

await page.evaluate(() => {
  document.documentElement.dataset.ground = "bone";
  const poster = document.createElement("div");
  poster.style.cssText = [
    "position:fixed",
    "inset:0",
    "z-index:99999",
    "background:#F3F1E9",
    "color:#0F0F0D",
    "padding:54px 56px 46px",
    "display:flex",
    "flex-direction:column",
    "justify-content:space-between",
    "box-sizing:border-box",
  ].join(";");

  const mono = "font-family:'IBM Plex Mono',monospace;font-weight:500;font-size:12px;letter-spacing:.14em;text-transform:uppercase";

  poster.innerHTML = `
    <div style="display:flex;align-items:baseline;justify-content:space-between;border-bottom:1px solid #D8D4C7;padding-bottom:14px">
      <span style="font-family:'Archivo Variable';font-weight:700;font-stretch:113%;font-size:24px;letter-spacing:-.03em">IRFAN.</span>
      <span style="${mono};color:#5C5A52">AI &amp; software systems</span>
    </div>

    <div style="position:relative;display:flex;align-items:center;flex:1;padding-block:18px">
      <div style="font-family:'Archivo Variable';font-weight:700;font-stretch:113%;font-size:104px;line-height:.87;letter-spacing:-.045em">
        I build projects<br/>that hold up.
      </div>
      <div style="position:absolute;right:0;bottom:22px;display:flex;flex-direction:column;gap:8px;width:140px">
        <div style="height:9px;background:#E8462A"></div>
        <div style="height:9px;background:#2438E8"></div>
        <div style="height:9px;background:#1C7C54"></div>
        <div style="height:9px;background:#C9F24C"></div>
        <span style="${mono};color:#5C5A52;margin-top:4px">Four domains</span>
      </div>
    </div>

    <div style="display:flex;align-items:flex-end;justify-content:space-between;border-top:1px solid #D8D4C7;padding-top:14px;font-family:'Schibsted Grotesk',sans-serif;font-size:15px;line-height:1.4;color:#5C5A52">
      <span>AI integration, full-stack engineering<br/>and automation.</span>
      <span style="${mono}">Irfanbasha.contact@gmail.com</span>
    </div>
  `;

  document.body.appendChild(poster);
});

await new Promise((resolve) => setTimeout(resolve, 600));
await page.screenshot({ path: OUT });
await browser.close();
console.log(OUT);
