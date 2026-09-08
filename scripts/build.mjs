import { cpSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const dist = join(process.cwd(), "dist");
rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

cpSync(join(process.cwd(), "src"), join(dist, "src"), { recursive: true });

writeFileSync(
  join(dist, "index.html"),
  readFileSync(join(process.cwd(), "index.html"), "utf8") || `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Waller County Commissioner OS</title>
    <link rel="stylesheet" href="./src/styles.css" />
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="./src/main.js"></script>
  </body>
</html>
`
);

const size = statSync(join(dist, "index.html")).size;
console.log(`Built Commissioner OS module app to dist/ (${size} byte index).`);
