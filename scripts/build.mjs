import { mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const dist = join(process.cwd(), "dist");
rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

const css = readFileSync(join(process.cwd(), "src/styles.css"), "utf8");
const modules = [
  "src/commissioner/sampleData.js",
  "src/commissioner/services.js",
  "src/main.js"
].map((file) => readFileSync(join(process.cwd(), file), "utf8"));

const js = modules
  .join("\n\n")
  .replace(/^import[\s\S]*?;\n/gm, "")
  .replace(/^export /gm, "");

writeFileSync(
  join(dist, "index.html"),
  `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Waller County Commissioner OS</title>
    <style>${css}</style>
  </head>
  <body>
    <div id="app"></div>
    <script>${js}</script>
  </body>
</html>
`
);

const size = statSync(join(dist, "index.html")).size;
console.log(`Built standalone Commissioner OS to dist/ (${size} byte index).`);
