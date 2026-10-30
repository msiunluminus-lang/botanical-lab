import { cp, mkdir, readFile, access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const html = await readFile(join(root, "index.html"), "utf8");
const title = "잎 표면 구조에 따른 미세먼지 흡착률 비교";
if (!html.includes(`<title>${title}</title>`) || !html.includes(`<h1 id="hero-title">${title}</h1>`)) {
  throw new Error("Official title does not match.");
}
if ([...html.matchAll(/data-section=/g)].length !== 20) throw new Error("Expected 20 sections.");
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
if (new Set(ids).size !== ids.length) throw new Error("Duplicate HTML id.");
for (const [, target] of html.matchAll(/href="#([^"]+)"/g)) {
  if (!ids.includes(target)) throw new Error(`Broken section link: ${target}`);
}
for (const [, path] of html.matchAll(/<(?:img|script|link)\b[^>]*?\s(?:src|href)="((?:assets|styles|scripts)\/[^"#]+)"/g)) {
  await access(join(root, path));
}
const destination = join(root, "dist");
await mkdir(destination, { recursive: true });
for (const path of ["index.html", "assets", "styles"]) {
  await cp(join(root, path), join(destination, path), { recursive: true });
}
await mkdir(join(destination, "scripts"), { recursive: true });
await cp(join(root, "scripts/main.js"), join(destination, "scripts/main.js"));
console.log("Build passed: official title, 20 sections, internal links and local assets verified. Static site copied to dist/.");
