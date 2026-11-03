import { bulkAutoPostChunkAction } from "@/app/actions/admin-rss";
import {
  autoPostProgressLabel,
  loadRssAutoPostJob,
  saveRssAutoPostJob,
  type RssAutoPostJob,
} from "@/lib/rss/batch-job-client";

let activeRun: Promise<void> | null = null;

async function processQueue(
  job: RssAutoPostJob,
  copy: { autoPostRunning: string; autoPostDone: string },
  onRefresh: () => void,
): Promise<RssAutoPostJob> {
  let queue = [...job.queue];
  let ok = job.ok;
  let fail = job.fail;
  let done = ok + fail;
  const target = job.target;

  while (queue.length > 0 && done < target) {
    const chunkRes = await bulkAutoPostChunkAction({
      itemIds: queue,
      publish: job.publish,
    });
    if (!chunkRes.ok) {
      const failed: RssAutoPostJob = {
        ...job,
        queue,
        ok,
        fail,
        status: "done",
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
    message,
  };
  saveRssAutoPostJob(finished);
  onRefresh();
  return finished;
}

/** Continue or start processing the persisted auto-post job (single flight). */
export function resumeRssAutoPostJob(
  copy: { autoPostRunning: string; autoPostDone: string },
  onRefresh: () => void,
): Promise<void> {
  const job = loadRssAutoPostJob();
  if (!job || job.status === "done") {
    return Promise.resolve();
  }
  if (activeRun) return activeRun;

  activeRun = processQueue(job, copy, onRefresh).finally(() => {
    activeRun = null;
  });
  return activeRun;
}
