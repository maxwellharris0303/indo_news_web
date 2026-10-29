import Link from "next/link";
import {
  RssFeedCard,
  RssFeedCreateForm,
} from "@/components/admin/rss-feed-card";
import { RssFeedBrandMark } from "@/components/admin/rss-feed-brand";
import { RssPollAllButton } from "@/components/admin/rss-poll-all-button";
import { Button } from "@/components/ui/button";
import { aiProviderConfigured } from "@/lib/ai/rewrite-article";
import { rssText, rssItemStatusLabels } from "@/lib/admin/locale-ui";
import { getAdminLocale } from "@/lib/admin-locale";
import { getAuthors } from "@/lib/content/repository";
import { prisma } from "@/lib/db";
import { formatShortAdmin } from "@/lib/format";
import { ignoreRssItemFormAction } from "@/app/actions/admin-rss";

export const metadata = { title: "RSS & AI" };

export default async function AdminRssPage() {
  const locale = await getAdminLocale();
  const copy = rssText(locale);
  const statusLabels = rssItemStatusLabels[locale];
  const authors = await getAuthors();
  const feeds = await prisma.rssFeed.findMany({ orderBy: { name: "asc" } });
  const newCounts = await prisma.rssItem.groupBy({
    by: ["feedId"],
    where: { status: "NEW" },
    _count: { _all: true },
  });
  const newByFeed = new Map(
    newCounts.map((r) => [r.feedId, r._count._all]),
  );

  const items = await prisma.rssItem.findMany({
    where: { status: { not: "IGNORED" } },
    orderBy: { pubDate: "desc" },
    take: 50,
    include: { feed: { select: { name: true, siteUrl: true } } },
  });

  const openaiOk = aiProviderConfigured("OPENAI");
  const anthropicOk = aiProviderConfigured("ANTHROPIC");

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl font-bold sm:text-2xl">
            {copy.title}
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {copy.subtitle}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span
              className={`rounded-full px-2.5 py-1 ${
                openaiOk
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {copy.openaiKey}: {openaiOk ? copy.configured : copy.missing}
            </span>
            <span
              className={`rounded-full px-2.5 py-1 ${
                anthropicOk
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {copy.anthropicKey}:{" "}
              {anthropicOk ? copy.configured : copy.missing}
            </span>
          </div>
        </div>
        <RssPollAllButton label={copy.pollAll} />
      </div>

      <section className="space-y-4">
        <div>
          <h3 className="font-serif text-lg font-bold">{copy.feeds}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{copy.feedsHint}</p>
        </div>
        <div className="grid gap-5 xl:grid-cols-2">
          {feeds.map((feed) => (
            <div key={feed.id} className="space-y-1">
              <p className="px-1 text-xs text-muted-foreground">
                {copy.lastFetch}:{" "}
                {feed.lastFetchedAt
                  ? formatShortAdmin(feed.lastFetchedAt, locale)
                  : "—"}
              </p>
              <RssFeedCard
                feed={feed}
                authors={authors}
                copy={copy}
                locale={locale}
                newItemCount={newByFeed.get(feed.id) ?? 0}
                showDelete
              />
            </div>
          ))}
        </div>
        <RssFeedCreateForm authors={authors} copy={copy} locale={locale} />
      </section>

      <section className="space-y-4">
        <h3 className="font-serif text-lg font-bold">{copy.inbox}</h3>
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left">
                <th className="px-4 py-3 font-medium">{copy.itemTitle}</th>
                <th className="px-4 py-3 font-medium">{copy.itemSource}</th>
                <th className="px-4 py-3 font-medium">{copy.itemStatus}</th>
                <th className="px-4 py-3 font-medium">{copy.itemDate}</th>
                <th className="px-4 py-3 font-medium">{copy.actions}</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-muted-foreground"
                  >
                    {copy.emptyInbox}
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="border-b border-border">
                    <td className="max-w-xs px-4 py-3 font-medium">
                      {item.title}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <RssFeedBrandMark
                          name={item.feed.name}
                          siteUrl={item.feed.siteUrl}
                          size="sm"
                        />
                        <span>{item.feed.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {statusLabels[item.status] ?? item.status}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {item.pubDate
                        ? formatShortAdmin(item.pubDate, locale)
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button variant="link" size="sm" asChild className="px-0">
                          <Link href={`/admin/rss/items/${item.id}`}>
                            {copy.view}
                          </Link>
                        </Button>
                        {item.status !== "DRAFT_CREATED" ? (
                          <form
                            action={ignoreRssItemFormAction.bind(null, item.id)}
                          >
                            <Button type="submit" size="sm" variant="ghost">
                              {copy.ignore}
                            </Button>
                          </form>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
