import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
await page.goto("http://127.0.0.1:8788/index.html#/11", { waitUntil: "domcontentloaded" });
await page.waitForFunction(() => !!window.Reveal && window.Reveal.isReady && window.Reveal.isReady());
await page.evaluate(() => { window.Reveal.configure({ transition: "none" }); window.Reveal.slide(11, 0, 0); });
await page.waitForTimeout(900);
const result = await page.evaluate(() => {
  const cur = window.Reveal.getCurrentSlide();
  const idx = window.Reveal.getIndices();
  const all = document.querySelectorAll(".reveal > .slides > section");
  const curPos = Array.from(all).indexOf(cur);
  const eyebrow = cur.querySelector(".eyebrow")?.textContent?.trim();
  const title = cur.querySelector("h1,h2")?.textContent?.trim()?.slice(0,60);
  return { idx, curPos, eyebrow, title, hash: location.hash };
});
console.log(JSON.stringify(result, null, 2));
await browser.close();
