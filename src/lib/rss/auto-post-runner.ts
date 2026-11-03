import { bulkAutoPostChunkAction } from "@/app/actions/admin-rss";
import {
  buildAutoPostFinishMessage,
  mergeFailBuckets,
} from "@/lib/rss/auto-post-fail-summary";
import {
  autoPostProgressLabel,
  loadRssAutoPostJob,
  saveRssAutoPostJob,
  type RssAutoPostJob,
} from "@/lib/rss/batch-job-client";

let activeRun: Promise<void> | null = null;

/** Pause between server-action chunks (client-side). */
const CHUNK_DELAY_MS = 2500;

export type AutoPostRunnerCopy = {
  autoPostRunning: string;
  autoPostDone: string;
  autoPostStopped: string;
  autoPostPublishedWord: string;
  autoPostFailedWord: string;
  autoPostSkippedGoogleNews: (count: number) => string;
};

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function finishMessage(
  copy: AutoPostRunnerCopy,
  label: string,
  job: RssAutoPostJob,
  ok: number,
  fail: number,
): string {
  return buildAutoPostFinishMessage({
    doneLabel: label,
    ok,
    fail,
    failBuckets: job.failBuckets ?? {},
    skippedGoogleNews: job.skippedGoogleNews,
    skippedGoogleNewsNote: copy.autoPostSkippedGoogleNews,
    publishedWord: copy.autoPostPublishedWord,
    failedWord: copy.autoPostFailedWord,
  });
}

function saveStopped(
  job: RssAutoPostJob,
  ok: number,
  fail: number,
  copy: AutoPostRunnerCopy,
  onRefresh: () => void,
): RssAutoPostJob {
  const finished: RssAutoPostJob = {
    ...job,
    queue: [],
    ok,
    fail,
    status: "done",
    cancelRequested: false,
    message: finishMessage(copy, copy.autoPostStopped, job, ok, fail),
  };
  saveRssAutoPostJob(finished);
  if (ok + fail > 0) onRefresh();
  return finished;
}

function cancelRequested(): boolean {
  return loadRssAutoPostJob()?.cancelRequested === true;
}

async function processQueue(
  job: RssAutoPostJob,
  copy: AutoPostRunnerCopy,
  onRefresh: () => void,
): Promise<RssAutoPostJob> {
  let queue = [...job.queue];
  let ok = job.ok;
  let fail = job.fail;
  let failBuckets = { ...(job.failBuckets ?? {}) };
  let done = ok + fail;
  const target = job.target;

  if (cancelRequested()) {
    return saveStopped({ ...job, failBuckets }, ok, fail, copy, onRefresh);
  }

  while (queue.length > 0 && done < target) {
    if (cancelRequested()) {
      return saveStopped({ ...job, failBuckets }, ok, fail, copy, onRefresh);
    }

    const chunkRes = await bulkAutoPostChunkAction({
      itemIds: queue,
      publish: job.publish,
    });

    if (cancelRequested()) {
      return saveStopped({ ...job, failBuckets }, ok, fail, copy, onRefresh);
    }

    if (!chunkRes.ok) {
      const failed: RssAutoPostJob = {
        ...job,
        queue,
        ok,
        fail,
        failBuckets,
        status: "done",
        cancelRequested: false,
        message: chunkRes.error,
      };
      saveRssAutoPostJob(failed);
      return failed;
    }

    failBuckets = mergeFailBuckets(
      failBuckets,
      chunkRes.results.filter((r) => !r.ok).map((r) => r.error),
    );
    ok += chunkRes.results.filter((r) => r.ok).length;
    fail += chunkRes.results.filter((r) => !r.ok).length;
    done = ok + fail;
    queue = queue.slice(chunkRes.results.length);

    const running: RssAutoPostJob = {
      ...job,
      queue,
      ok,
      fail,
      failBuckets,
      status: "running",
      cancelRequested: false,
      message: autoPostProgressLabel(copy.autoPostRunning, {
        ...job,
        ok,
        fail,
      }),
    };
    saveRssAutoPostJob(running);

    if (queue.length > 0 && done < target) {
      await delay(CHUNK_DELAY_MS);
    }
  }

  const finishedJob: RssAutoPostJob = {
    ...job,
    queue: [],
    ok,
    fail,
    failBuckets,
    status: "done",
    cancelRequested: false,
    message: finishMessage(copy, copy.autoPostDone, { ...job, failBuckets }, ok, fail),
  };
  saveRssAutoPostJob(finishedJob);
  onRefresh();
  return finishedJob;
}

/** Continue or start processing the persisted auto-post job (single flight). */
export function resumeRssAutoPostJob(
  copy: AutoPostRunnerCopy,
  onRefresh: () => void,
): Promise<void> {
  const job = loadRssAutoPostJob();
  if (!job || job.status === "done") {
    return Promise.resolve();
  }
  if (activeRun) return activeRun;

  activeRun = processQueue(job, copy, onRefresh)
    .then(() => undefined)
    .finally(() => {
      activeRun = null;
    });
  return activeRun;
}

export function autoPostStoppedMessage(
  copy: AutoPostRunnerCopy,
  ok: number,
  fail: number,
  failBuckets: Record<string, number> = {},
  skippedGoogleNews?: number,
): string {
  return buildAutoPostFinishMessage({
    doneLabel: copy.autoPostStopped,
    ok,
    fail,
    failBuckets,
    skippedGoogleNews,
    skippedGoogleNewsNote: copy.autoPostSkippedGoogleNews,
    publishedWord: copy.autoPostPublishedWord,
    failedWord: copy.autoPostFailedWord,
  });
}
