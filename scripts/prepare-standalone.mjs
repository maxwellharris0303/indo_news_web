import { cpSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const standalone = path.join(root, ".next", "standalone");
const staticSrc = path.join(root, ".next", "static");
const staticDest = path.join(standalone, ".next", "static");
const publicSrc = path.join(root, "public");
const publicDest = path.join(standalone, "public");

if (!existsSync(path.join(standalone, "server.js"))) {
  console.warn("prepare-standalone: no .next/standalone/server.js — run build first");
  process.exit(0);
}

mkdirSync(path.dirname(staticDest), { recursive: true });
cpSync(staticSrc, staticDest, { recursive: true });
if (existsSync(publicSrc)) {
  cpSync(publicSrc, publicDest, { recursive: true });
}

const envSrc = path.join(root, ".env");
const envDest = path.join(standalone, ".env");
if (existsSync(envSrc)) {
  cpSync(envSrc, envDest);
}

const dbSrc = path.join(root, "prisma", "dev.db");
const dbDestDir = path.join(standalone, "prisma");
const dbDest = path.join(dbDestDir, "dev.db");
if (existsSync(dbSrc)) {
  mkdirSync(dbDestDir, { recursive: true });
  cpSync(dbSrc, dbDest);
}
