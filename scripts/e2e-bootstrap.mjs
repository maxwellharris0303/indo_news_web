import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const root = path.dirname(fileURLToPath(import.meta.url));
const credPath = path.join(root, ".superadmin-credentials");

if (!fs.existsSync(credPath)) {
  console.log("SKIP e2e-bootstrap (no .superadmin-credentials)");
  process.exit(0);
}

const [email, password] = fs
  .readFileSync(credPath, "utf8")
  .trim()
  .split("\n")
  .map((l) => l.trim());

if (!email || !password) process.exit(0);

const prisma = new PrismaClient();
try {
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.upsert({
    where: { email: email.toLowerCase() },
    create: {
      email: email.toLowerCase(),
      name: "Super Admin",
      passwordHash,
      role: "SUPERADMIN",
      plan: "PLUS",
    },
    update: { passwordHash, role: "SUPERADMIN" },
  });
  console.log("OK e2e-bootstrap superadmin");
} finally {
  await prisma.$disconnect();
}
