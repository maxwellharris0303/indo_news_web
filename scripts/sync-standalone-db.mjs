/**
 * PM2 runs Next from .next/standalone; prepare-standalone copies DB at build time only.
 * After RSS bulk publish or prisma changes, sync live prisma/dev.db into standalone.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const src = path.join(root, "prisma", "dev.db");
const destDir = path.join(root, ".next", "standalone", "prisma");
const dest = path.join(destDir, "dev.db");

if (!fs.existsSync(src)) {
  console.warn("sync-standalone-db: no prisma/dev.db — skip");
  process.exit(0);
}
if (!fs.existsSync(path.join(root, ".next", "standalone", "server.js"))) {
  console.warn("sync-standalone-db: no standalone build — skip");
  process.exit(0);
}

fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(src, dest);
console.log(`Synced DB → ${dest}`);
