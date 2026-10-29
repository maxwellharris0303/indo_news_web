import { getJakartaAirQuality, getJakartaPrayerBrief } from "@/lib/utilities";

export function UtilityStrip() {
  const prayer = getJakartaPrayerBrief();
  const air = getJakartaAirQuality();

  return (
    <div className="border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-3 py-2.5 sm:px-6 sm:py-2">
        <div className="flex flex-col gap-2 text-xs leading-relaxed text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-2 sm:text-sm">
          <p className="min-w-0">
            <span className="font-medium text-foreground">
              Sholat {prayer.city}
            </span>
            {" · "}
            Berikutnya {prayer.next.name}{" "}
            <span className="font-semibold text-foreground">
              {prayer.next.time}
            </span>
          </p>
          <p className="min-w-0 sm:max-w-[min(100%,42rem)]">
            <span className="font-medium text-foreground">Kualitas udara</span>
            {" · "}
            <span className="line-clamp-2 sm:line-clamp-none">
              AQI {air.aqi} ({air.label}) — {air.recommendation}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
