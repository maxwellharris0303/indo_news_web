import type { MarketSnapshot } from "@/lib/content/types";
import { formatShortWIB } from "@/lib/format";
import type { WeatherBrief } from "@/lib/weather";

function Change({ value }: { value: number }) {
  const up = value >= 0;
  return (
    <span
      className={
        up
          ? "text-emerald-800 dark:text-emerald-400"
          : "text-red-800 dark:text-red-400"
      }
    >
      {up ? "▲" : "▼"} {Math.abs(value).toFixed(2)}%
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
        <span className="font-medium text-foreground">
          {weather.tempC}°C · {weather.label}
        </span>
      </div>
    ) : null,
    data ? (
      <div key="usd" className="shrink-0">
        <span className="text-muted-foreground">USD/IDR </span>
        <span className="font-medium tabular-nums text-foreground">
          {data.usdIdr.toLocaleString("id-ID")}
        </span>{" "}
        <Change value={data.usdIdrChange} />
      </div>
    ) : null,
    data ? (
      <div key="ihsg" className="shrink-0">
        <span className="text-muted-foreground">IHSG </span>
        <span className="font-medium tabular-nums text-foreground">
          {data.ihsg.toLocaleString("id-ID", { maximumFractionDigits: 2 })}
        </span>{" "}
        <Change value={data.ihsgChange} />
      </div>
    ) : null,
    data ? (
      <div key="gold" className="shrink-0">
        <span className="text-muted-foreground">Emas </span>
        <span className="font-medium tabular-nums text-foreground">
          Rp{data.goldBuy.toLocaleString("id-ID")}/gr
        </span>{" "}
        <Change value={data.goldChange} />
      </div>
    ) : null,
    data ? (
      <div key="updated" className="shrink-0 text-muted-foreground">
        {data.isStale ? "Data terakhir · " : ""}
        <time dateTime={data.updatedAt}>{formatShortWIB(data.updatedAt)}</time>
      </div>
    ) : null,
  ].filter(Boolean);

  if (items.length === 0) return null;

  return (
    <div className="border-b border-border bg-muted/50 font-sans text-[11px] sm:text-xs">
      <div className="mx-auto max-w-7xl px-3 sm:px-6">
        <div className="-mx-3 flex gap-5 overflow-x-auto px-3 py-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
          {items}
        </div>
      </div>
    </div>
  );
}
