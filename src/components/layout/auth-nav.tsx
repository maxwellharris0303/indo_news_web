"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function AuthNav() {
  const { data: session } = useSession();
  const role = session?.user?.role;

  if (!session?.user) {
    return (
      <Button variant="outline" size="sm" asChild>
        <Link href="/login">Masuk</Link>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {(role === "ADMIN" || role === "EDITOR") && (
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin">Admin</Link>
        </Button>
      )}
      <Button variant="outline" size="sm" asChild>
        <Link href="/akun">Akun</Link>
      </Button>
    </div>
  );
}
