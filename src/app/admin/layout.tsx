import { auth } from "@/auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminLocaleProvider } from "@/components/admin/admin-locale-provider";
import { getAdminLocale } from "@/lib/admin-locale";

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
  const locale = await getAdminLocale();

  return (
    <AdminLocaleProvider initialLocale={locale}>
      <AdminShell user={session?.user}>{children}</AdminShell>
    </AdminLocaleProvider>
  );
}
