import { getJakartaAirQuality, getJakartaPrayerBrief } from "@/lib/utilities";

export function UtilityStrip() {
  const prayer = getJakartaPrayerBrief();
  const air = getJakartaAirQuality();

  return (
    <div className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2 text-xs text-muted-foreground sm:px-6 sm:text-sm">
        <div>
          <span className="font-medium text-foreground">Sholat {prayer.city}</span>
          {" · "}
          Berikutnya {prayer.next.name}{" "}
          <span className="font-semibold text-foreground">{prayer.next.time}</span>
        </div>
        <div>
          <span className="font-medium text-foreground">Kualitas udara</span>
          {" · "}
          AQI {air.aqi} ({air.label}) — {air.recommendation}
        </div>
      </div>
    </div>
  );
}
