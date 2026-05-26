import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
await page.goto("http://127.0.0.1:8788/index.html", { waitUntil: "domcontentloaded" });
await page.waitForFunction(() => !!window.Reveal && window.Reveal.isReady && window.Reveal.isReady());
const info = await page.evaluate(() => {
  const sections = document.querySelectorAll(".reveal > .slides > section");
  return Array.from(sections).map((s, i) => {
    const h1 = s.querySelector("h1, h2, .hero-title");
    const eyebrow = s.querySelector(".eyebrow");
    return {
      i,
      eyebrow: eyebrow?.textContent?.trim()?.slice(0, 40),
      title: h1?.textContent?.trim()?.slice(0, 60),
    };
  });
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
