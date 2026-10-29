import { TrendingDown, TrendingUp } from "lucide-react";
import type { MarketSnapshot } from "@/lib/content/types";
import type { WeatherBrief } from "@/lib/weather";

function Change({ value }: { value: number }) {
  const up = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium ${up ? "text-emerald-600" : "text-red-600"}`}
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
  data: MarketSnapshot;
  weather?: WeatherBrief | null;
}) {
  return (
    <div className="border-b border-border bg-muted/40">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2 text-xs sm:px-6 sm:text-sm">
        {weather && (
          <div>
            <span className="text-muted-foreground">Jakarta </span>
            <span className="font-semibold">
              {weather.tempC}°C · {weather.label}
            </span>
          </div>
        )}
        <div>
          <span className="text-muted-foreground">USD/IDR </span>
          <span className="font-semibold">{data.usdIdr.toLocaleString("id-ID")}</span>{" "}
          <Change value={data.usdIdrChange} />
        </div>
        <div>
          <span className="text-muted-foreground">IHSG </span>
          <span className="font-semibold">
            {data.ihsg.toLocaleString("id-ID", { maximumFractionDigits: 2 })}
          </span>{" "}
          <Change value={data.ihsgChange} />
        </div>
        <div>
          <span className="text-muted-foreground">Emas </span>
          <span className="font-semibold">
            Rp{data.goldBuy.toLocaleString("id-ID")}/gr
          </span>
        </div>
      </div>
    </div>
  );
}
