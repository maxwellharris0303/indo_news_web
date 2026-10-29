"use client";

import type { ArticleStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { bulkUpdateArticleStatusAction } from "@/app/actions/admin";
import { ArticleRowActions } from "@/components/admin/article-row-actions";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import type { AdminLocale } from "@/lib/admin-locale";
import type { actionsText, adminStatusLabels } from "@/lib/admin/locale-ui";

export type ArticleListRow = {
  id: string;
  title: string;
  meta: string;
  status: ArticleStatus;
  viewCountLabel: string;
  category: string;
  slug: string;
};

type Copy = {
  colTitle: string;
  colStatus: string;
  colViews: string;
  colActions: string;
  empty: string;
  selectAll: string;
  bulkPublishSelected: string;
  bulkPublishReviewPage: string;
  bulkArchiveSelected: string;
  selected: string;
  bulkDone: string;
};

type ActionCopy = ReturnType<typeof actionsText>;
type StatusLabels = (typeof adminStatusLabels)[AdminLocale];

export function ArticleListPanel({
  items,
  copy,
  actionCopy,
  statusLabels,
  locale,
}: {
  items: ArticleListRow[];
  copy: Copy;
  actionCopy: ActionCopy;
  statusLabels: StatusLabels;
  locale: AdminLocale;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const reviewOnPage = useMemo(
    () => items.filter((i) => i.status === "REVIEW").map((i) => i.id),
    [items],
  );

  const allSelected =
    items.length > 0 && items.every((i) => selected.has(i.id));

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(items.map((i) => i.id)));
  }

  async function bulkSetStatus(ids: string[], status: ArticleStatus) {
    if (ids.length === 0) return;
    setBusy(true);
    setMessage(null);
    try {
      const res = await bulkUpdateArticleStatusAction(ids, status);
      if (!res.ok) {
        setMessage(res.error);
        return;
      }
      setSelected(new Set());
      setMessage(`${copy.bulkDone}: ${res.count} artikel → ${statusLabels[status]}.`);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const selectedIds = [...selected];

  return (
    <div className="space-y-3">
      {items.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-muted/30 p-3">
          <span className="text-sm text-muted-foreground">
            {selected.size > 0
              ? `${selected.size} ${copy.selected}`
              : `${items.length} artikel`}
          </span>
          <div className="flex flex-wrap gap-2 sm:ml-auto">
            <Button
              type="button"
              size="sm"
              disabled={busy || selectedIds.length === 0}
              onClick={() => bulkSetStatus(selectedIds, "PUBLISHED")}
            >
              {copy.bulkPublishSelected}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={busy || reviewOnPage.length === 0}
              onClick={() => bulkSetStatus(reviewOnPage, "PUBLISHED")}
            >
              {copy.bulkPublishReviewPage}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={busy || selectedIds.length === 0}
              onClick={() => bulkSetStatus(selectedIds, "ARCHIVED")}
            >
              {copy.bulkArchiveSelected}
            </Button>
          </div>
        </div>
      ) : null}

      {message ? (
        <p className="rounded-lg border border-trust/40 bg-trust/10 px-3 py-2 text-sm">
          {message}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="hidden grid-cols-[auto_1fr_auto_auto_auto] gap-4 border-b border-border bg-muted/40 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:grid">
          <span className="w-8">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleAll}
              disabled={items.length === 0 || busy}
              aria-label={copy.selectAll}
            />
          </span>
          <span>{copy.colTitle}</span>
          <span className="w-28 text-center">{copy.colStatus}</span>
          <span className="w-24 text-right">{copy.colViews}</span>
          <span className="min-w-[13rem]">{copy.colActions}</span>
        </div>
        <ul className="divide-y divide-border">
          {items.length === 0 ? (
            <li className="px-4 py-12 text-center text-muted-foreground">
              {copy.empty}
            </li>
          ) : (
            items.map((a) => (
              <li
                key={a.id}
                className="grid gap-3 px-4 py-4 md:grid-cols-[auto_1fr_auto_auto_auto] md:items-center md:gap-4"
              >
                <div className="flex items-start pt-1 md:pt-0">
                  <input
                    type="checkbox"
                    checked={selected.has(a.id)}
                    onChange={() => toggle(a.id)}
                    disabled={busy}
                    aria-label={a.title}
                  />
                </div>
                <div className="min-w-0 md:col-start-2">
                  <p className="font-medium leading-snug">{a.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{a.meta}</p>
                </div>
                <div className="md:w-28 md:text-center">
                  <StatusBadge status={a.status} locale={locale} />
                </div>
                <p className="text-sm tabular-nums md:w-24 md:text-right">
                  {a.viewCountLabel}
                </p>
                <div className="md:min-w-[13rem] md:justify-self-end">
                  <ArticleRowActions
                    id={a.id}
                    title={a.title}
                    category={a.category}
                    slug={a.slug}
                    status={a.status}
                    compact
                    copy={actionCopy}
                    statusLabels={statusLabels}
                  />
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
