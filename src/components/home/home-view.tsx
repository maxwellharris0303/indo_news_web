import Link from "next/link";
import { cookies } from "next/headers";
import { InfiniteLatest } from "@/components/home/infinite-latest";
import { SectionHeading } from "@/components/layout/section-heading";
import { AdSlot } from "@/components/news/ad-slot";
import { NewsCard } from "@/components/news/news-card";
import { TopicChips } from "@/components/news/topic-chips";
import {
  getArticles,
  getEditorPicks,
  getFactChecks,
  getHeroLead,
  getPopularArticles,
  getRecommendationsForUser,
  getRegions,
} from "@/lib/content/repository";
import { articlePublicHref } from "@/lib/article-url";
import { pickArticles } from "@/lib/home/pick-articles";
import { formatRelativeId } from "@/lib/format";
import { getSiteLocale } from "@/lib/locale";
import { homeText } from "@/lib/locale-ui";
import { categoryLabels } from "@/lib/site";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getHomepageTopicsWithCounts } from "@/lib/topics/queries";

export async function HomeView() {
  const session = await auth();
  const locale = await getSiteLocale();
  const copy = homeText(locale);
  const cookieStore = await cookies();
  let regionCookie = cookieStore.get("kabardesk-region")?.value;
  if (!regionCookie && session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { regionSlug: true },
    });
    regionCookie = user?.regionSlug ?? undefined;
  }

  const pinned = new Set<string>();

  const forYou = session?.user?.id
    ? await getRecommendationsForUser(session.user.id, 4)
    : [];
  for (const article of forYou) pinned.add(article.id);

  const hero = await getHeroLead(locale, [...pinned]);
  if (hero) pinned.add(hero.id);

  const latestPool = await getArticles({ limit: 64, sort: "latest", locale });
  const featured = pickArticles(latestPool, 3, pinned);
  const latest = pickArticles(latestPool, 8, pinned);
  const moreLatest = pickArticles(latestPool, 8, pinned);

  const popular = await getPopularArticles(24, locale);
  const editorPicks = await getEditorPicks(locale);
  const topics = await getHomepageTopicsWithCounts();
  const factChecks = (await getFactChecks()).slice(0, 3);
  const regions = await getRegions();

  const regionalArticles = regionCookie
    ? pickArticles(
        await getArticles({
          regionSlug: regionCookie,
          limit: 20,
          locale,
          excludeIds: [...pinned],
        }),
        4,
        pinned,
      )
    : [];

  const aboveFoldIds = new Set(pinned);

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-6 sm:py-8">
      {forYou.length > 0 && (
        <section className="mb-10">
          <SectionHeading title={copy.forYou} />
          <div className="mt-2 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
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

      {featured.length > 0 ? (
        <section className="mb-10 grid gap-5 md:grid-cols-3">
          {featured.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </section>
      ) : null}

      {topics.length > 0 ? (
        <section className="mb-10">
          <SectionHeading
            title={copy.hotTopics}
            href="/topik"
            linkLabel={copy.allTopics}
          />
          <TopicChips topics={topics} />
        </section>
      ) : null}

      {regionalArticles.length > 0 && (
        <section className="mb-10">
          <SectionHeading title={copy.yourRegion} />
          <div className="divide-y divide-border border-y border-border">
            {regionalArticles.map((article) => (
              <NewsCard key={article.id} article={article} variant="horizontal" />
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-10 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <SectionHeading title={copy.latest} href="/indeks" linkLabel={copy.viewIndex} />
          <div className="divide-y divide-border border-y border-border px-0 sm:px-1">
            {latest.map((article) => (
              <NewsCard key={article.id} article={article} variant="horizontal" />
            ))}
          </div>
          <div className="mt-8">
            <InfiniteLatest
              initial={moreLatest}
              excludeIds={[...aboveFoldIds]}
              locale={locale}
            />
          </div>
        </section>

        <aside className="space-y-10 border-t border-border pt-8 lg:border-t-0 lg:pt-0">
          <AdSlot compact />
          <section>
            <SectionHeading title={copy.popular} />
            <ol className="mt-1 space-y-4">
              {popular
                .filter((article) => !aboveFoldIds.has(article.id))
                .map((article, i) => (
                  <li key={article.id} className="flex gap-3 border-b border-border pb-4 last:border-0">
                    <span className="w-6 shrink-0 font-serif text-lg font-bold text-muted-foreground">
                      {i + 1}
                    </span>
                    <div>
                      <Link
                        href={articlePublicHref(
                          article.category,
                          article.slug,
                        )}
                        className="font-medium leading-snug hover:underline"
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

          <section>
            <SectionHeading title={copy.editorPicks} />
            <ul className="mt-1 space-y-3 border-t border-border pt-3">
              {editorPicks
                .filter((article) => !aboveFoldIds.has(article.id))
                .slice(0, 5)
                .map((article) => (
                  <li key={article.id} className="border-b border-border pb-3 last:border-0">
                    <Link
                      href={articlePublicHref(article.category, article.slug)}
                      className="text-sm font-medium leading-snug hover:underline"
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
        <SectionHeading title={copy.regions} href="/daerah" linkLabel={copy.allProvinces} />
        <ul className="mt-2 divide-y divide-border border-y border-border">
          {regions.slice(0, 6).map((region) => (
            <li key={region.slug}>
              <Link
                href={`/daerah/provinsi/${region.slug}`}
                className="flex items-baseline justify-between gap-4 py-3 hover:bg-muted/40"
              >
                <span className="font-medium">{region.name}</span>
                <span className="text-xs text-muted-foreground">
                  {copy.localCoverage}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12 border border-border bg-card p-5 sm:p-6">
        <SectionHeading
          title={copy.factCheck}
          href="/cek-fakta"
          linkLabel={copy.allFactCheck}
        />
        <ul className="mt-2 divide-y divide-border">
          {factChecks.map((fc) => (
            <li key={fc.slug}>
              <Link
                href={`/cek-fakta/${fc.slug}`}
                className="block py-3 hover:bg-muted/30"
              >
                <p className="kicker">{fc.verdict.replaceAll("_", " ")}</p>
                <p className="mt-1 text-sm font-medium leading-snug">{fc.claim}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
