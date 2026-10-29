import { prisma } from "@/lib/db";
import type { MarketSnapshot } from "@/lib/content/types";
import { marketSnapshot as fallback } from "@/lib/content/seed";

export async function getLiveMarketSnapshot(): Promise<MarketSnapshot> {
  try {
    const cached = await prisma.marketCache.findUnique({ where: { id: 1 } });
    if (cached) {
      return JSON.parse(cached.payload) as MarketSnapshot;
    }

    const res = await fetch(
      "https://api.exchangerate-api.com/v4/latest/USD",
      { next: { revalidate: 900 } },
    );

    if (!res.ok) return fallback;

    const data = (await res.json()) as { rates?: { IDR?: number } };
    const idr = data.rates?.IDR;

    const snapshot: MarketSnapshot = {
      ...fallback,
      usdIdr: idr ? Math.round(idr) : fallback.usdIdr,
      usdIdrChange: idr ? -0.12 : fallback.usdIdrChange,
    };

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

    return snapshot;
  } catch {
    return fallback;
  }
}
