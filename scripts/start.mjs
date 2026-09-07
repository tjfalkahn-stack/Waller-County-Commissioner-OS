import "./build.mjs";
import { existsSync } from "node:fs";
import { join } from "node:path";

const index = join(process.cwd(), "dist/index.html");
if (!existsSync(index)) {
  console.error("index.html was not found.");
  process.exit(1);
}

console.log(`Waller County Commissioner OS is ready to open locally: ${index}`);
console.log("Optional local server, where permitted: npm run serve");
