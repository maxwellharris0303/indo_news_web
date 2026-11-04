import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminLocaleProvider } from "@/components/admin/admin-locale-provider";
import { getAdminLocale } from "@/lib/admin-locale";
import { isStaffRole } from "@/lib/admin/require-staff";
import { prisma } from "@/lib/db";

export const metadata = {
  title: "Admin Redaksi",
};

/** Bulk RSS rewrite/auto-post server actions (any admin tab). */
export const maxDuration = 600;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/admin");
  }
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, name: true, email: true },
  });
  if (!dbUser || !isStaffRole(dbUser.role)) {
    redirect("/login?callbackUrl=/admin");
  }
  const user = {
    ...session.user,
    role: dbUser.role,
    name: dbUser.name ?? session.user.name,
    email: dbUser.email ?? session.user.email,
  };
  const locale = await getAdminLocale();

  return (
    <AdminLocaleProvider initialLocale={locale}>
      <AdminShell user={user}>{children}</AdminShell>
    </AdminLocaleProvider>
  );
}
