import { TrendingDown, TrendingUp } from "lucide-react";
import type { MarketSnapshot } from "@/lib/content/types";
import { formatShortWIB } from "@/lib/format";
import type { WeatherBrief } from "@/lib/weather";

function Change({ value }: { value: number }) {
  const up = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium ${up ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
    >
      {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {Math.abs(value).toFixed(2)}%
    </span>
  );
}

export function MarketTicker({
  data,
  weather,
}: {
  data: MarketSnapshot | null;
  weather?: WeatherBrief | null;
}) {
  const items = [
    weather ? (
      <div key="weather" className="shrink-0">
        <span className="text-muted-foreground">Jakarta </span>
        <span className="font-semibold text-foreground">
          {weather.tempC}°C · {weather.label}
        </span>
      </div>
    ) : null,
    data ? (
      <div key="usd" className="shrink-0">
        <span className="text-muted-foreground">USD/IDR </span>
        <span className="font-semibold text-foreground">
          {data.usdIdr.toLocaleString("id-ID")}
        </span>{" "}
        <Change value={data.usdIdrChange} />
      </div>
    ) : null,
    data ? (
      <div key="ihsg" className="shrink-0">
        <span className="text-muted-foreground">IHSG </span>
        <span className="font-semibold text-foreground">
          {data.ihsg.toLocaleString("id-ID", { maximumFractionDigits: 2 })}
        </span>{" "}
        <Change value={data.ihsgChange} />
      </div>
    ) : null,
    data ? (
      <div key="gold" className="shrink-0">
        <span className="text-muted-foreground">Emas spot </span>
        <span className="font-semibold text-foreground">
          Rp{data.goldBuy.toLocaleString("id-ID")}/gr
        </span>{" "}
        <Change value={data.goldChange} />
      </div>
    ) : null,
    data ? (
      <div key="updated" className="shrink-0 text-muted-foreground">
        {data.isStale ? "Data terakhir · " : "Diperbarui · "}
        <time dateTime={data.updatedAt}>{formatShortWIB(data.updatedAt)}</time>
      </div>
    ) : null,
  ].filter(Boolean);

  if (items.length === 0) return null;

  return (
    <div className="border-b border-border bg-muted/40">
      <div className="mx-auto max-w-7xl px-3 sm:px-6">
        <div className="-mx-3 flex gap-6 overflow-x-auto px-3 py-2.5 text-xs [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:py-2 sm:text-sm [&::-webkit-scrollbar]:hidden">
          {items}
        </div>
      </div>
    </div>
  );
}
