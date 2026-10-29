import {
  upsertRssFeedFormAction,
  deleteRssFeedFormAction,
  pollRssFeedFormAction,
} from "@/app/actions/admin-rss";
import { Button } from "@/components/ui/button";
import { selectClassName } from "@/lib/admin/constants";
import { rssText } from "@/lib/admin/locale-ui";
import { categoryLabels, categorySlugs } from "@/lib/site";
import type { RssFeed } from "@prisma/client";

type Copy = ReturnType<typeof rssText>;

type Author = { id: string; name: string };

export function RssFeedForm({
  feed,
  authors,
  copy,
  showDelete,
}: {
  feed?: RssFeed;
  authors: Author[];
  copy: Copy;
  showDelete?: boolean;
}) {
  return (
    <form
      action={upsertRssFeedFormAction}
      className="space-y-3 rounded-lg border border-border bg-muted/30 p-4"
    >
      {feed ? <input type="hidden" name="id" value={feed.id} /> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium">Name</span>
          <input
            name="name"
            required
            defaultValue={feed?.name}
            className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Feed URL</span>
          <input
            name="feedUrl"
            type="url"
            required
            defaultValue={feed?.feedUrl}
            className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="font-medium">Site URL</span>
          <input
            name="siteUrl"
            type="url"
            required
            defaultValue={feed?.siteUrl}
            className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium">{copy.scrapeMode}</span>
          <select
            name="scrapeMode"
            defaultValue={feed?.scrapeMode ?? "RSS_ONLY"}
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
            defaultValue={feed?.defaultAiProvider ?? "OPENAI"}
            className={`mt-1 ${selectClassName}`}
          >
            <option value="OPENAI">{copy.openai}</option>
            <option value="ANTHROPIC">{copy.anthropic}</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-medium">Kanal / category</span>
          <select
            name="defaultCategory"
            defaultValue={feed?.defaultCategory ?? "nasional"}
            className={`mt-1 ${selectClassName}`}
          >
            {categorySlugs.map((c) => (
              <option key={c} value={c}>
                {categoryLabels[c]}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-medium">Author</span>
          <select
            name="defaultAuthorId"
            defaultValue={feed?.defaultAuthorId ?? authors[0]?.id}
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
          <span className="font-medium">Poll interval (min)</span>
          <input
            name="pollIntervalMinutes"
            type="number"
            min={5}
            max={1440}
            defaultValue={feed?.pollIntervalMinutes ?? 30}
            className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
          />
        </label>
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input type="hidden" name="enabled" value="false" />
          <input
            type="checkbox"
            name="enabled"
            defaultChecked={feed?.enabled ?? true}
            value="true"
          />
          {copy.enabled}
        </label>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="sm">
          {copy.saveFeed}
        </Button>
        {feed ? (
          <form action={pollRssFeedFormAction.bind(null, feed.id)}>
            <Button type="submit" size="sm" variant="secondary">
              {copy.poll}
            </Button>
          </form>
        ) : null}
        {feed && showDelete ? (
          <form action={deleteRssFeedFormAction.bind(null, feed.id)}>
            <Button type="submit" size="sm" variant="outline">
              {copy.delete}
            </Button>
          </form>
        ) : null}
      </div>
    </form>
  );
}
