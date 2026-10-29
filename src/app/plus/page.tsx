import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "KabarDesk Plus",
  description: "Keanggotaan bebas iklan banner dan newsletter kurasi redaksi.",
};

export default async function PlusPage() {
  const session = await auth();
  let plan: string | null = null;
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true },
    });
    plan = user?.plan ?? "FREE";
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-serif text-3xl font-bold">KabarDesk Plus</h1>
      <p className="mt-3 text-lg text-muted-foreground">
        Dukung jurnalisme independen sambil menikmati pengalaman baca yang lebih
        bersih.
      </p>

      <ul className="mt-8 space-y-3 text-sm">
        <li>✓ Tanpa banner iklan di artikel dan beranda</li>
        <li>✓ Newsletter mingguan kurasi editor</li>
        <li>✓ Akses awal fitur beta (multimedia & cek fakta)</li>
      </ul>

      <div className="mt-10 rounded-xl border border-border p-6">
        <p className="text-2xl font-bold">
          Rp29.000<span className="text-base font-normal text-muted-foreground">/bulan</span>
        </p>
        {session?.user ? (
          plan === "PLUS" ? (
            <p className="mt-4 text-emerald-600">Akun Anda sudah KabarDesk Plus.</p>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              Demo: akun{" "}
              <code className="rounded bg-muted px-1">pembaca@kabardesk.id</code>{" "}
              sudah Plus. Integrasi pembayaran dapat ditambahkan di produksi.
            </p>
          )
        ) : (
          <Button asChild className="mt-4">
            <Link href="/login">Masuk untuk upgrade</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
