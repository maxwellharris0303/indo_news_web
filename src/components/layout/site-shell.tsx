import { BreakingBar } from "@/components/news/breaking-bar";
import { MarketTicker } from "@/components/news/market-ticker";
import { UtilityStrip } from "@/components/news/utility-strip";
import { getUrgentBanner } from "@/lib/content/repository";
import { getSiteLocale } from "@/lib/locale";
import { getLiveMarketSnapshot } from "@/lib/market-live";
import { getLiveUtilitySnapshot } from "@/lib/utilities-live";
import { getJakartaWeather } from "@/lib/weather";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

export async function SiteShell({ children }: { children: React.ReactNode }) {
  const locale = await getSiteLocale();
  const [urgent, market, weather, utilities] = await Promise.all([
    getUrgentBanner(locale),
    getLiveMarketSnapshot(),
    getJakartaWeather(),
    getLiveUtilitySnapshot(),
  ]);

  return (
    <>
      <SiteHeader />
      {urgent && (
        <BreakingBar
          kind={urgent.kind}
          title={urgent.article.title}
          category={urgent.article.category}
          slug={urgent.article.slug}
        />
      )}
      <UtilityStrip data={utilities} />
      {(market || weather) && (
        <MarketTicker data={market} weather={weather} />
      )}
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
