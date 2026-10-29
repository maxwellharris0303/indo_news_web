import { formatShortWIB } from "@/lib/format";
import type { UtilitySnapshot } from "@/lib/utilities/types";

export function UtilityStrip({ data }: { data: UtilitySnapshot | null }) {
  if (!data) return null;

  const { prayer, air, updatedAt, isStale } = data;
  const nextLabel = prayer.next.isTomorrow
    ? `${prayer.next.name} (besok)`
    : prayer.next.name;

  return (
    <div className="border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-3 py-2.5 sm:px-6 sm:py-2">
        <div className="flex flex-col gap-2 text-xs leading-relaxed text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-2 sm:text-sm">
          <p className="min-w-0">
            <span className="font-medium text-foreground">
              Sholat {prayer.city}
            </span>
            <span className="hidden sm:inline text-muted-foreground/80">
              {" "}
              · {prayer.method}
            </span>
            {" · "}
            Berikutnya {nextLabel}{" "}
            <span className="font-semibold text-foreground">
              {prayer.next.time}
            </span>
          </p>
          <p className="min-w-0 sm:max-w-[min(100%,42rem)]">
            <span className="font-medium text-foreground">Kualitas udara</span>
            {" · "}
            <span className="line-clamp-2 sm:line-clamp-none">
              AQI {air.aqi} ({air.label}
              {air.pm25 != null ? ` · PM2.5 ${air.pm25} µg/m³` : ""}) —{" "}
              {air.recommendation}
            </span>
          </p>
          <p className="min-w-0 shrink-0 text-muted-foreground/90">
            {isStale ? "Data terakhir · " : "Diperbarui · "}
            <time dateTime={updatedAt}>{formatShortWIB(updatedAt)}</time>
          </p>
        </div>
      </div>
    </div>
  );
}
