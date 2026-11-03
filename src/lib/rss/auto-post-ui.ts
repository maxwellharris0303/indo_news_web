import type { AdminLocale } from "@/lib/admin-locale";
import { adminRssCopy } from "@/lib/admin/locale-ui";
import type { AutoPostRunnerCopy } from "@/lib/rss/auto-post-runner";
import {
  autoPostProgressLabel,
  loadRssAutoPostJob,
  type RssAutoPostJob,
} from "@/lib/rss/batch-job-client";

export function buildAutoPostRunnerCopy(
  locale: AdminLocale,
): AutoPostRunnerCopy {
  const c = adminRssCopy[locale];
  return {
    autoPostRunning: c.autoPostRunning,
    autoPostDone: c.autoPostDone,
    autoPostStopped: c.autoPostStopped,
    autoPostPublishedWord: c.autoPostPublishedWord,
    autoPostFailedWord: c.autoPostFailedWord,
    autoPostSkippedGoogleNews: (count) =>
      locale === "en"
        ? `(${count} Google News link${count === 1 ? "" : "s"} skipped when queuing.)`
        : `(${count} link Google News dilewati saat antrian.)`,
  };
}

export type AutoPostCardUi = {
  busy: boolean;
  progress: string | null;
  message: string | null;
};

export function autoPostCardUiFromJob(
  job: RssAutoPostJob | null,
  runningLabel: string,
): AutoPostCardUi {
  if (!job) {
    return { busy: false, progress: null, message: null };
  }
  if (job.status === "running") {
    return {
      busy: true,
      progress: autoPostProgressLabel(runningLabel, job),
      message: null,
    };
  }
  return { busy: false, progress: null, message: job.message };
}

export function loadAutoPostCardUi(runningLabel: string): AutoPostCardUi {
  if (typeof window === "undefined") {
    return { busy: false, progress: null, message: null };
  }
  return autoPostCardUiFromJob(loadRssAutoPostJob(), runningLabel);
}
