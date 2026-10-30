import Link from "next/link";
import type { ArticleStatus, EditorialOrigin } from "@prisma/client";
import { AdminUrgentPanel } from "@/components/admin/admin-urgent-panel";
import { ArticleListPanel } from "@/components/admin/article-list-panel";
import { getAdminUrgentSummary } from "@/lib/admin/urgent-summary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ARTICLE_STATUSES,
  EDITORIAL_ORIGINS,
  selectClassName,
} from "@/lib/admin/constants";
import { listAdminArticles } from "@/lib/admin/dashboard";
import {
  actionsText,
  adminCategoryLabel,
  adminStatusLabels,
  articlesText,
  formatCountAdmin,
} from "@/lib/admin/locale-ui";
import { getAdminLocale } from "@/lib/admin-locale";
import { formatShortAdmin } from "@/lib/format";
import { categorySlugs, isCategorySlug } from "@/lib/site";

type Props = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    category?: string;
    page?: string;
    origin?: string;
    saved?: string;
    slug?: string;
  }>;
};

export const metadata = { title: "Kelola Artikel" };

export default async function AdminArticlesPage({ searchParams }: Props) {
  const locale = await getAdminLocale();
  const copy = articlesText(locale);
  const actionCopy = actionsText(locale);
  const statusLabels = adminStatusLabels[locale];
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const status =
    sp.status && ARTICLE_STATUSES.includes(sp.status as ArticleStatus)
      ? (sp.status as ArticleStatus)
      : undefined;
  const category =
    sp.category && isCategorySlug(sp.category) ? sp.category : undefined;
  const editorialOrigin =
    sp.origin && EDITORIAL_ORIGINS.includes(sp.origin as EditorialOrigin)
      ? (sp.origin as EditorialOrigin)
      : undefined;

  const [{ items, total, totalPages, pageSize }, urgentSummary] =
    await Promise.all([
      listAdminArticles({
        q: sp.q,
        status,
        category,
        editorialOrigin,
        page,
      }),
      getAdminUrgentSummary("id"),
    ]);

  function pageHref(nextPage: number) {
    const params = new URLSearchParams();
    if (sp.q) params.set("q", sp.q);
    if (status) params.set("status", status);
    if (category) params.set("category", category);
    if (editorialOrigin) params.set("origin", editorialOrigin);
    if (nextPage > 1) params.set("page", String(nextPage));
    const qs = params.toString();
    return qs ? `/admin/artikel?${qs}` : "/admin/artikel";
  }

  const returnTo = pageHref(page);
  const now = Date.now();

  function rowBreakingActive(
    isBreaking: boolean,
    breakingExpiresAt: Date | null,
  ) {
    if (!isBreaking) return false;
    if (!breakingExpiresAt) return true;
    return breakingExpiresAt.getTime() > now;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl font-bold sm:text-2xl">
            {copy.title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {locale === "en"
              ? `${total.toLocaleString("en-US")} articles · page ${page} of ${totalPages}`
              : `${total.toLocaleString("id-ID")} artikel · halaman ${page} dari ${totalPages}`}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/artikel/baru">{copy.new}</Link>
        </Button>
      </div>

      {sp.saved === "1" ? (
        <div
          className="rounded-lg border border-trust/40 bg-trust/10 px-4 py-3 text-sm text-trust"
          role="status"
        >
          {copy.saved}
          {sp.slug ? (
            <>
              {" "}
              · slug:{" "}
              <code className="rounded bg-card px-1">{sp.slug}</code>
            </>
          ) : null}
        </div>
      ) : null}

      <form
        method="get"
        className="grid gap-3 rounded-xl border border-border bg-card p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-5"
      >
        <label className="text-sm lg:col-span-2">
          <span className="font-medium">{copy.search}</span>
          <Input
            name="q"
            defaultValue={sp.q ?? ""}
            placeholder={copy.searchPh}
            className="mt-1.5"
          />
        </label>
        <label className="text-sm">
          <span className="font-medium">{copy.status}</span>
          <select
            name="status"
            defaultValue={status ?? ""}
            className={`mt-1.5 ${selectClassName}`}
          >
            <option value="">{copy.allStatus}</option>
            {ARTICLE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {statusLabels[s]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="font-medium">{copy.channel}</span>
          <select
            name="category"
            defaultValue={category ?? ""}
            className={`mt-1.5 ${selectClassName}`}
          >
            <option value="">{copy.allChannels}</option>
            {categorySlugs.map((c) => (
              <option key={c} value={c}>
                {adminCategoryLabel(c, locale)}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="font-medium">{copy.origin}</span>
          <select
            name="origin"
            defaultValue={editorialOrigin ?? ""}
            className={`mt-1.5 ${selectClassName}`}
          >
            <option value="">{copy.allOrigins}</option>
            <option value="ORIGINAL">{copy.originOriginal}</option>
            <option value="RSS_REWRITE">{copy.originRss}</option>
          </select>
        </label>
        <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-5">
          <Button type="submit">{copy.apply}</Button>
          {(sp.q || status || category || editorialOrigin) && (
            <Button type="button" variant="outline" asChild>
              <Link href="/admin/artikel">{copy.reset}</Link>
            </Button>
          )}
        </div>
      </form>

      <AdminUrgentPanel
        breaking={urgentSummary.breaking}
        developing={urgentSummary.developing}
        locale={locale}
        copy={copy.urgentPanel}
        returnTo={returnTo}
      />

      <ArticleListPanel
        items={items.map((a) => ({
          id: a.id,
          title: a.title,
          meta: `${adminCategoryLabel(a.category, locale)} · ${a.locale.toUpperCase()} · ${formatShortAdmin(a.publishedAt, locale)}`,
          status: a.status,
          viewCountLabel: formatCountAdmin(a.viewCount, locale),
          category: a.category,
          slug: a.slug,
          isBreaking: rowBreakingActive(a.isBreaking, a.breakingExpiresAt),
          isDeveloping: a.isDeveloping,
          featuredLevel: a.featuredLevel,
          editorialOrigin: a.editorialOrigin,
        }))}
        copy={copy}
        actionCopy={actionCopy}
        statusLabels={statusLabels}
        locale={locale}
        returnTo={returnTo}
      />

      {totalPages > 1 ? (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {page > 1 ? (
            <Button variant="outline" size="sm" asChild>
              <Link href={pageHref(page - 1)}>{copy.prev}</Link>
            </Button>
          ) : null}
          <span className="px-2 text-sm text-muted-foreground">
            {page} / {totalPages} · {pageSize} {copy.perPage}
          </span>
          {page < totalPages ? (
            <Button variant="outline" size="sm" asChild>
              <Link href={pageHref(page + 1)}>{copy.next}</Link>
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
