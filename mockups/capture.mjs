// Capture mockup pages as PNG screenshots for the pitch deck.
// Usage:
//   node capture.mjs
// Requires Playwright to be installed somewhere reachable.

import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "../assets/screenshots/mockups");

const targets = [
  { name: "endpoint-agent", file: "endpoint-agent.html", viewport: { width: 1600, height: 1000 } },
  { name: "backend-agent",  file: "backend-agent.html",  viewport: { width: 1600, height: 1000 } },
  { name: "coding-agent",   file: "coding-agent.html",   viewport: { width: 1600, height: 1000 } },
  { name: "end-user-agent", file: "end-user-agent.html", viewport: { width: 1600, height: 1000 } },
  { name: "master-agent",   file: "master-agent.html",   viewport: { width: 1600, height: 1000 } },
  { name: "android-app",    file: "android-app.html",    viewport: { width: 460, height: 880 } },
];

const browser = await chromium.launch();
for (const t of targets) {
  const page = await browser.newPage({ viewport: t.viewport, deviceScaleFactor: 2 });
  const url = "file://" + path.resolve(__dirname, t.file);
  await page.goto(url, { waitUntil: "networkidle" });
  // Allow web fonts to settle
  await page.evaluate(async () => { if (document.fonts && document.fonts.ready) await document.fonts.ready; });
  await page.waitForTimeout(400);
  const outPath = path.join(OUT, `${t.name}.png`);
  await page.screenshot({ path: outPath, fullPage: false });
  console.log("captured:", outPath);
  await page.close();
}
await browser.close();
console.log("done.");
