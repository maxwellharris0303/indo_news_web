import {
  upsertRssFeedFormAction,
  deleteRssFeedFormAction,
} from "@/app/actions/admin-rss";
import { RssFeedBrandMark } from "@/components/admin/rss-feed-brand";
import { RssFeedPollButton } from "@/components/admin/rss-feed-poll-button";
import { Button } from "@/components/ui/button";
import { selectClassName } from "@/lib/admin/constants";
import { adminCategoryLabel, rssText } from "@/lib/admin/locale-ui";
import type { AdminLocale } from "@/lib/admin-locale";
import { feedBrandAccent, feedHostname } from "@/lib/rss/feed-brand";
import { categorySlugs } from "@/lib/site";
import type { RssFeed } from "@prisma/client";

type Copy = ReturnType<typeof rssText>;

type Author = { id: string; name: string };

export function RssFeedCard({
  feed,
  authors,
  copy,
  locale,
  newItemCount,
  showDelete,
}: {
  feed: RssFeed;
  authors: Author[];
  copy: Copy;
  locale: AdminLocale;
  newItemCount: number;
  showDelete?: boolean;
}) {
  const accent = feedBrandAccent(feed.siteUrl);
  const host = feedHostname(feed.siteUrl);

  return (
    <article className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <header
        className="flex flex-wrap items-start gap-4 border-b border-border p-4"
        style={{ borderLeftWidth: 4, borderLeftColor: accent }}
      >
        <RssFeedBrandMark name={feed.name} siteUrl={feed.siteUrl} size="lg" />
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-serif text-lg font-bold leading-tight">
              {feed.name}
            </h4>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                feed.enabled
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {feed.enabled ? copy.enabled : copy.disabled}
            </span>
          </div>
          <a
            href={feed.siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-primary hover:underline"
          >
            {host}
          </a>
          <div className="flex flex-wrap gap-2 pt-1 text-xs">
            <span className="rounded-md bg-muted px-2 py-0.5">
              {feed.defaultAiProvider === "OPENAI" ? copy.openai : copy.anthropic}
            </span>
            <span className="rounded-md bg-muted px-2 py-0.5">
              {feed.scrapeMode === "FETCH_ARTICLE"
                ? copy.scrapeFetch
                : copy.scrapeRssOnly}
            </span>
            <span className="rounded-md bg-muted px-2 py-0.5">
              {adminCategoryLabel(feed.defaultCategory, locale)}
            </span>
            {newItemCount > 0 ? (
              <span className="rounded-md bg-primary/15 px-2 py-0.5 font-medium text-primary">
                {newItemCount} {copy.inboxNew}
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-start">
          <RssFeedPollButton
            feedId={feed.id}
            label={copy.poll}
            pollingLabel={copy.polling}
          />
          {showDelete ? (
            <form action={deleteRssFeedFormAction.bind(null, feed.id)}>
              <Button type="submit" size="sm" variant="outline">
                {copy.delete}
              </Button>
            </form>
          ) : null}
        </div>
      </header>

      {feed.lastError ? (
        <p className="border-b border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {copy.error}: {feed.lastError}
        </p>
      ) : null}

      <form action={upsertRssFeedFormAction} className="space-y-3 p-4">
        <input type="hidden" name="id" value={feed.id} />
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="font-medium">{copy.fieldName}</span>
            <input
              name="name"
              required
              defaultValue={feed.name}
              className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium">{copy.fieldFeedUrl}</span>
            <input
              name="feedUrl"
              type="url"
              required
              defaultValue={feed.feedUrl}
              className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-sm font-mono text-xs"
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="font-medium">{copy.fieldSiteUrl}</span>
            <input
              name="siteUrl"
              type="url"
              required
              defaultValue={feed.siteUrl}
              className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-sm font-mono text-xs"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium">{copy.scrapeMode}</span>
            <select
              name="scrapeMode"
              defaultValue={feed.scrapeMode}
              className={`mt-1 ${selectClassName}`}
            >
              <option value="RSS_ONLY">{copy.scrapeRssOnly}</option>
              <option value="FETCH_ARTICLE">{copy.scrapeFetch}</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-medium">{copy.aiProvider}</span>
            <select
              name="defaultAiProvider"
              defaultValue={feed.defaultAiProvider}
              className={`mt-1 ${selectClassName}`}
            >
              <option value="OPENAI">{copy.openai}</option>
              <option value="ANTHROPIC">{copy.anthropic}</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-medium">{copy.fieldCategory}</span>
            <select
              name="defaultCategory"
              defaultValue={feed.defaultCategory}
              className={`mt-1 ${selectClassName}`}
            >
              {categorySlugs.map((c) => (
                <option key={c} value={c}>
                  {adminCategoryLabel(c, locale)}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-medium">{copy.fieldAuthor}</span>
            <select
              name="defaultAuthorId"
              defaultValue={feed.defaultAuthorId}
              className={`mt-1 ${selectClassName}`}
            >
              {authors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-medium">{copy.fieldPollInterval}</span>
            <input
              name="pollIntervalMinutes"
              type="number"
              min={5}
              max={1440}
              defaultValue={feed.pollIntervalMinutes}
              className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
            />
          </label>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input type="hidden" name="enabled" value="false" />
            <input
              type="checkbox"
              name="enabled"
              defaultChecked={feed.enabled}
              value="true"
            />
            {copy.enabled}
          </label>
        </div>
        <Button type="submit" size="sm">
          {copy.saveFeed}
        </Button>
      </form>
    </article>
  );
}

export function RssFeedCreateForm({
  authors,
  copy,
  locale,
}: {
  authors: Author[];
  copy: Copy;
  locale: AdminLocale;
}) {
  return (
    <form
      action={upsertRssFeedFormAction}
      className="space-y-3 rounded-xl border border-dashed border-border bg-muted/20 p-4"
    >
      <p className="text-sm font-medium">{copy.addFeed}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium">{copy.fieldName}</span>
          <input
            name="name"
            required
            className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium">{copy.fieldFeedUrl}</span>
          <input
            name="feedUrl"
            type="url"
            required
            placeholder="https://…"
            className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="font-medium">{copy.fieldSiteUrl}</span>
          <input
            name="siteUrl"
            type="url"
            required
            placeholder="https://…"
            className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium">{copy.scrapeMode}</span>
          <select name="scrapeMode" defaultValue="RSS_ONLY" className={`mt-1 ${selectClassName}`}>
            <option value="RSS_ONLY">{copy.scrapeRssOnly}</option>
            <option value="FETCH_ARTICLE">{copy.scrapeFetch}</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-medium">{copy.aiProvider}</span>
          <select name="defaultAiProvider" defaultValue="OPENAI" className={`mt-1 ${selectClassName}`}>
            <option value="OPENAI">{copy.openai}</option>
            <option value="ANTHROPIC">{copy.anthropic}</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-medium">{copy.fieldCategory}</span>
          <select name="defaultCategory" defaultValue="nasional" className={`mt-1 ${selectClassName}`}>
            {categorySlugs.map((c) => (
              <option key={c} value={c}>
                {adminCategoryLabel(c, locale)}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-medium">{copy.fieldAuthor}</span>
          <select
            name="defaultAuthorId"
            defaultValue={authors[0]?.id}
            className={`mt-1 ${selectClassName}`}
          >
            {authors.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-medium">{copy.fieldPollInterval}</span>
          <input
            name="pollIntervalMinutes"
            type="number"
            min={5}
            max={1440}
            defaultValue={30}
            className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
          />
        </label>
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input type="hidden" name="enabled" value="false" />
          <input type="checkbox" name="enabled" defaultChecked value="true" />
          {copy.enabled}
        </label>
      </div>
      <Button type="submit" size="sm">
        {copy.saveFeed}
      </Button>
    </form>
  );
}
