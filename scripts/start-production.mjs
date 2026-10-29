import { execSync, spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  }
}

loadEnvFile(path.join(root, ".env"));

execSync("node scripts/prepare-standalone.mjs", {
  stdio: "inherit",
  env: process.env,
});

const standaloneDir = path.join(root, ".next", "standalone");
loadEnvFile(path.join(standaloneDir, ".env"));

const child = spawn("node", ["server.js"], {
  cwd: standaloneDir,
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});
