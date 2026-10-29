import Link from "next/link";
import {
  RssFeedCard,
  RssFeedCreateForm,
} from "@/components/admin/rss-feed-card";
import { RssInboxPanel } from "@/components/admin/rss-inbox-panel";
import { RssPollAllButton } from "@/components/admin/rss-poll-all-button";
import { Button } from "@/components/ui/button";
import { aiProviderConfigured } from "@/lib/ai/rewrite-article";
import { selectClassName } from "@/lib/admin/constants";
import { rssText, rssItemStatusLabels } from "@/lib/admin/locale-ui";
import { getAdminLocale } from "@/lib/admin-locale";
import { getAuthors } from "@/lib/content/repository";
import { prisma } from "@/lib/db";
import { formatShortAdmin } from "@/lib/format";
import type { RssItemStatus } from "@prisma/client";

export const metadata = { title: "RSS & AI" };

type Props = {
  searchParams: Promise<{ inbox?: string; feed?: string }>;
};

export default async function AdminRssPage({ searchParams }: Props) {
  const sp = await searchParams;
  const locale = await getAdminLocale();
  const copy = rssText(locale);
  const statusLabels = rssItemStatusLabels[locale];
  const authors = await getAuthors();
  const feeds = await prisma.rssFeed.findMany({ orderBy: { name: "asc" } });
  const feedFilter = sp.feed?.trim() ?? "";
  const inboxFilter = sp.inbox === "all" ? "all" : "new";

  const newCounts = await prisma.rssItem.groupBy({
    by: ["feedId"],
    where: { status: "NEW" },
    _count: { _all: true },
  });
  const newByFeed = new Map(
    newCounts.map((r) => [r.feedId, r._count._all]),
  );
  const totalNew = [...newByFeed.values()].reduce((a, b) => a + b, 0);

  const inboxWhere =
    inboxFilter === "new"
      ? {
          status: "NEW" as RssItemStatus,
          ...(feedFilter ? { feedId: feedFilter } : {}),
        }
      : {
          status: { not: "IGNORED" as RssItemStatus },
          ...(feedFilter ? { feedId: feedFilter } : {}),
        };

  const [items, inboxTotal] = await Promise.all([
    prisma.rssItem.findMany({
      where: inboxWhere,
      orderBy: { pubDate: "desc" },
      take: 80,
      include: { feed: { select: { name: true, siteUrl: true } } },
    }),
    prisma.rssItem.count({ where: inboxWhere }),
  ]);

  const openaiOk = aiProviderConfigured("OPENAI");
  const anthropicOk = aiProviderConfigured("ANTHROPIC");

  const inboxRows = items.map((item) => ({
    id: item.id,
    title: item.title,
    status: item.status,
    statusLabel: statusLabels[item.status] ?? item.status,
    pubDateLabel: item.pubDate
      ? formatShortAdmin(item.pubDate, locale)
      : "—",
    feedName: item.feed.name,
    feedSiteUrl: item.feed.siteUrl,
    canIgnore: item.status !== "DRAFT_CREATED" && item.status !== "IGNORED",
    canRewrite:
      !item.articleId &&
      (item.status === "NEW" ||
        item.status === "FAILED" ||
        item.status === "QUEUED"),
  }));

  function filterHref(next: { inbox?: string; feed?: string }) {
    const params = new URLSearchParams();
    const inbox = next.inbox ?? inboxFilter;
    const feed = next.feed ?? feedFilter;
    if (inbox === "all") params.set("inbox", "all");
    if (feed) params.set("feed", feed);
    const qs = params.toString();
    return qs ? `/admin/rss?${qs}` : "/admin/rss";
  }

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
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="font-serif text-lg font-bold">{copy.inbox}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {copy.inboxShowing} {items.length}/{inboxTotal} · {totalNew} NEW
              total
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant={inboxFilter === "new" ? "default" : "outline"}
              asChild
            >
              <Link href={filterHref({ inbox: "new" })}>
                {copy.inboxFilterNew}
              </Link>
            </Button>
            <Button
              size="sm"
              variant={inboxFilter === "all" ? "default" : "outline"}
              asChild
            >
              <Link href={filterHref({ inbox: "all" })}>
                {copy.inboxFilterAll}
              </Link>
            </Button>
            {feeds.length > 0 ? (
              <form method="get" className="flex items-end gap-2">
                {inboxFilter === "all" ? (
                  <input type="hidden" name="inbox" value="all" />
                ) : null}
                <label className="text-xs font-medium text-muted-foreground">
                  {copy.inboxFilterFeed}
                  <select
                    name="feed"
                    defaultValue={feedFilter}
                    className={`ml-1 mt-1 block ${selectClassName} h-9 text-xs`}
                  >
                    <option value="">—</option>
                    {feeds.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </label>
                <Button type="submit" size="sm" variant="outline">
                  OK
                </Button>
              </form>
            ) : null}
          </div>
        </div>

        {items.length === 0 ? (
          <p className="rounded-xl border border-border bg-card px-4 py-10 text-center text-muted-foreground">
            {copy.emptyInbox}
          </p>
        ) : (
          <RssInboxPanel
            items={inboxRows}
            feeds={feeds.map((f) => ({ id: f.id, name: f.name }))}
            copy={copy}
            newCount={
              feedFilter
                ? (newByFeed.get(feedFilter) ?? 0)
                : totalNew
            }
            filterFeedId={feedFilter}
          />
        )}
      </section>

      <details className="rounded-xl border border-border bg-card p-4">
        <summary className="cursor-pointer font-serif text-lg font-bold">
          {copy.feeds}
        </summary>
        <p className="mt-2 text-sm text-muted-foreground">{copy.feedsHint}</p>
        <div className="mt-4 grid gap-5 xl:grid-cols-2">
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
        <div className="mt-4">
          <RssFeedCreateForm authors={authors} copy={copy} locale={locale} />
        </div>
      </details>
    </div>
  );
}
