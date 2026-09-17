import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

const files = [
  "worker.js", "story-order.js", "config-token.js", "upstream.js",
  "provider.js", "source-registry.js", "config-page.js", "cache.js"
];

for (const file of files) {
  const result = spawnSync(process.execPath, ["--check", file], { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const readme = readFileSync("README.md", "utf8");
if ([...readme].some(ch => ch.codePointAt(0) > 127)) {
  console.error("README.md contains non-ASCII text; use ASCII-safe public copy to prevent mojibake.");
  process.exit(1);
}

console.log(`PASS: syntax check (${files.length} files) + README encoding guard`);