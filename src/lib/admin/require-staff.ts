import { auth } from "@/auth";

export async function requireStaff() {
  const session = await auth();
  const role = session?.user?.role;
  if (
    !session?.user?.id ||
    (role !== "SUPERADMIN" && role !== "ADMIN" && role !== "EDITOR")
  ) {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}
