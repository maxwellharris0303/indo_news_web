"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export function MobileAuthLinks({ onNavigate }: { onNavigate?: () => void }) {
  const { data: session } = useSession();
  const role = session?.user?.role;
  const isStaff =
    role === "SUPERADMIN" || role === "ADMIN" || role === "EDITOR";

  if (!session?.user) {
    return (
      <Link
        href="/login"
        onClick={onNavigate}
        className="flex min-h-11 items-center rounded-lg bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground"
      >
        Masuk / Daftar
      </Link>
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {isStaff ? (
        <Link
          href="/admin"
          onClick={onNavigate}
          className="flex min-h-11 items-center justify-center rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium"
        >
          Admin Redaksi
        </Link>
      ) : null}
      <Link
        href="/akun"
        onClick={onNavigate}
        className="flex min-h-11 items-center justify-center rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium"
      >
        Akun Saya
      </Link>
    </div>
  );
}
