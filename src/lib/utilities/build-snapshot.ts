import { fetchJakartaAirQuality } from "@/lib/utilities/air-quality";
import { fetchJakartaPrayerBrief } from "@/lib/utilities/prayer";
import type { UtilitySnapshot } from "@/lib/utilities/types";

export async function buildLiveUtilitySnapshot(): Promise<UtilitySnapshot> {
  const [prayer, air] = await Promise.all([
    fetchJakartaPrayerBrief(),
    fetchJakartaAirQuality(),
  ]);

  return {
    prayer,
    air,
    updatedAt: new Date().toISOString(),
  };
}
