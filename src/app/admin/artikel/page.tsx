import Link from "next/link";
import type { ArticleStatus } from "@prisma/client";
import { ArticleRowActions } from "@/components/admin/article-row-actions";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ARTICLE_STATUSES,
  selectClassName,
  STATUS_LABELS,
} from "@/lib/admin/constants";
import { listAdminArticles } from "@/lib/admin/dashboard";
import { formatShortWIB } from "@/lib/format";
import { categoryLabels, categorySlugs, isCategorySlug } from "@/lib/site";

type Props = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    category?: string;
    page?: string;
    saved?: string;
    slug?: string;
  }>;
};

export const metadata = { title: "Kelola Artikel" };

export default async function AdminArticlesPage({ searchParams }: Props) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const status =
    sp.status && ARTICLE_STATUSES.includes(sp.status as ArticleStatus)
      ? (sp.status as ArticleStatus)
      : undefined;
  const category =
    sp.category && isCategorySlug(sp.category) ? sp.category : undefined;

  const { items, total, totalPages, pageSize } = await listAdminArticles({
    q: sp.q,
    status,
    category,
    page,
  });

  function pageHref(nextPage: number) {
    const params = new URLSearchParams();
    if (sp.q) params.set("q", sp.q);
    if (status) params.set("status", status);
    if (category) params.set("category", category);
    if (nextPage > 1) params.set("page", String(nextPage));
    const qs = params.toString();
    return qs ? `/admin/artikel?${qs}` : "/admin/artikel";
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl font-bold sm:text-2xl">
            Daftar artikel
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {total.toLocaleString("id-ID")} artikel · halaman {page} dari{" "}
            {totalPages}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/artikel/baru">+ Tulis baru</Link>
        </Button>
      </div>

      {sp.saved === "1" ? (
        <div
          className="rounded-lg border border-trust/40 bg-trust/10 px-4 py-3 text-sm text-trust"
          role="status"
        >
          Artikel berhasil disimpan
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
        className="grid gap-3 rounded-xl border border-border bg-card p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4"
      >
        <label className="text-sm lg:col-span-2">
          <span className="font-medium">Cari judul</span>
          <Input
            name="q"
            defaultValue={sp.q ?? ""}
            placeholder="Kata kunci..."
            className="mt-1.5"
          />
        </label>
        <label className="text-sm">
          <span className="font-medium">Status</span>
          <select
            name="status"
            defaultValue={status ?? ""}
            className={`mt-1.5 ${selectClassName}`}
          >
            <option value="">Semua status</option>
            {ARTICLE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="font-medium">Kanal</span>
          <select
            name="category"
            defaultValue={category ?? ""}
            className={`mt-1.5 ${selectClassName}`}
          >
            <option value="">Semua kanal</option>
            {categorySlugs.map((c) => (
              <option key={c} value={c}>
                {categoryLabels[c]}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-4">
          <Button type="submit">Terapkan filter</Button>
          {(sp.q || status || category) && (
            <Button type="button" variant="outline" asChild>
              <Link href="/admin/artikel">Reset</Link>
            </Button>
          )}
        </div>
      </form>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="hidden grid-cols-[1fr_auto_auto_auto] gap-4 border-b border-border bg-muted/40 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:grid">
          <span>Judul</span>
          <span className="w-28 text-center">Status</span>
          <span className="w-24 text-right">Views</span>
          <span className="w-[min(100%,14rem)]">Aksi</span>
        </div>
        <ul className="divide-y divide-border">
          {items.length === 0 ? (
            <li className="px-4 py-12 text-center text-muted-foreground">
              Tidak ada artikel untuk filter ini.
            </li>
          ) : (
            items.map((a) => (
              <li
                key={a.id}
                className="grid gap-3 px-4 py-4 md:grid-cols-[1fr_auto_auto_auto] md:items-center md:gap-4"
              >
                <div className="min-w-0">
                  <p className="font-medium leading-snug">{a.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {categoryLabels[a.category as keyof typeof categoryLabels]} ·{" "}
                    {a.locale.toUpperCase()} · {formatShortWIB(a.publishedAt)}
                  </p>
                </div>
                <div className="md:w-28 md:text-center">
                  <StatusBadge status={a.status} />
                </div>
                <p className="text-sm tabular-nums md:w-24 md:text-right">
                  {a.viewCount.toLocaleString("id-ID")}
                </p>
                <div className="md:w-[min(100%,14rem)]">
                  <ArticleRowActions
                    id={a.id}
                    title={a.title}
                    category={a.category}
                    slug={a.slug}
                    status={a.status}
                    compact
                  />
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      {totalPages > 1 ? (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {page > 1 ? (
            <Button variant="outline" size="sm" asChild>
              <Link href={pageHref(page - 1)}>← Sebelumnya</Link>
            </Button>
          ) : null}
          <span className="px-2 text-sm text-muted-foreground">
            {page} / {totalPages} · {pageSize} per halaman
          </span>
          {page < totalPages ? (
            <Button variant="outline" size="sm" asChild>
              <Link href={pageHref(page + 1)}>Berikutnya →</Link>
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
