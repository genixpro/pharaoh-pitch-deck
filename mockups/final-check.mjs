import { chromium } from "playwright";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
const page = await ctx.newPage();
await page.goto("http://127.0.0.1:8788/index.html#/11", { waitUntil: "domcontentloaded" });
await page.waitForFunction(() => !!window.Reveal && window.Reveal.isReady && window.Reveal.isReady());
await page.evaluate(() => window.Reveal.configure({ transition: "none", backgroundTransition: "none" }));
await page.waitForTimeout(1500);
// Don't call slide() again — let URL hash navigate. Just confirm.
const dom = await page.evaluate(() => {
  const present = document.querySelector(".reveal > .slides > section.present");
  const all = document.querySelectorAll(".reveal > .slides > section");
  return {
    indices: window.Reveal.getIndices(),
    presentPosition: Array.from(all).indexOf(present),
    title: present?.querySelector("h1,h2")?.textContent?.trim()?.slice(0, 60),
    visiblePixelTest: !!present?.classList?.contains("present"),
  };
});
console.log("HASH NAV to #/11:", JSON.stringify(dom, null, 2));
await page.screenshot({ path: "/tmp/final11.png" });
await browser.close();
