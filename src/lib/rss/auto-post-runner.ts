import { bulkAutoPostChunkAction } from "@/app/actions/admin-rss";
import {
  autoPostProgressLabel,
  loadRssAutoPostJob,
  saveRssAutoPostJob,
  type RssAutoPostJob,
} from "@/lib/rss/batch-job-client";

let activeRun: Promise<void> | null = null;

export type AutoPostRunnerCopy = {
  autoPostRunning: string;
  autoPostDone: string;
  autoPostStopped: string;
};

function stoppedMessage(
  stoppedLabel: string,
  ok: number,
  fail: number,
): string {
  return `${stoppedLabel}: ${ok} publikasi${fail ? `, ${fail} gagal` : ""}.`;
}

function saveStopped(
  job: RssAutoPostJob,
  ok: number,
  fail: number,
  stoppedLabel: string,
  onRefresh: () => void,
): RssAutoPostJob {
  const finished: RssAutoPostJob = {
    ...job,
    queue: [],
    ok,
    fail,
    status: "done",
    cancelRequested: false,
    message: stoppedMessage(stoppedLabel, ok, fail),
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
  let done = ok + fail;
  const target = job.target;

  if (cancelRequested()) {
    return saveStopped(job, ok, fail, copy.autoPostStopped, onRefresh);
  }

  while (queue.length > 0 && done < target) {
    if (cancelRequested()) {
      return saveStopped(job, ok, fail, copy.autoPostStopped, onRefresh);
    }

    const chunkRes = await bulkAutoPostChunkAction({
      itemIds: queue,
      publish: job.publish,
    });

    if (cancelRequested()) {
      return saveStopped(job, ok, fail, copy.autoPostStopped, onRefresh);
    }

    if (!chunkRes.ok) {
      const failed: RssAutoPostJob = {
        ...job,
        queue,
        ok,
        fail,
        status: "done",
        cancelRequested: false,
        message: chunkRes.error,
      };
      saveRssAutoPostJob(failed);
      return failed;
    }
    ok += chunkRes.results.filter((r) => r.ok).length;
    fail += chunkRes.results.filter((r) => !r.ok).length;
    done = ok + fail;
    queue = queue.slice(chunkRes.results.length);

    const running: RssAutoPostJob = {
      ...job,
      queue,
      ok,
      fail,
      status: "running",
      cancelRequested: false,
      message: autoPostProgressLabel(copy.autoPostRunning, {
        ...job,
        ok,
        fail,
      }),
    };
    saveRssAutoPostJob(running);
  }

  const message = `${copy.autoPostDone}: ${ok} publikasi${fail ? `, ${fail} gagal` : ""}.`;
  const finished: RssAutoPostJob = {
    ...job,
    queue: [],
    ok,
    fail,
    status: "done",
    cancelRequested: false,
    message,
  };
  saveRssAutoPostJob(finished);
  onRefresh();
  return finished;
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
): string {
  return stoppedMessage(copy.autoPostStopped, ok, fail);
}
