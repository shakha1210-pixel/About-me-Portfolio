import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFileSync(resolve(root, path), "utf8");
const checks = [];

function check(name, fn) {
  fn();
  checks.push(name);
  console.log(`PASS  ${name}`);
}

check("required portfolio files and visual assets exist", () => {
  for (const path of [
    "index.html",
    "styles.css",
    "script.js",
    "assets/favicon.svg",
    "assets/og-preview.svg"
  ]) {
    assert.ok(existsSync(resolve(root, path)), `Missing required file: ${path}`);
  }
});

const html = read("index.html");
const css = read("styles.css");
const js = read("script.js");
const readme = read("README.md");

check("document metadata and language are present", () => {
  assert.match(html, /<html\s+lang="en"/i);
  assert.match(html, /<meta\s+name="viewport"/i);
  assert.match(html, /<meta\s+name="description"/i);
  assert.match(html, /<title>[^<]+<\/title>/i);
});

check("page section IDs are unique", () => {
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  assert.deepEqual([...new Set(duplicates)], [], `Duplicate IDs: ${duplicates.join(", ")}`);
});

check("all internal fragment links resolve", () => {
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));
  const fragments = [...html.matchAll(/\shref="#([^"]+)"/g)].map((match) => match[1]);
  const missing = fragments.filter((fragment) => !ids.has(fragment));
  assert.deepEqual(missing, [], `Missing fragment targets: ${missing.join(", ")}`);
});

check("local HTML assets resolve", () => {
  const refs = [...html.matchAll(/\s(?:src|href)="([^"]+)"/g)].map((match) => match[1]);
  const missing = refs.filter((ref) => {
    if (!ref || ref.startsWith("#") || /^(?:[a-z]+:|\/\/)/i.test(ref)) return false;
    const clean = decodeURIComponent(ref.split(/[?#]/, 1)[0]);
    return clean && !existsSync(resolve(root, clean));
  });
  assert.deepEqual(missing, [], `Missing local assets: ${missing.join(", ")}`);
});

check("README local links and image references resolve", () => {
  const refs = [...readme.matchAll(/(?:href|src)="([^"]+)"|\]\(([^)]+)\)/g)]
    .map((match) => match[1] || match[2]);
  const missing = refs.filter((ref) => {
    if (!ref || ref.startsWith("#") || /^(?:[a-z]+:|\/\/)/i.test(ref)) return false;
    const clean = decodeURIComponent(ref.split(/[?#]/, 1)[0]);
    return clean && !existsSync(resolve(root, clean));
  });
  assert.deepEqual(missing, [], "Missing README references: " + missing.join(", "));
});

check("README exposes the repository meta-system and local check command", () => {
  assert.ok(readme.includes("[System architecture](.meta/architecture/system-overview.md)"));
  assert.ok(readme.includes("[Development log](.meta/logs/DEVELOPMENT_LOG.md)"));
  assert.ok(readme.includes("npm run check"));
});

check("interactive terminal hooks exist in markup and script", () => {
  for (const id of ["terminal-form", "terminal-input", "terminal-output", "terminal-state", "voice-input", "voice-output"]) {
    assert.ok(html.includes(`id="${id}"`), `Missing terminal element: ${id}`);
  }
  assert.match(js, /querySelector\("#terminal-form"\)/);
  assert.match(js, /output\.textContent\s*=\s*result\.message/);
  assert.match(html, /aria-live="polite"/);
});

check("reduced-motion support and deferred script loading are present", () => {
  assert.match(css, /prefers-reduced-motion\s*:\s*reduce/);
  assert.match(html, /<script\s+src="script\.js"\s+defer><\/script>/);
});

check("project and contact destinations are represented", () => {
  for (const destination of [
    "https://github.com/shakha1210-pixel/AI-model",
    "https://github.com/shakha1210-pixel/Nexus-AI-Terminal-for-Ollama",
    "https://github.com/shakha1210-pixel/Logic-Hub",
    "mailto:shakha1210@gmail.com"
  ]) {
    assert.ok(html.includes(destination), `Missing expected destination: ${destination}`);
  }
});

console.log(`\nValidation complete: ${checks.length} checks passed.\n`);
