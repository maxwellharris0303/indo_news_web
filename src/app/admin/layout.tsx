import { auth } from "@/auth";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata = {
  title: "Admin Redaksi",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <AdminShell user={session?.user}>{children}</AdminShell>
  );
}
