import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export function isStaffRole(role: string | undefined | null): boolean {
  return role === "SUPERADMIN" || role === "ADMIN" || role === "EDITOR";
}

export async function requireStaff() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (!dbUser || !isStaffRole(dbUser.role)) {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}
