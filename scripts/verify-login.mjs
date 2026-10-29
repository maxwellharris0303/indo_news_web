import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const email = process.argv[2]?.trim().toLowerCase();
const password = process.argv[3] ?? "";

if (!email || !password) {
  console.error("Usage: npx tsx scripts/verify-login.mjs <email> <password>");
  process.exit(1);
}

const prisma = new PrismaClient();
try {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.log("NO_USER");
    process.exit(2);
  }
  if (!user.passwordHash) {
    console.log("NO_PASSWORD_HASH");
    process.exit(3);
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  console.log(JSON.stringify({ email: user.email, role: user.role, passwordMatch: ok }));
  process.exit(ok ? 0 : 4);
} finally {
  await prisma.$disconnect();
}
