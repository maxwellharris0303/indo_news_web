"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  loadRssAutoPostJob,
  RSS_AUTO_POST_CHANGED,
  type RssAutoPostJob,
} from "@/lib/rss/batch-job-client";
import { resumeRssAutoPostJob } from "@/lib/rss/auto-post-runner";
import { useAdminLocale } from "@/components/admin/admin-locale-provider";
import { rssText } from "@/lib/admin/locale-ui";

export function AdminAutoPostBanner() {
  const router = useRouter();
  const { locale } = useAdminLocale();
  const copy = rssText(locale);
  const [job, setJob] = useState<RssAutoPostJob | null>(() =>
    typeof window === "undefined" ? null : loadRssAutoPostJob(),
  );

  const onRefresh = useCallback(() => {
    router.refresh();
  }, [router]);

  useEffect(() => {
    const onChange = () => setJob(loadRssAutoPostJob());
    window.addEventListener(RSS_AUTO_POST_CHANGED, onChange);
    return () => window.removeEventListener(RSS_AUTO_POST_CHANGED, onChange);
  }, []);

  useEffect(() => {
    const current = loadRssAutoPostJob();
    if (!current || current.status !== "running") return;
    void resumeRssAutoPostJob(
      {
        autoPostRunning: copy.autoPostRunning,
        autoPostDone: copy.autoPostDone,
      },
      onRefresh,
    );
  }, [
    copy.autoPostDone,
    copy.autoPostRunning,
    onRefresh,
  ]);

  if (!job) return null;
  if (job.status === "done" && !job.message) return null;

  const isRunning = job.status === "running";

  return (
    <div
      className="mb-4 rounded-lg border border-primary/40 bg-primary/10 px-4 py-3 text-sm"
      role="status"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-medium">{job.message}</span>
        <Link
          href="/admin/rss"
          className="shrink-0 text-primary underline-offset-2 hover:underline"
        >
          RSS &amp; AI
        </Link>
      </div>
      {isRunning ? (
        <p className="mt-1 text-xs text-muted-foreground">
          {copy.autoPostHint}
        </p>
      ) : null}
    </div>
  );
}
