import { spawnSync } from "node:child_process";

const deterministic = [
  "test-engine.mjs",
  "test-security.mjs",
  "test-worker.mjs",
  "test-customization.mjs",
  "test-android-contract.mjs",
  "test-cross-title-contract.mjs"
];
const files = process.argv.includes("--live") ? [...deterministic, "test-live.mjs"] : deterministic;

for (const file of files) {
  const result = spawnSync(process.execPath, [file], { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log(`PASS: Story Order suite (${files.length} test files)`);
