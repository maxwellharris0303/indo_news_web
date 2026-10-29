import Link from "next/link";
import { cookies } from "next/headers";
import { NewsCard } from "@/components/news/news-card";
import { TopicChips } from "@/components/news/topic-chips";
import { Button } from "@/components/ui/button";
import {
  getArticles,
  getEditorPicks,
  getFactChecks,
  getHeroLead,
  getPopularArticles,
  getRecommendationsForUser,
  getRegions,
  getTopics,
} from "@/lib/content/repository";
import { categoryLabels } from "@/lib/site";
import { formatRelativeId } from "@/lib/format";
import { auth } from "@/auth";

export async function HomeView() {
  const session = await auth();
  const cookieStore = await cookies();
  const regionCookie = cookieStore.get("kabardesk-region")?.value;

  const hero = await getHeroLead();
  const featured = (await getArticles({ limit: 4, sort: "latest" })).filter(
    (a) => a.id !== hero?.id,
  );
  const latest = await getArticles({ limit: 8 });
  const popular = await getPopularArticles(24);
  const editorPicks = await getEditorPicks();
  const topics = await getTopics();
  const factChecks = (await getFactChecks()).slice(0, 3);
  const regions = await getRegions();

  const regionalArticles = regionCookie
    ? await getArticles({ regionSlug: regionCookie, limit: 4 })
    : [];

  const forYou = session?.user?.id
    ? await getRecommendationsForUser(session.user.id, 4)
    : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {forYou.length > 0 && (
        <section className="mb-10">
          <h2 className="font-serif text-2xl font-bold">Untuk kamu</h2>
          <p className="text-sm text-muted-foreground">
            Berdasarkan minat di akun KabarDesk
          </p>
          <div className="mt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {forYou.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      )}

      {hero && (
        <section className="mb-10">
          <NewsCard article={hero} variant="hero" priority />
        </section>
      )}

      <section className="mb-10 grid gap-6 md:grid-cols-3">
        {featured.slice(0, 3).map((article) => (
          <NewsCard key={article.id} article={article} />
        ))}
      </section>

      <section className="mb-10">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl font-bold">Topik hangat</h2>
            <p className="text-sm text-muted-foreground">
              Liputan berkelanjutan dari redaksi KabarDesk
            </p>
          </div>
        </div>
        <TopicChips topics={topics} />
      </section>

      {regionalArticles.length > 0 && (
        <section className="mb-10">
          <h2 className="font-serif text-2xl font-bold">Daerah kamu</h2>
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            {regionalArticles.map((article) => (
              <NewsCard key={article.id} article={article} variant="horizontal" />
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-10 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold">Terkini</h2>
            <Button variant="link" asChild>
              <Link href="/indeks">Lihat indeks</Link>
            </Button>
          </div>
          <div className="divide-y divide-border rounded-xl border border-border bg-card px-4">
            {latest.map((article) => (
              <NewsCard key={article.id} article={article} variant="horizontal" />
            ))}
          </div>
        </section>

        <aside className="space-y-8">
          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-serif text-xl font-bold">Terpopuler</h2>
            <ol className="mt-4 space-y-4">
              {popular.map((article, i) => (
                <li key={article.id} className="flex gap-3">
                  <span className="text-2xl font-bold text-primary/40">
                    {i + 1}
                  </span>
                  <div>
                    <Link
                      href={`/${article.category}/${article.slug}`}
                      className="font-medium leading-snug hover:text-primary"
                    >
                      {article.title}
                    </Link>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {categoryLabels[article.category]} ·{" "}
                      {formatRelativeId(article.publishedAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-serif text-xl font-bold">Pilihan editor</h2>
            <ul className="mt-4 space-y-3">
              {editorPicks.slice(0, 5).map((article) => (
                <li key={article.id}>
                  <Link
                    href={`/${article.category}/${article.slug}`}
                    className="text-sm font-medium leading-snug hover:text-primary"
                  >
                    {article.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>

      <section className="mt-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-2xl font-bold">Daerah</h2>
          <Button variant="link" asChild>
            <Link href="/daerah">Semua provinsi</Link>
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {regions.slice(0, 6).map((region) => (
            <Link
              key={region.slug}
              href={`/daerah/${region.slug}`}
              className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary"
            >
              <p className="font-semibold">{region.name}</p>
              <p className="text-sm text-muted-foreground">Liputan lokal</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12 rounded-2xl border border-border bg-muted/20 p-6 md:p-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl font-bold">Cek Fakta</h2>
            <p className="text-sm text-muted-foreground">
              Verifikasi klaim viral sebelum share
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/cek-fakta">Semua cek fakta</Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {factChecks.map((fc) => (
            <Link
              key={fc.slug}
              href={`/cek-fakta/${fc.slug}`}
              className="rounded-xl border border-border bg-background p-4 hover:border-primary"
            >
              <p className="text-xs font-semibold uppercase text-primary">
                {fc.verdict.replaceAll("_", " ")}
              </p>
              <p className="mt-2 line-clamp-3 text-sm font-medium">{fc.claim}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
