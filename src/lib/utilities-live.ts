import { prisma } from "@/lib/db";
import { buildLiveUtilitySnapshot } from "@/lib/utilities/build-snapshot";
import type { UtilitySnapshot } from "@/lib/utilities/types";

const CACHE_TTL_MS = 30 * 60 * 1000;
const STALE_MAX_MS = 6 * 60 * 60 * 1000;

function parsePayload(raw: string): UtilitySnapshot | null {
  try {
    const data = JSON.parse(raw) as UtilitySnapshot;
    if (!data.updatedAt || !data.prayer?.next || data.air?.aqi == null) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

async function readCache(): Promise<{
  snapshot: UtilitySnapshot;
  fetchedAt: Date;
} | null> {
  const row = await prisma.utilityCache.findUnique({ where: { id: 1 } });
  if (!row) return null;
  const snapshot = parsePayload(row.payload);
  if (!snapshot) return null;
  return { snapshot, fetchedAt: row.fetchedAt };
}

async function writeCache(snapshot: UtilitySnapshot): Promise<void> {
  await prisma.utilityCache.upsert({
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

export async function getLiveUtilitySnapshot(): Promise<UtilitySnapshot | null> {
  const cached = await readCache();

  if (cached && cacheAgeMs(cached.fetchedAt) < CACHE_TTL_MS) {
    return cached.snapshot;
  }

  try {
    const fresh = await buildLiveUtilitySnapshot();
    await writeCache(fresh);
    return fresh;
  } catch {
    if (cached && cacheAgeMs(cached.fetchedAt) < STALE_MAX_MS) {
      return { ...cached.snapshot, isStale: true };
    }
    return null;
  }
}
