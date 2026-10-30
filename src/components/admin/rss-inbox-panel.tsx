"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  batchRewriteRssItemsAction,
  bulkIgnoreRssItemsAction,
  getRssBatchProgressAction,
  ignoreNewRssExceptLatestAction,
} from "@/app/actions/admin-rss";
import {
  clearRssBatchJob,
  loadRssBatchJob,
  saveRssBatchJob,
  type RssBatchJob,
} from "@/lib/rss/batch-job-client";
import { RssFeedBrandMark } from "@/components/admin/rss-feed-brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  rewriteCount: string;
  rewriteCountAria: string;
  rewritingBatch: string;
  batchDone: string;
  batchRunning: string;
  batchBackgroundHint: string;
  batchProgressDone: string;
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
  const [rewriteCount, setRewriteCount] = useState("10");

  function parseRewriteCount(raw: string, fallback: number): number {
    const n = parseInt(raw, 10);
    if (!Number.isFinite(n) || n < 1) return fallback;
    return n;
  }

  function takeBatchIds(ids: string[]): string[] {
    const n = parseRewriteCount(rewriteCount, ids.length);
    return ids.slice(0, n);
  }

  const syncBatchFromServer = useCallback(
    async (job: RssBatchJob, refreshPage: boolean) => {
      const prog = await getRssBatchProgressAction(job.itemIds);
      if (!prog.ok) return;
      const doneCount = prog.completed + prog.failed;
      const progressText = `${copy.batchRunning}: ${doneCount}/${prog.total} ${copy.batchProgressDone}${prog.rewriting > 0 ? ` (${prog.rewriting} aktif)` : ""}`;

      if (doneCount >= prog.total) {
        const ok = prog.completed;
        const fail = prog.failed;
        const message = `${copy.batchDone}: ${ok} OK${fail ? `, ${fail} gagal` : ""}.`;
        const finished: RssBatchJob = {
          ...job,
          status: "done",
          ok,
          fail,
          message,
        };
        saveRssBatchJob(finished);
        setBatchProgress(null);
        setMessage(message);
        setBusy(null);
        if (refreshPage) router.refresh();
        return;
      }

      saveRssBatchJob({
        ...job,
        status: "running",
        ok: prog.completed,
        fail: prog.failed,
        message: progressText,
      });
      setBatchProgress(progressText);
      setBusy("rewrite");
    },
    [copy.batchDone, copy.batchProgressDone, copy.batchRunning, router],
  );

  useEffect(() => {
    const job = loadRssBatchJob();
    if (!job) return;
    if (job.status === "done") {
      setMessage(job.message);
      return;
    }
    void syncBatchFromServer(job, false);
    const interval = window.setInterval(() => {
      const current = loadRssBatchJob();
      if (!current || current.status === "done") {
        window.clearInterval(interval);
        return;
      }
      void syncBatchFromServer(current, true);
    }, 4000);
    return () => window.clearInterval(interval);
  }, [syncBatchFromServer]);

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
    const batchIds = takeBatchIds(ids);
    if (batchIds.length === 0) return;

    const job: RssBatchJob = {
      itemIds: batchIds,
      startedAt: Date.now(),
      status: "running",
      ok: 0,
      fail: 0,
      message: `${copy.batchRunning}: 0/${batchIds.length}…`,
    };
    saveRssBatchJob(job);
    setBusy("rewrite");
    setMessage(null);
    setBatchProgress(`${copy.batchRunning}: 0/${batchIds.length}… · ${copy.batchBackgroundHint}`);

    try {
      const res = await batchRewriteRssItemsAction(batchIds);
      if (!res.ok) {
        setMessage(res.error);
        clearRssBatchJob();
        return;
      }
      const ok = res.results.filter((r) => r.ok).length;
      const fail = res.results.length - ok;
      const message = `${copy.batchDone}: ${ok} OK${fail ? `, ${fail} gagal` : ""}.`;
      saveRssBatchJob({
        ...job,
        status: "done",
        ok,
        fail,
        message,
      });
      setBatchProgress(null);
      setMessage(message);
      setBusy(null);
      router.refresh();
    } catch {
      const current = loadRssBatchJob();
      if (current) {
        setBatchProgress(
          `${copy.batchRunning}… · ${copy.batchBackgroundHint}`,
        );
        void syncBatchFromServer(current, true);
      } else {
        setMessage("Batch terputus — refresh halaman untuk cek status.");
      }
    } finally {
      const finished = loadRssBatchJob();
      if (finished?.status === "done") setBusy(null);
    }
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
          <label className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <span className="sr-only sm:not-sr-only">{copy.rewriteCount}</span>
            <Input
              type="number"
              min={1}
              step={1}
              value={rewriteCount}
              onChange={(e) => setRewriteCount(e.target.value)}
              className="h-9 w-20 tabular-nums"
              aria-label={copy.rewriteCountAria}
              disabled={!!busy}
            />
          </label>
          <Button
            type="button"
            size="sm"
            disabled={!!busy || rewriteCandidates.length === 0}
            onClick={() => runBatchRewrite(rewriteCandidates)}
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
              runBatchRewrite(ids);
            }}
          >
            {copy.rewriteSelected}
          </Button>
        </div>
      </div>

      {message || batchProgress ? (
        <div className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm text-foreground">
          <p>{batchProgress ?? message}</p>
          {busy === "rewrite" && batchProgress ? (
            <button
              type="button"
              className="mt-1 text-xs text-muted-foreground underline"
              onClick={() => {
                clearRssBatchJob();
                setBatchProgress(null);
                setBusy(null);
                setMessage(null);
              }}
            >
              Sembunyikan status
            </button>
          ) : null}
        </div>
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
