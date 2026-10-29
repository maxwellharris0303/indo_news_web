import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const r = spawnSync(
  "npx",
  ["tsx", "scripts/rss-poll.ts"],
  { cwd: root, stdio: "inherit", shell: true },
);

process.exit(r.status ?? 1);
