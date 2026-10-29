"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  bulkIgnoreRssItemsAction,
  ignoreNewRssExceptLatestAction,
  rewriteRssItemAction,
} from "@/app/actions/admin-rss";
import { RssFeedBrandMark } from "@/components/admin/rss-feed-brand";
import { Button } from "@/components/ui/button";

export type RssInboxRow = {
  id: string;
  title: string;
  status: string;
  statusLabel: string;
  pubDateLabel: string;
  feedName: string;
  feedSiteUrl: string;
  canIgnore: boolean;
  canRewrite: boolean;
};

type Copy = {
  view: string;
  ignore: string;
  actions: string;
  itemTitle: string;
  itemSource: string;
  itemStatus: string;
  itemDate: string;
  selectAll: string;
  bulkIgnore: string;
  keepTop5: string;
  keepTop10: string;
  rewriteTop3: string;
  rewriteSelected: string;
  rewritingBatch: string;
  batchDone: string;
  selected: string;
};

type FeedOption = { id: string; name: string };

export function RssInboxPanel({
  items,
  feeds,
  copy,
  newCount,
  filterFeedId,
}: {
  items: RssInboxRow[];
  feeds: FeedOption[];
  copy: Copy;
  newCount: number;
  filterFeedId: string;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [batchProgress, setBatchProgress] = useState<string | null>(null);

  const selectableIds = useMemo(
    () => items.filter((i) => i.canIgnore).map((i) => i.id),
    [items],
  );

  const rewriteCandidates = useMemo(
    () => items.filter((i) => i.canRewrite).map((i) => i.id),
    [items],
  );

  const allSelected =
    selectableIds.length > 0 &&
    selectableIds.every((id) => selected.has(id));

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
      return;
    }
    setSelected(new Set(selectableIds));
  }

  async function runBulkIgnore(ids: string[]) {
    setBusy("ignore");
    setMessage(null);
    try {
      const res = await bulkIgnoreRssItemsAction(ids);
      if (!res.ok) {
        setMessage(res.error);
        return;
      }
      setSelected(new Set());
      setMessage(`${res.count} item diabaikan.`);
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  async function runKeepTop(keep: number) {
    setBusy("keep");
    setMessage(null);
    try {
      const res = await ignoreNewRssExceptLatestAction({
        keepCount: keep,
        feedId: filterFeedId || null,
      });
      if (!res.ok) {
        setMessage("Gagal membersihkan inbox.");
        return;
      }
      setSelected(new Set());
      setMessage(
        `${res.ignored} diabaikan · ${res.kept} disimpan (terbaru).`,
      );
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  async function runBatchRewrite(ids: string[]) {
    if (ids.length === 0) return;
    setBusy("rewrite");
    setMessage(null);
    let ok = 0;
    let fail = 0;
    for (let i = 0; i < ids.length; i++) {
      setBatchProgress(`${copy.rewritingBatch} ${i + 1}/${ids.length}…`);
      const res = await rewriteRssItemAction({ itemId: ids[i]! });
      if (res.ok) ok += 1;
      else fail += 1;
    }
    setBatchProgress(null);
    setBusy(null);
    setMessage(`${copy.batchDone}: ${ok} OK${fail ? `, ${fail} gagal` : ""}.`);
    router.refresh();
  }

  const selectedArr = [...selected];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-muted/30 p-3">
        <span className="text-sm text-muted-foreground">
          {newCount} NEW
          {selected.size > 0 ? ` · ${selected.size} ${copy.selected}` : ""}
        </span>
        <div className="flex flex-wrap gap-2 sm:ml-auto">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={!!busy || selectedArr.length === 0}
            onClick={() => runBulkIgnore(selectedArr)}
          >
            {copy.bulkIgnore}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={!!busy || newCount <= 5}
            onClick={() => runKeepTop(5)}
          >
            {copy.keepTop5}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={!!busy || newCount <= 10}
            onClick={() => runKeepTop(10)}
          >
            {copy.keepTop10}
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={!!busy || rewriteCandidates.length === 0}
            onClick={() =>
              runBatchRewrite(rewriteCandidates.slice(0, 3))
            }
          >
            {copy.rewriteTop3}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={
              !!busy ||
              selectedArr.filter((id) =>
                items.find((i) => i.id === id)?.canRewrite,
              ).length === 0
            }
            onClick={() => {
              const ids = selectedArr.filter((id) =>
                items.find((i) => i.id === id)?.canRewrite,
              );
              runBatchRewrite(ids.slice(0, 5));
            }}
          >
            {copy.rewriteSelected}
          </Button>
        </div>
      </div>

      {message || batchProgress ? (
        <p className="text-sm text-muted-foreground">
          {batchProgress ?? message}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left">
              <th className="w-10 px-3 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  aria-label={copy.selectAll}
                  disabled={selectableIds.length === 0 || !!busy}
                />
              </th>
              <th className="px-3 py-3 font-medium">{copy.itemTitle}</th>
              <th className="px-3 py-3 font-medium">{copy.itemSource}</th>
              <th className="px-3 py-3 font-medium">{copy.itemStatus}</th>
              <th className="px-3 py-3 font-medium">{copy.itemDate}</th>
              <th className="px-3 py-3 font-medium">{copy.actions}</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  —
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-b border-border">
                  <td className="px-3 py-3 align-top">
                    {item.canIgnore ? (
                      <input
                        type="checkbox"
                        checked={selected.has(item.id)}
                        onChange={() => toggle(item.id)}
                        disabled={!!busy}
                        aria-label={item.title}
                      />
                    ) : null}
                  </td>
                  <td className="max-w-xs px-3 py-3 font-medium">
                    {item.title}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <RssFeedBrandMark
                        name={item.feedName}
                        siteUrl={item.feedSiteUrl}
                        size="sm"
                      />
                      <span>{item.feedName}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3">{item.statusLabel}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">
                    {item.pubDateLabel}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button variant="link" size="sm" asChild className="px-0">
                        <Link href={`/admin/rss/items/${item.id}`}>
                          {copy.view}
                        </Link>
                      </Button>
                      {item.canIgnore ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          disabled={!!busy}
                          onClick={() => runBulkIgnore([item.id])}
                        >
                          {copy.ignore}
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {feeds.length > 1 ? (
        <p className="text-xs text-muted-foreground">
          Filter feed: gunakan menu di atas inbox.
        </p>
      ) : null}
    </div>
  );
}
