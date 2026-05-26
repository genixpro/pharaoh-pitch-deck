import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });

// Embed an image and screenshot at higher resolution
await page.setContent(`
<style>body{margin:0;background:#000;}</style>
<img src="http://127.0.0.1:8788/assets/screenshots/verify/11-competitor-matrix.png" style="display:block;width:1600px;"/>
`);
await page.waitForLoadState("networkidle");
await page.screenshot({ path: "/tmp/check11.png", clip: { x: 0, y: 0, width: 1600, height: 1000 }});

await page.setContent(`
<style>body{margin:0;background:#000;}</style>
<img src="http://127.0.0.1:8788/assets/screenshots/verify/13-architecture.png" style="display:block;width:1600px;"/>
`);
await page.waitForLoadState("networkidle");
await page.screenshot({ path: "/tmp/check13.png", clip: { x: 0, y: 0, width: 1600, height: 1000 }});

await browser.close();
