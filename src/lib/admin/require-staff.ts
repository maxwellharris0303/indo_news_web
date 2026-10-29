import { auth } from "@/auth";

export function isStaffRole(role: string | undefined | null): boolean {
  return role === "SUPERADMIN" || role === "ADMIN" || role === "EDITOR";
}

export async function requireStaff() {
  const session = await auth();
  const role = session?.user?.role;
  if (!session?.user?.id || !isStaffRole(role)) {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}
