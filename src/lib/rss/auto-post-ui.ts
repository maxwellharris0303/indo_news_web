import {
  autoPostProgressLabel,
  loadRssAutoPostJob,
  type RssAutoPostJob,
} from "@/lib/rss/batch-job-client";

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
