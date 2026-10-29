import Link from "next/link";
import { AdminNav } from "@/components/admin/admin-nav";
import { site } from "@/lib/site";
import { ROLE_LABELS } from "@/lib/admin/constants";

type Props = {
  children: React.ReactNode;
  user?: {
    name?: string | null;
    email?: string | null;
    role?: string;
  };
};

export function AdminShell({ children, user }: Props) {
  const roleLabel = user?.role ? ROLE_LABELS[user.role] ?? user.role : "Staff";

  return (
    <div className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-3 py-6 sm:px-6 lg:py-8">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Redaksi
            </p>
            <h1 className="font-serif text-2xl font-bold sm:text-3xl">
              {site.name} Admin
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {user?.name ?? user?.email ?? "Staff"} · {roleLabel}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <Link
              href="/"
              className="rounded-md border border-border bg-card px-3 py-2 font-medium hover:bg-muted"
            >
              Lihat situs
            </Link>
            <Link
              href="/akun"
              className="rounded-md border border-border bg-card px-3 py-2 font-medium hover:bg-muted"
            >
              Akun
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          <aside className="lg:w-52 lg:shrink-0">
            <AdminNav />
          </aside>
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
