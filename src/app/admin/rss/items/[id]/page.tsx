import Link from "next/link";
import { notFound } from "next/navigation";
import {
  rewriteRssItemFormAction,
  ignoreRssItemFormAction,
} from "@/app/actions/admin-rss";
import { Button } from "@/components/ui/button";
import { aiProviderConfigured } from "@/lib/ai/rewrite-article";
import { selectClassName } from "@/lib/admin/constants";
import { rssText, rssItemStatusLabels } from "@/lib/admin/locale-ui";
import { getAdminLocale } from "@/lib/admin-locale";
import { prisma } from "@/lib/db";
import { formatShortAdmin } from "@/lib/format";
import { articlePublicHref } from "@/lib/admin/article-url";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminRssItemPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const locale = await getAdminLocale();
  const copy = rssText(locale);
  const statusLabels = rssItemStatusLabels[locale];

  const item = await prisma.rssItem.findUnique({
    where: { id },
    include: {
      feed: true,
      rewriteJobs: { orderBy: { createdAt: "desc" }, take: 5 },
      article: { select: { id: true, slug: true, category: true, title: true } },
    },
  });
  if (!item) notFound();

  const previewBody =
    item.extractedBody ||
    item.contentRaw?.replace(/<[^>]+>/g, " ").slice(0, 4000) ||
    item.summaryRaw ||
    "";

  const lastJob = item.rewriteJobs[0];
  const openaiOk = aiProviderConfigured("OPENAI");
  const anthropicOk = aiProviderConfigured("ANTHROPIC");

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/rss"
          className="text-sm text-primary hover:underline"
        >
          ← RSS
        </Link>
        <h2 className="mt-2 font-serif text-xl font-bold">{item.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {item.feed.name} · {statusLabels[item.status] ?? item.status}
          {item.pubDate
            ? ` · ${formatShortAdmin(item.pubDate, locale)}`
            : null}
        </p>
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-block text-sm text-primary hover:underline"
        >
          {item.link}
        </a>
      </div>

      {sp.error ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {decodeURIComponent(sp.error)}
        </div>
      ) : null}

      {item.lastError ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {item.lastError}
        </div>
      ) : null}

      {item.article ? (
        <div className="rounded-lg border border-trust/40 bg-trust/10 px-4 py-3 text-sm">
          Artikel REVIEW:{" "}
          <Link
            href={articlePublicHref(item.article.category, item.article.slug)}
            className="font-medium text-primary hover:underline"
          >
            {item.article.title}
          </Link>{" "}
          ·{" "}
          <Link href="/admin/artikel" className="text-primary hover:underline">
            daftar artikel
          </Link>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-card p-4">
          <h3 className="font-semibold">Source preview</h3>
          <p className="mt-2 max-h-96 overflow-y-auto whitespace-pre-wrap text-sm text-muted-foreground">
            {previewBody || "(Konten belum diekstrak — gunakan scrape halaman.)"}
          </p>
        </section>

        <section className="rounded-xl border border-border bg-card p-4">
          <h3 className="font-semibold">{copy.rewriteOptions}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {copy.overrideHint} {copy.feedDefaults}:{" "}
            {item.feed.scrapeMode === "FETCH_ARTICLE"
              ? copy.scrapeFetch
              : copy.scrapeRssOnly}{" "}
            ·{" "}
            {item.feed.defaultAiProvider === "ANTHROPIC"
              ? copy.anthropic
              : copy.openai}
          </p>
          {!item.articleId && item.status !== "REWRITING" ? (
            <form action={rewriteRssItemFormAction} className="mt-4 space-y-3">
              <input type="hidden" name="itemId" value={item.id} />
              <label className="block text-sm">
                <span className="font-medium">{copy.scrapeMode}</span>
                <select
                  name="scrapeMode"
                  defaultValue={item.feed.scrapeMode}
                  className={`mt-1 ${selectClassName}`}
                >
                  <option value="RSS_ONLY">{copy.scrapeRssOnly}</option>
                  <option value="FETCH_ARTICLE">{copy.scrapeFetch}</option>
                </select>
              </label>
              <label className="block text-sm">
                <span className="font-medium">{copy.aiProvider}</span>
                <select
                  name="aiProvider"
                  defaultValue={item.feed.defaultAiProvider}
                  className={`mt-1 ${selectClassName}`}
                >
                  <option value="OPENAI" disabled={!openaiOk}>
                    {copy.openai}
                    {!openaiOk ? ` (${copy.missing})` : ""}
                  </option>
                  <option value="ANTHROPIC" disabled={!anthropicOk}>
                    {copy.anthropic}
                    {!anthropicOk ? ` (${copy.missing})` : ""}
                  </option>
                </select>
              </label>
              <Button type="submit">{copy.rewrite}</Button>
            </form>
          ) : null}
          {!item.articleId ? (
            <form
              action={ignoreRssItemFormAction.bind(null, item.id)}
              className="mt-3"
            >
              <Button type="submit" variant="outline" size="sm">
                {copy.ignore}
              </Button>
            </form>
          ) : null}
        </section>
      </div>

      {lastJob?.outputJson ? (
        <section className="rounded-xl border border-border bg-card p-4">
          <h3 className="font-semibold">Last rewrite output</h3>
          <pre className="mt-2 max-h-80 overflow-auto rounded bg-muted p-3 text-xs">
            {JSON.stringify(JSON.parse(lastJob.outputJson), null, 2)}
          </pre>
        </section>
      ) : null}
    </div>
  );
}
