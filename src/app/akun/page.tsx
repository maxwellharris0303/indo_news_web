import { signOut } from "@/auth";
import { auth } from "@/auth";
import { NewsCard } from "@/components/news/news-card";
import { Button } from "@/components/ui/button";
import { AccountSettings } from "@/components/account/account-settings";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { getReadingHistory, getSavedArticles } from "@/lib/content/repository";

export const metadata = { title: "Akun Saya" };

export default async function AkunPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [saved, history, user] = await Promise.all([
    getSavedArticles(session.user.id),
    getReadingHistory(session.user.id, 8),
    prisma.user.findUnique({ where: { id: session.user.id } }),
  ]);

  let interests: string[] = [];
  try {
    interests = JSON.parse(user?.interests ?? "[]") as string[];
  } catch {
    interests = [];
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold">Akun Saya</h1>
          <p className="mt-1 text-muted-foreground">{session.user.email}</p>
          <p className="mt-1 text-sm">
            Paket:{" "}
            <span className="font-semibold">{user?.plan ?? "FREE"}</span>
            {user?.plan !== "PLUS" && (
              <>
                {" "}
                ·{" "}
                <Link href="/plus" className="text-primary hover:underline">
                  Upgrade Plus
                </Link>
              </>
            )}
          </p>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <Button type="submit" variant="outline">
            Keluar
          </Button>
        </form>
      </div>

      <AccountSettings initialInterests={interests} regionSlug={user?.regionSlug} />

      {history.length > 0 && (
        <section className="mt-12">
          <h2 className="font-serif text-2xl font-bold">Riwayat baca</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {history.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-12">
        <h2 className="font-serif text-2xl font-bold">Artikel disimpan</h2>
        {saved.length === 0 ? (
          <p className="mt-4 text-muted-foreground">
            Belum ada artikel disimpan. Buka berita dan tap Simpan.
          </p>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {saved.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
