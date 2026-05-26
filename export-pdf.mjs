// Export the Reveal.js pitch deck to PDF by screenshotting each slide.
// Captures every slide at 2x retina quality then stitches into PDF via Python/img2pdf.
// Usage: node export-pdf.mjs
// Output: pharaoh-pitch-2026.pdf

import { chromium } from "./mockups/node_modules/playwright-core/index.mjs";
import http from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT  = path.resolve(__dirname, "pharaoh-pitch-2026.pdf");
const TMPDIR = fs.mkdtempSync(path.join(os.tmpdir(), "pharaoh-pdf-"));

// Slide dimensions from Reveal config
const SLIDE_W = 1600;
const SLIDE_H = 1000;
const SCALE   = 2;

// ── Start an ephemeral static file server rooted in __dirname ────────────────
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js":   "application/javascript; charset=utf-8",
  ".mjs":  "application/javascript; charset=utf-8",
  ".css":  "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg":  "image/svg+xml",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif":  "image/gif",
  ".webp": "image/webp",
  ".ico":  "image/x-icon",
  ".woff": "font/woff",
  ".woff2":"font/woff2",
  ".ttf":  "font/ttf",
  ".otf":  "font/otf",
  ".map":  "application/json; charset=utf-8",
};

const server = http.createServer((req, res) => {
  try {
    const urlPath = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    const safe = path.normalize(urlPath).replace(/^(\.\.[\/\\])+/, "");
    let filePath = path.join(__dirname, safe);
    if (!filePath.startsWith(__dirname)) {
      res.writeHead(403); res.end("Forbidden"); return;
    }
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }
    if (!fs.existsSync(filePath)) {
      res.writeHead(404); res.end("Not found"); return;
    }
    res.writeHead(200, { "Content-Type": MIME[path.extname(filePath).toLowerCase()] || "application/octet-stream" });
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    res.writeHead(500); res.end(String(err));
  }
});

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const PORT = server.address().port;
const BASE = `http://127.0.0.1:${PORT}`;
console.log(`Serving ${__dirname} on ${BASE}`);

let browser, printer;

async function cleanup() {
  try { if (browser) await browser.close(); } catch {}
  try { if (printer) await printer.close(); } catch {}
  try { await new Promise((r) => server.close(r)); } catch {}
  try { fs.rmSync(TMPDIR, { recursive: true, force: true }); } catch {}
}

process.on("SIGINT",  async () => { await cleanup(); process.exit(130); });
process.on("SIGTERM", async () => { await cleanup(); process.exit(143); });

try {

browser = await chromium.launch({ channel: "chrome", headless: true });

// ── Discover slide structure via a throw-away page ───────────────────────────
const probe = await browser.newPage({ viewport: { width: SLIDE_W, height: SLIDE_H } });
await probe.goto(`${BASE}/index.html#/0`, { waitUntil: "networkidle" });
await probe.waitForFunction(
  () => window.Reveal?.isReady?.(),
  { timeout: 60000 }
);
await probe.evaluate(async () => {
  if (document.fonts?.ready) await document.fonts.ready;
});

const slides = await probe.evaluate(() => {
  const routes = [];
  const hSlides = window.Reveal.getHorizontalSlides();
  hSlides.forEach((hEl, h) => {
    const vSlides = hEl.querySelectorAll("section");
    if (vSlides.length === 0) {
      routes.push({ h, v: 0 });
    } else {
      vSlides.forEach((_, v) => routes.push({ h, v }));
    }
  });
  return routes;
});

await probe.close();
console.log(`Found ${slides.length} slides`);

// ── Screenshot each slide ────────────────────────────────────────────────────
const pngPaths = [];

for (let i = 0; i < slides.length; i++) {
  const { h, v } = slides[i];
  const ctx = await browser.newContext({
    viewport: { width: SLIDE_W, height: SLIDE_H },
    deviceScaleFactor: SCALE,
  });
  const page = await ctx.newPage();
  const url = `${BASE}/index.html#/${h}/${v}`;
  await page.goto(url, { waitUntil: "networkidle", timeout: 20000 });
  await page.waitForFunction(() => window.Reveal?.isReady?.(), { timeout: 10000 });
  await page.evaluate(() => window.Reveal.configure({ transition: "none", backgroundTransition: "none" }));
  await page.addStyleTag({ content: `.reveal .controls, .reveal .slide-number, .reveal .progress { display: none !important; }` });
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
  });
  await page.waitForTimeout(600);

  const outPng = path.join(TMPDIR, `slide-${String(i).padStart(3, "0")}.png`);
  await page.screenshot({ path: outPng, fullPage: false });
  pngPaths.push(outPng);
  process.stdout.write(`\r  captured ${i + 1}/${slides.length}: ${h}/${v}   `);
  await ctx.close();
}

await browser.close();
console.log("\nAll slides captured. Assembling PDF…");

// ── Stitch PNGs into PDF via a printer page ──────────────────────────────────
const imgTags = pngPaths
  .map((p) => `<img src="file://${p}">`)
  .join("\n");

const stitchHtml = path.join(TMPDIR, "WELL IT Autonomous AI Transformation.html");
fs.writeFileSync(
  stitchHtml,
  `<!DOCTYPE html><html><head><style>
* { margin: 0; padding: 0; box-sizing: border-box; }
@page { size: ${SLIDE_W}px ${SLIDE_H}px; margin: 0; }
img { display: block; width: ${SLIDE_W}px; height: ${SLIDE_H}px; page-break-after: always; }
</style></head><body>${imgTags}</body></html>`
);

printer = await chromium.launch({ channel: "chrome", headless: true });
const printerPage = await printer.newPage({ viewport: { width: SLIDE_W, height: SLIDE_H } });
await printerPage.goto(`file://${stitchHtml}`, { waitUntil: "load" });
await printerPage.pdf({
  path: OUT,
  width: `${SLIDE_W}px`,
  height: `${SLIDE_H}px`,
  printBackground: true,
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
});

console.log(`Done → ${OUT}`);
console.log(`Size: ${(fs.statSync(OUT).size / 1024 / 1024).toFixed(1)} MB`);

} finally {
  await cleanup();
}
