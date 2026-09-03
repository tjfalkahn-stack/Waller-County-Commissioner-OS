import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const ignored = new Set([".git", "dist", "node_modules"]);
const appFilePattern = /(index\.html|package\.json|server\.mjs|scripts\/.*\.mjs|src\/.*\.(js|css))$/;

function files(dir = root) {
  return readdirSync(dir).flatMap((name) => {
    if (ignored.has(name)) return [];
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : [path];
  });
}

test("application source does not retain unrelated OS or PortFlow dependencies", () => {
  const source = files()
    .filter((path) => appFilePattern.test(path.replace(`${root}/`, "")))
    .map((path) => readFileSync(path, "utf8"))
    .join("\n");
  assert.doesNotMatch(source, /Watch Desk|Port of Port Arthur|PORTFLOW|PortFlow/);
  assert.doesNotMatch(source, /from ['"].*(CivicGrid|watch-desk|port-of-port-arthur)/i);
});

test("repository does not contain committed secret-looking values", () => {
  const source = files()
    .filter((path) => appFilePattern.test(path.replace(`${root}/`, "")))
    .map((path) => readFileSync(path, "utf8"))
    .join("\n");
  assert.doesNotMatch(source, /sk-[A-Za-z0-9_-]{20,}/);
  assert.doesNotMatch(source, /(OPENAI_API_KEY|api[_-]?key|password|secret)\s*[:=]\s*['"][^'"]+['"]/i);
});

test("primary navigation and Commissioner Command Center surface are present", () => {
  const source = readFileSync(join(root, "src/main.js"), "utf8");
  for (const label of [
    "Command Center",
    "Morning Brief",
    "Constituent Service",
    "Roads & Infrastructure",
    "Projects",
    "Field Desk",
    "Agenda & Meetings",
    "Budget",
    "Commitments",
    "Documents",
    "Reports"
  ]) {
    assert.match(source, new RegExp(label.replace(/[&]/g, "\\$&")));
  }
  assert.match(source, /Commissioner Command Center/);
  assert.match(source, /What needs attention/);
});
