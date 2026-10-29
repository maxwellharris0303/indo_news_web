import Link from "next/link";
import { cookies } from "next/headers";
import { InfiniteLatest } from "@/components/home/infinite-latest";
import { AdSlot } from "@/components/news/ad-slot";
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
import { articlePublicHref } from "@/lib/article-url";
import { formatRelativeId } from "@/lib/format";
import { getSiteLocale } from "@/lib/locale";
import { homeText } from "@/lib/locale-ui";
import { categoryLabels } from "@/lib/site";
import { auth } from "@/auth";

export async function HomeView() {
  const session = await auth();
  const locale = await getSiteLocale();
  const copy = homeText(locale);
  const cookieStore = await cookies();
  const regionCookie = cookieStore.get("kabardesk-region")?.value;

  const hero = await getHeroLead(locale);
  const featured = (
    await getArticles({ limit: 4, sort: "latest", locale })
  ).filter((a) => a.id !== hero?.id);
  const latest = await getArticles({ limit: 8, locale });
  const moreLatest = await getArticles({ limit: 8, offset: 8, locale });
  const popular = await getPopularArticles(24, locale);
  const editorPicks = await getEditorPicks(locale);
  const topics = await getTopics();
  const factChecks = (await getFactChecks()).slice(0, 3);
  const regions = await getRegions();

  const regionalArticles = regionCookie
    ? await getArticles({ regionSlug: regionCookie, limit: 4, locale })
    : [];

  const forYou = session?.user?.id
    ? await getRecommendationsForUser(session.user.id, 4)
    : [];

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-6 sm:py-8">
      {forYou.length > 0 && (
        <section className="mb-10">
          <h2 className="font-serif text-xl font-bold sm:text-2xl">
            {copy.forYou}
          </h2>
          <p className="text-sm text-muted-foreground">{copy.forYouSub}</p>
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
            <h2 className="font-serif text-xl font-bold sm:text-2xl">
              {copy.hotTopics}
            </h2>
            <p className="text-sm text-muted-foreground">{copy.hotTopicsSub}</p>
          </div>
        </div>
        <TopicChips topics={topics} />
      </section>

      {regionalArticles.length > 0 && (
        <section className="mb-10">
          <h2 className="font-serif text-xl font-bold sm:text-2xl">
            {copy.yourRegion}
          </h2>
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
            <h2 className="font-serif text-xl font-bold sm:text-2xl">
              {copy.latest}
            </h2>
            <Button variant="link" asChild>
              <Link href="/indeks">{copy.viewIndex}</Link>
            </Button>
          </div>
          <div className="divide-y divide-border rounded-xl border border-border bg-card px-4">
            {latest.map((article) => (
              <NewsCard key={article.id} article={article} variant="horizontal" />
            ))}
          </div>
          <div className="mt-8">
            <InfiniteLatest
              initial={moreLatest}
              startOffset={16}
              locale={locale}
            />
          </div>
        </section>

        <aside className="space-y-8">
          <AdSlot compact />
          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-serif text-xl font-bold">{copy.popular}</h2>
            <ol className="mt-4 space-y-4">
              {popular.map((article, i) => (
                <li key={article.id} className="flex gap-3">
                  <span className="text-2xl font-bold text-primary/40">
                    {i + 1}
                  </span>
                  <div>
                    <Link
                      href={articlePublicHref(
                        article.category,
                        article.slug,
                      )}
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
            <h2 className="font-serif text-xl font-bold">{copy.editorPicks}</h2>
            <ul className="mt-4 space-y-3">
              {editorPicks.slice(0, 5).map((article) => (
                <li key={article.id}>
                  <Link
                    href={articlePublicHref(article.category, article.slug)}
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
          <h2 className="font-serif text-xl font-bold sm:text-2xl">
            {copy.regions}
          </h2>
          <Button variant="link" asChild>
            <Link href="/daerah">{copy.allProvinces}</Link>
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {regions.slice(0, 6).map((region) => (
            <Link
              key={region.slug}
              href={`/daerah/provinsi/${region.slug}`}
              className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary"
            >
              <p className="font-semibold">{region.name}</p>
              <p className="text-sm text-muted-foreground">
                {copy.localCoverage}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12 rounded-2xl border border-border bg-muted/20 p-6 md:p-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-xl font-bold sm:text-2xl">
              {copy.factCheck}
            </h2>
            <p className="text-sm text-muted-foreground">{copy.factCheckSub}</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/cek-fakta">{copy.allFactCheck}</Link>
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
