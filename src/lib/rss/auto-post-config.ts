/** Server + client tuning for bulk auto post (env on server). */

export function autoPostChunkSize(): number {
  const n = Number(process.env.RSS_AUTO_POST_CHUNK_SIZE);
  if (Number.isFinite(n) && n >= 1) return Math.min(Math.floor(n), 5);
  return 2;
}

export function autoPostDelayBetweenItemsMs(): number {
  const n = Number(process.env.RSS_AUTO_POST_ITEM_DELAY_MS);
  if (Number.isFinite(n) && n >= 0) return Math.min(Math.floor(n), 30_000);
  return 1500;
}

/** Delay between server-action chunks (client runner). */
export function autoPostDelayBetweenChunksMs(): number {
  const n = Number(process.env.RSS_AUTO_POST_CHUNK_DELAY_MS);
  if (Number.isFinite(n) && n >= 0) return Math.min(Math.floor(n), 60_000);
  return 2500;
}
