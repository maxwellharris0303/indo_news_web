/** Persist RSS batch rewrite progress across admin tab navigation (sessionStorage). */

export type RssBatchJob = {
  itemIds: string[];
  startedAt: number;
  status: "running" | "done";
  ok: number;
  fail: number;
  message: string;
};

const STORAGE_KEY = "kabardesk-rss-batch";
const MAX_AGE_MS = 60 * 60 * 1000;

export function loadRssBatchJob(): RssBatchJob | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const job = JSON.parse(raw) as RssBatchJob;
    if (Date.now() - job.startedAt > MAX_AGE_MS) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return job;
  } catch {
    return null;
  }
}

export function saveRssBatchJob(job: RssBatchJob) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(job));
}

export function clearRssBatchJob() {
  sessionStorage.removeItem(STORAGE_KEY);
}

/** Bulk auto post (RSS page) — survives admin tab navigation. */
export type RssAutoPostJob = {
  queue: string[];
  target: number;
  publish: boolean;
  startedAt: number;
  status: "running" | "done";
  ok: number;
  fail: number;
  message: string;
  cancelRequested?: boolean;
  failBuckets?: Record<string, number>;
  skippedGoogleNews?: number;
};

const AUTO_POST_KEY = "kabardesk-rss-auto-post";
const AUTO_POST_PREP_CANCEL_KEY = "kabardesk-rss-auto-post-prep-cancel";
export const RSS_AUTO_POST_CHANGED = "kabardesk-rss-auto-post-changed";

export function loadRssAutoPostJob(): RssAutoPostJob | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(AUTO_POST_KEY);
    if (!raw) return null;
    const job = JSON.parse(raw) as RssAutoPostJob;
    if (Date.now() - job.startedAt > MAX_AGE_MS) {
      sessionStorage.removeItem(AUTO_POST_KEY);
      return null;
    }
    return job;
  } catch {
    return null;
  }
}

export function saveRssAutoPostJob(job: RssAutoPostJob) {
  sessionStorage.setItem(AUTO_POST_KEY, JSON.stringify(job));
  window.dispatchEvent(new Event(RSS_AUTO_POST_CHANGED));
}

export function clearRssAutoPostJob() {
  sessionStorage.removeItem(AUTO_POST_KEY);
  window.dispatchEvent(new Event(RSS_AUTO_POST_CHANGED));
}

export function autoPostProgressLabel(
  runningLabel: string,
  job: RssAutoPostJob,
): string {
  const done = job.ok + job.fail;
  return `${runningLabel}: ${done}/${job.target}…`;
}

/** Stop a running job after the current chunk, or abort before the queue is saved. */
export function requestCancelRssAutoPostJob(): void {
  const job = loadRssAutoPostJob();
  if (job?.status === "running") {
    saveRssAutoPostJob({ ...job, cancelRequested: true });
    return;
  }
  sessionStorage.setItem(AUTO_POST_PREP_CANCEL_KEY, "1");
  window.dispatchEvent(new Event(RSS_AUTO_POST_CHANGED));
}

export function clearAutoPostPrepCancelFlag() {
  sessionStorage.removeItem(AUTO_POST_PREP_CANCEL_KEY);
}

export function consumeAutoPostPrepCancelFlag(): boolean {
  if (sessionStorage.getItem(AUTO_POST_PREP_CANCEL_KEY) !== "1") return false;
  sessionStorage.removeItem(AUTO_POST_PREP_CANCEL_KEY);
  return true;
}
