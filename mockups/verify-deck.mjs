// Render specific slides of the live deck (served on :8788) and screenshot them.
// Helps confirm visual fidelity end to end.
import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "../assets/screenshots/verify");

// 31 slides total (added TAM before final hero).
const slides = [
  { i: 0,  name: "01-title" },
  { i: 2,  name: "03-story-steamroller" },
  { i: 3,  name: "04-story-revolution" },
  { i: 4,  name: "05-hook-claude-for-it" },
  { i: 5,  name: "06-competitor-matrix" },
  { i: 6,  name: "07-project-intro" },
  { i: 7,  name: "08-well-transformation" },
  { i: 8,  name: "09-analogy" },
  { i: 9,  name: "10-problem" },
  { i: 10, name: "11-architecture" },
  { i: 11, name: "12-self-healing-loop" },
  { i: 12, name: "13-security-rings" },
  { i: 13, name: "14-benefits" },
  { i: 14, name: "15-build-with-me" },
  { i: 15, name: "16-closing-args" },
  { i: 16, name: "17-tam-market" },
  { i: 17, name: "18-final-hero" },
  { i: 18, name: "19-appendix-divider" },
  { i: 19, name: "20-appendix-endpoint-agent" },
  { i: 20, name: "21-appendix-backend-agent" },
  { i: 22, name: "23-appendix-end-user-agent" },
];

const browser = await chromium.launch();

// Fresh page per slide, URL-hash navigation (proven to work via probe).
for (const s of slides) {
  const ctx = await browser.newContext({
    viewport: { width: 1600, height: 1000 },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  await page.goto(`http://127.0.0.1:8788/index.html#/${s.i}`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => !!window.Reveal && window.Reveal.isReady && window.Reveal.isReady(), { timeout: 5000 });
  await page.evaluate(() => window.Reveal.configure({ transition: "none", backgroundTransition: "none" }));
  await page.evaluate(async () => { if (document.fonts && document.fonts.ready) await document.fonts.ready; });
  await page.waitForTimeout(1200);
  const actual = await page.evaluate(() => window.Reveal.getIndices().h);
  const out = path.join(OUT, `${s.name}.png`);
  await page.screenshot({ path: out, fullPage: false });
  console.log("verified:", out, "actual idx:", actual);
  await ctx.close();
}
await browser.close();
console.log("done.");
