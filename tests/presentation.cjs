// Run after npm run build. Requires Playwright and a Chromium browser (see README).
const assert = require("node:assert/strict");
const { createServer } = require("node:http");
const { readFile, mkdir } = require("node:fs/promises");
const { existsSync } = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "../dist");
const title = "잎 표면 구조에 따른 미세먼지 흡착률 비교";
const expectedIds = ["top", "research", "motivation", "hypothesis", "surface", "hairy", "waxy", "flat", "tape-principle", "opencv", "plants", "apparatus", "dispersion", "settling", "transfer", "analysis", "measurements", "rates", "conclusion", "next"];
const mime = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml" };
let browser;
let checks = 0;
function pass(message) { checks += 1; console.log(`PASS ${message}`); }
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    const file = path.resolve(root, `.${pathname === "/" ? "/index.html" : pathname}`);
    if (!file.startsWith(root + path.sep)) throw new Error("Invalid path");
    const data = await readFile(file);
    response.writeHead(200, { "Content-Type": `${mime[path.extname(file)] || "application/octet-stream"}; charset=utf-8` });
    response.end(data);
  } catch { response.writeHead(404); response.end("Not found"); }
});

(async () => {
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const url = `http://127.0.0.1:${server.address().port}`;
  const executablePath = process.env.CHROMIUM_PATH || (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined);
  browser = await chromium.launch({ headless: true, executablePath, args: ["--no-sandbox"] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce" });
  const errors = [];
  const failed = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("requestfailed", (request) => failed.push(request.url()));
  page.on("response", (response) => { if (response.status() >= 400) failed.push(response.url()); });
  assert.equal((await page.goto(url)).status(), 200);
  assert.equal(await page.title(), title);
  assert.equal(await page.locator("h1").textContent(), title);
  assert.ok((await page.locator('meta[name="description"]').getAttribute("content")).includes(title));
  assert.ok((await page.locator(".hero-researchers").innerText()).includes("정은우 · 유민수"));
  assert.equal(await page.locator(".hero-plant").evaluate((image) => image.complete && image.naturalWidth > 0), true);
  pass("Official title, metadata, researchers and original cover image");
  assert.deepEqual(await page.locator("main > section").evaluateAll((nodes) => nodes.map((node) => node.id)), expectedIds);
  assert.deepEqual(await page.locator("tbody tr").evaluateAll((rows) => rows.map((row) => [...row.cells].map((cell) => cell.textContent))), [
    ["고무나무", "0.802", "0.103"], ["스킨답서스", "0.666", "0.134"], ["스파티필름", "1.234", "0.068"], ["램스이어", "1.138", "0.106"],
  ]);
  assert.deepEqual(await page.locator(".bar-label").evaluateAll((rows) => rows.map((row) => row.textContent)), ["스파티필름41.1%", "램스이어37.9%", "고무나무26.7%", "스킨답서스22.2%"]);
  assert.equal(await page.locator(".photo-slot").count(), 9);
  assert.equal(await page.locator(".photo-placeholder:visible").count(), 9);
  pass("All 20 ordered sections, eight raw measurements, four reported rates and nine empty photo slots");

  async function at(index) {
    await page.waitForFunction((value) => Number(document.querySelector("progress").value) === value, index + 1);
    const box = await page.locator(`#${expectedIds[index]}`).boundingBox();
    assert.ok(box.y < 40 && box.y > -40, `Section ${index + 1} should align with viewport; got ${box.y}`);
  }
  await page.locator("[data-start]").click();
  await at(1);
  for (const target of ["motivation", "surface", "plants", "measurements", "conclusion"]) {
    await page.locator('.presentation-controls a').click();
    await at(1);
    await page.locator(`.toc-item[href="#${target}"]`).click();
    await at(expectedIds.indexOf(target));
    assert.equal(await page.locator(`.toc-item[href="#${target}"]`).getAttribute("aria-current"), "location");
  }
  pass("Start button and all five table-of-contents links");
  await page.locator('#conclusion').evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await at(0);
  assert.ok(await page.locator("[data-prev]").isDisabled());
  for (let i = 1; i < 20; i += 1) { await page.locator("[data-next]").click(); await at(i); }
  assert.ok(await page.locator("[data-next]").isDisabled());
  await page.locator("[data-prev]").click(); await at(18);
  await page.keyboard.press("ArrowLeft"); await at(17);
  await page.keyboard.press("ArrowRight"); await at(18);
  assert.equal(await page.locator("#conclusion-title").evaluate((node) => node === document.activeElement), true);
  await page.evaluate(() => {
    const input = document.createElement("textarea"); input.id = "test-input";
    document.querySelector("#conclusion .chapter-inner").prepend(input); input.focus({ preventScroll: true });
  });
  await page.keyboard.press("ArrowRight"); await at(18);
  await page.locator("#test-input").evaluate((node) => node.remove());
  await page.locator("[data-prev]").focus(); await page.keyboard.press("ArrowLeft"); await at(18);
  await page.evaluate(() => {
    const editable = document.createElement("div"); editable.contentEditable = "true"; editable.id = "test-editable";
    document.querySelector("#conclusion .chapter-inner").prepend(editable); editable.focus({ preventScroll: true });
  });
  await page.keyboard.press("ArrowRight"); await at(18);
  await page.locator("#test-editable").evaluate((node) => node.remove());
  pass("All next transitions, previous, arrow keys, focus, boundaries and editable/control keyboard guards");

  await page.locator("[data-fullscreen]").click();
  await page.waitForFunction(() => Boolean(document.fullscreenElement) && document.querySelector("[data-fullscreen]").getAttribute("aria-pressed") === "true");
  assert.equal(await page.locator("[data-fullscreen]").getAttribute("aria-pressed"), "true");
  await page.locator("[data-fullscreen]").click();
  await page.waitForFunction(() => !document.fullscreenElement && document.querySelector("[data-fullscreen]").getAttribute("aria-pressed") === "false");
  pass("Actual Chromium fullscreen entry and exit");
  await page.evaluate(() => Object.defineProperty(document, "fullscreenEnabled", { value: false, configurable: true }));
  await page.locator("[data-fullscreen]").click();
  assert.ok((await page.locator(".control-status").innerText()).includes("지원하지"));
  await page.reload();
  pass("Unsupported fullscreen displays a readable fallback");

  await mkdir(path.resolve(__dirname, "../test-results"), { recursive: true });
  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: width < 500 ? 844 : 1000 });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await at(0);
    const overflow = await page.evaluate(() => {
      const w = document.documentElement.clientWidth;
      return [...document.querySelectorAll('h1, h2, .photo-slot, .table-card, .chart-card, .presentation-controls, .toc-item')].filter((node) => {
        const box = node.getBoundingClientRect(); return box.left < -1 || box.right > w + 1;
      }).map((node) => node.className || node.id);
    });
    assert.deepEqual(overflow, [], `Overflow at ${width}px`);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    if ([1440, 390].includes(width)) {
      await page.screenshot({ path: path.resolve(__dirname, `../test-results/cover-${width}.png`) });
      await page.locator("#rates").evaluate((node) => node.scrollIntoView({ behavior: "instant" }));
      await page.screenshot({ path: path.resolve(__dirname, `../test-results/rates-${width}.png`), fullPage: false });
    }
  }
  pass("1440, 1024, 768, 390 and 320px layouts: no horizontal overflow, including key elements");

  const noJS = await browser.newPage({ javaScriptEnabled: false, reducedMotion: "reduce", viewport: { width: 390, height: 844 } });
  await noJS.bringToFront();
  await noJS.goto(url);
  assert.equal(await noJS.locator("main > section").count(), 20);
  assert.ok(await noJS.locator("#measurements table").isVisible());
  assert.ok(await noJS.locator(".bar-fill").first().isVisible());
  const startBox = await noJS.locator("[data-start]").boundingBox();
  assert.ok(startBox.y >= 0 && startBox.y + startBox.height < 844, "Native start link is in the viewport");
  await noJS.mouse.click(startBox.x + startBox.width / 2, startBox.y + startBox.height / 2);
  await noJS.waitForURL("**/#research");
  assert.equal(await noJS.locator(".photo-placeholder:visible").count(), 9);
  await noJS.close();
  pass("JavaScript disabled: content, table, chart, photo guides and native anchor remain usable");

  const motion = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await motion.bringToFront();
  await motion.goto(url);
  assert.equal(await motion.locator(".plant-wrap").evaluate((node) => getComputedStyle(node).animationName), "plant-float");
  await motion.locator(".specimen-stage").hover();
  await motion.waitForFunction(() => document.querySelector(".plant-wrap").style.getPropertyValue("--tilt-x") !== "");
  await motion.locator("[data-start]").click();
  await motion.waitForFunction(() => Math.abs(document.querySelector("#research").getBoundingClientRect().top) < 3);
  await motion.locator('#rates').evaluate((node) => node.scrollIntoView({ behavior: "instant" }));
  await motion.waitForFunction(() => document.querySelector('.chart-card').classList.contains('chart-animate'));
  await motion.waitForTimeout(1100);
  const ratio = await motion.locator(".chart-row").first().evaluate((node) => node.querySelector(".bar-fill").getBoundingClientRect().width / node.querySelector(".bar-track").getBoundingClientRect().width);
  assert.ok(Math.abs(ratio - 0.411) < 0.002);
  await motion.emulateMedia({ reducedMotion: "reduce" });
  assert.equal(await motion.locator(".plant-wrap").evaluate((node) => getComputedStyle(node).animationName), "none");
  for (const id of ["hairy", "plants", "measurements"]) {
    await motion.locator(`#${id}`).evaluate((node) => node.scrollIntoView({ behavior: "instant" }));
    await motion.screenshot({ path: path.resolve(__dirname, `../test-results/${id}-1440.png`) });
  }
  await motion.close();
  pass("Cover motion, pointer response, smooth scrolling, graph animation with correct 0–100 scale, reduced-motion preference");

  // Injected photo fixtures are test-only; no fabricated experiment image is shipped.
  const fixtureHTML = await readFile(path.join(root, "index.html"), "utf8");
  const photoPage = await browser.newPage();
  await photoPage.route("**/index.html", (route) => route.fulfill({ contentType: "text/html", body: fixtureHTML.replace('data-photo-src=""', 'data-photo-src="assets/images/hero-plant.png"') }));
  await photoPage.goto(`${url}/index.html`);
  await photoPage.locator("[data-photo-src]").first().waitFor({ state: "visible" });
  assert.equal(await photoPage.locator(".photo-placeholder:visible").count(), 8);
  await photoPage.unroute("**/index.html");
  await photoPage.route("**/index.html", (route) => route.fulfill({ contentType: "text/html", body: fixtureHTML.replace('data-photo-src=""', 'data-photo-src="assets/photos/missing-test.jpg"') }));
  await photoPage.goto(`${url}/index.html`);
  await photoPage.waitForFunction(() => document.querySelector(".photo-status").textContent.includes("불러오지"));
  assert.equal(await photoPage.locator(".photo-placeholder:visible").count(), 9);
  assert.ok(await photoPage.locator("h1").isVisible());
  await photoPage.route("**/hero-plant.png", (route) => route.abort());
  await photoPage.reload();
  await photoPage.locator(".hero-fallback").waitFor({ state: "visible" });
  await photoPage.close();
  pass("Photo replacement, intentionally missing photo and failed cover asset restore fallbacks (expected network failures isolated)");
  assert.deepEqual(errors, []);
  assert.deepEqual(failed, []);
  pass("Normal site: zero console errors, page errors or failed asset requests");
  console.log(`${checks} groups passed. Screenshots saved to test-results/.`);
})().catch((error) => { console.error(error); process.exitCode = 1; }).finally(async () => {
  await browser?.close();
  server.close();
});
