"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  bulkAutoPostChunkAction,
  prepareBulkAutoPostAction,
} from "@/app/actions/admin-rss";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Copy = {
  autoPostTitle: string;
  autoPostHint: string;
  autoPostCount: string;
  autoPostPollFirst: string;
  autoPostPublish: string;
  autoPostStart: string;
  autoPostRunning: string;
  autoPostDone: string;
  autoPostFeedAll: string;
};

type FeedOption = { id: string; name: string };

export function RssBulkAutoPostCard({
  copy,
  feeds,
  defaultFeedId,
}: {
  copy: Copy;
  feeds: FeedOption[];
  defaultFeedId?: string;
}) {
  const router = useRouter();
  const [count, setCount] = useState("20");
  const [pollFirst, setPollFirst] = useState(true);
  const [publish, setPublish] = useState(true);
  const [feedId, setFeedId] = useState(defaultFeedId ?? "");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function runAutoPost() {
    const n = parseInt(count, 10);
    if (!Number.isFinite(n) || n < 1) {
      setMessage("Jumlah tidak valid.");
      return;
    }
    setBusy(true);
    setMessage(null);
    setProgress(`${copy.autoPostRunning}: 0/${n}…`);

    try {
      const prep = await prepareBulkAutoPostAction({
        count: n,
        pollFirst,
        feedId: feedId || undefined,
      });
      if (!prep.ok) {
        setMessage("Gagal menyiapkan antrian.");
        return;
      }
      let queue = [...prep.itemIds];
      if (queue.length === 0) {
        setMessage("Tidak ada item NEW di inbox.");
        setProgress(null);
        return;
      }

      let ok = 0;
      let fail = 0;
      let done = 0;
      const target = Math.min(n, queue.length);

      while (queue.length > 0 && done < target) {
        const chunkRes = await bulkAutoPostChunkAction({
          itemIds: queue,
          publish,
        });
        if (!chunkRes.ok) {
          setMessage(chunkRes.error);
          break;
        }
        ok += chunkRes.results.filter((r) => r.ok).length;
        fail += chunkRes.results.filter((r) => !r.ok).length;
        done = ok + fail;
        queue = queue.slice(chunkRes.results.length);
        setProgress(`${copy.autoPostRunning}: ${done}/${target}…`);
      }

      setProgress(null);
      setMessage(`${copy.autoPostDone}: ${ok} publikasi${fail ? `, ${fail} gagal` : ""}.`);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-xl border border-primary/30 bg-primary/5 p-4">
      <h3 className="font-serif text-lg font-bold">{copy.autoPostTitle}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{copy.autoPostHint}</p>
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="text-xs font-medium text-muted-foreground">
          {copy.autoPostCount}
          <Input
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(e.target.value)}
            className="mt-1 w-24"
            disabled={busy}
          />
        </label>
        {feeds.length > 0 ? (
          <label className="text-xs font-medium text-muted-foreground">
            Feed
            <select
              value={feedId}
              onChange={(e) => setFeedId(e.target.value)}
              disabled={busy}
              className="mt-1 block h-9 min-w-[160px] rounded-md border border-input bg-background px-2 text-sm"
            >
              <option value="">{copy.autoPostFeedAll}</option>
              {feeds.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={pollFirst}
            onChange={(e) => setPollFirst(e.target.checked)}
            disabled={busy}
          />
          {copy.autoPostPollFirst}
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={publish}
            onChange={(e) => setPublish(e.target.checked)}
            disabled={busy}
          />
          {copy.autoPostPublish}
        </label>
        <Button type="button" disabled={busy} onClick={() => void runAutoPost()}>
          {busy ? copy.autoPostRunning : copy.autoPostStart}
        </Button>
      </div>
      {progress ? (
        <p className="mt-3 text-sm text-muted-foreground">{progress}</p>
      ) : null}
      {message ? (
        <p className="mt-2 text-sm font-medium text-foreground">{message}</p>
      ) : null}
    </section>
  );
}
