import { BreakingBar } from "@/components/news/breaking-bar";
import { MarketTicker } from "@/components/news/market-ticker";
import {
  getBreakingArticle,
} from "@/lib/content/repository";
import { getLiveMarketSnapshot } from "@/lib/market-live";
import { getJakartaWeather } from "@/lib/weather";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

export async function SiteShell({ children }: { children: React.ReactNode }) {
  const [breaking, market, weather] = await Promise.all([
    getBreakingArticle(),
    getLiveMarketSnapshot(),
    getJakartaWeather(),
  ]);

  return (
    <>
      <SiteHeader />
      {breaking && (
        <BreakingBar
          title={breaking.title}
          category={breaking.category}
          slug={breaking.slug}
        />
      )}
      <MarketTicker data={market} weather={weather} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
