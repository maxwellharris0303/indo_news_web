/**
 * Create or update a SUPERADMIN user (credentials not stored in git).
 * Usage: npx tsx scripts/upsert-superadmin.mjs <email> <password>
 * Or: SUPERADMIN_EMAIL=... SUPERADMIN_PASSWORD=... npx tsx scripts/upsert-superadmin.mjs
 */
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const email = (
  process.argv[2] ??
  process.env.SUPERADMIN_EMAIL ??
  ""
).trim().toLowerCase();
const password = process.argv[3] ?? process.env.SUPERADMIN_PASSWORD ?? "";

if (!email || !password) {
  console.error(
    "Usage: npx tsx scripts/upsert-superadmin.mjs <email> <password>",
  );
  process.exit(1);
}

const prisma = new PrismaClient();

try {
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      name: "Super Admin",
      passwordHash,
      role: "SUPERADMIN",
      plan: "PLUS",
    },
    update: {
      passwordHash,
      role: "SUPERADMIN",
    },
  });
  console.log(`SUPERADMIN ready: ${user.email} (${user.id})`);
} finally {
  await prisma.$disconnect();
}
