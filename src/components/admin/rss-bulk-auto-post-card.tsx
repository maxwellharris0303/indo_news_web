"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { prepareBulkAutoPostAction } from "@/app/actions/admin-rss";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  clearAutoPostPrepCancelFlag,
  clearRssAutoPostJob,
  consumeAutoPostPrepCancelFlag,
  loadRssAutoPostJob,
  requestCancelRssAutoPostJob,
  RSS_AUTO_POST_CHANGED,
  saveRssAutoPostJob,
} from "@/lib/rss/batch-job-client";
import {
  autoPostStoppedMessage,
  resumeRssAutoPostJob,
} from "@/lib/rss/auto-post-runner";
import { loadAutoPostCardUi } from "@/lib/rss/auto-post-ui";

type Copy = {
  autoPostTitle: string;
  autoPostHint: string;
  autoPostCount: string;
  autoPostPollFirst: string;
  autoPostPublish: string;
  autoPostStart: string;
  autoPostRunning: string;
  autoPostDone: string;
  autoPostStop: string;
  autoPostStopped: string;
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
  const [busy, setBusy] = useState(
    () => loadAutoPostCardUi(copy.autoPostRunning).busy,
  );
  const [progress, setProgress] = useState<string | null>(
    () => loadAutoPostCardUi(copy.autoPostRunning).progress,
  );
  const [message, setMessage] = useState<string | null>(
    () => loadAutoPostCardUi(copy.autoPostRunning).message,
  );

  const applyStorageUi = useCallback(() => {
    const ui = loadAutoPostCardUi(copy.autoPostRunning);
    setBusy(ui.busy);
    setProgress(ui.progress);
    setMessage(ui.message);
  }, [copy.autoPostRunning]);

  useEffect(() => {
    const onChange = () => applyStorageUi();
    window.addEventListener(RSS_AUTO_POST_CHANGED, onChange);
    return () => window.removeEventListener(RSS_AUTO_POST_CHANGED, onChange);
  }, [applyStorageUi]);

  const runnerCopy = {
    autoPostRunning: copy.autoPostRunning,
    autoPostDone: copy.autoPostDone,
    autoPostStopped: copy.autoPostStopped,
  };

  useEffect(() => {
    const job = loadRssAutoPostJob();
    if (!job || job.status !== "running") return;
    void resumeRssAutoPostJob(runnerCopy, () => router.refresh());
  }, [copy.autoPostDone, copy.autoPostRunning, copy.autoPostStopped, router]);

  function stopAutoPost() {
    requestCancelRssAutoPostJob();
  }

  async function runAutoPost() {
    const n = parseInt(count, 10);
    if (!Number.isFinite(n) || n < 1) {
      setMessage("Jumlah tidak valid.");
      return;
    }
    const existing = loadRssAutoPostJob();
    if (existing?.status === "running") {
      setMessage("Auto post masih berjalan.");
      return;
    }
    clearRssAutoPostJob();
    clearAutoPostPrepCancelFlag();

    setBusy(true);
    setMessage(null);
    setProgress(`${copy.autoPostRunning}: 0/${n}…`);

    try {
      const prep = await prepareBulkAutoPostAction({
        count: n,
        pollFirst,
        feedId: feedId || undefined,
      });
      if (consumeAutoPostPrepCancelFlag()) {
        setMessage(autoPostStoppedMessage(runnerCopy, 0, 0));
        setProgress(null);
        return;
      }
      if (!prep.ok) {
        setMessage("Gagal menyiapkan antrian.");
        setProgress(null);
        return;
      }
      const queue = [...prep.itemIds];
      if (queue.length === 0) {
        setMessage("Tidak ada item NEW di inbox.");
        setProgress(null);
        return;
      }

      const target = Math.min(n, queue.length);
      saveRssAutoPostJob({
        queue,
        target,
        publish,
        startedAt: Date.now(),
        status: "running",
        ok: 0,
        fail: 0,
        message: `${copy.autoPostRunning}: 0/${target}…`,
      });

      await resumeRssAutoPostJob(runnerCopy, () => router.refresh());
    } finally {
      applyStorageUi();
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
          {copy.autoPostStart}
        </Button>
        {busy ? (
          <Button
            type="button"
            variant="outline"
            onClick={stopAutoPost}
          >
            {copy.autoPostStop}
          </Button>
        ) : null}
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
