import { spawnSync } from "node:child_process";

const files = [
  "worker.js",
  "story-order.js",
  "config-token.js",
  "upstream.js",
  "provider.js",
  "source-registry.js",
  "config-page.js",
  "cache.js"
];

for (const file of files) {
  const result = spawnSync(process.execPath, ["--check", file], { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log(`PASS: syntax check (${files.length} files)`);
