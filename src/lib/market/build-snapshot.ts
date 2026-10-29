import type { MarketSnapshot } from "@/lib/content/types";
import { fetchYahooQuote, TROY_OZ_GRAMS } from "@/lib/market/yahoo-chart";

export async function buildLiveMarketSnapshot(): Promise<MarketSnapshot> {
  const [usdIdr, ihsg, goldUsdOz] = await Promise.all([
    fetchYahooQuote("IDR=X"),
    fetchYahooQuote("^JKSE"),
    fetchYahooQuote("GC=F"),
  ]);

  if (!usdIdr || !ihsg || !goldUsdOz) {
    throw new Error("Incomplete market quotes from upstream");
  }

  const usdPerIdr = usdIdr.price;
  const goldBuy = Math.round((goldUsdOz.price * usdPerIdr) / TROY_OZ_GRAMS);

  return {
    usdIdr: Math.round(usdPerIdr),
    usdIdrChange: usdIdr.changePercent,
    ihsg: ihsg.price,
    ihsgChange: ihsg.changePercent,
    goldBuy,
    goldChange: goldUsdOz.changePercent,
    updatedAt: new Date().toISOString(),
  };
}
