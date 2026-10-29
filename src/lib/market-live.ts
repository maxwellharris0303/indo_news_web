import type { MarketSnapshot } from "@/lib/content/types";
import { prisma } from "@/lib/db";
import { buildLiveMarketSnapshot } from "@/lib/market/build-snapshot";

/** Refresh upstream quotes at most this often */
const CACHE_TTL_MS = 5 * 60 * 1000;
/** If refresh fails, still show last good quotes up to this age */
const STALE_MAX_MS = 6 * 60 * 60 * 1000;

function parseCachedPayload(raw: string): MarketSnapshot | null {
  try {
    const data = JSON.parse(raw) as MarketSnapshot;
    if (
      typeof data.usdIdr !== "number" ||
      typeof data.ihsg !== "number" ||
      typeof data.goldBuy !== "number" ||
      !data.updatedAt
    ) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

async function readCache(): Promise<{
  snapshot: MarketSnapshot;
  fetchedAt: Date;
} | null> {
  const row = await prisma.marketCache.findUnique({ where: { id: 1 } });
  if (!row) return null;
  const snapshot = parseCachedPayload(row.payload);
  if (!snapshot) return null;
  return { snapshot, fetchedAt: row.fetchedAt };
}

async function writeCache(snapshot: MarketSnapshot): Promise<void> {
  await prisma.marketCache.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      payload: JSON.stringify(snapshot),
      fetchedAt: new Date(),
    },
    update: {
      payload: JSON.stringify(snapshot),
      fetchedAt: new Date(),
    },
  });
}

function cacheAgeMs(fetchedAt: Date): number {
  return Date.now() - fetchedAt.getTime();
}

export async function getLiveMarketSnapshot(): Promise<MarketSnapshot | null> {
  const cached = await readCache();

  if (cached && cacheAgeMs(cached.fetchedAt) < CACHE_TTL_MS) {
    return cached.snapshot;
  }

  try {
    const fresh = await buildLiveMarketSnapshot();
    await writeCache(fresh);
    return fresh;
  } catch {
    if (cached && cacheAgeMs(cached.fetchedAt) < STALE_MAX_MS) {
      return { ...cached.snapshot, isStale: true };
    }
    return null;
  }
}
