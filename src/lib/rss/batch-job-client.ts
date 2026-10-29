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
