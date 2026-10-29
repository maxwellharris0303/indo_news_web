import { format, formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";
import type { AdminLocale } from "@/lib/admin-locale";

const TZ = "Asia/Jakarta";

export function formatWIB(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(d)
    .replace(/\./g, ":")
    .concat(" WIB");
}

function formatShortInTimeZone(
  date: Date | string,
  locale: string,
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const parts = new Intl.DateTimeFormat(locale, {
    timeZone: TZ,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);

  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";

  const day = pick("day");
  const month = pick("month");
  const year = pick("year");
  const hour = pick("hour").replace(/\./g, ":");
  const minute = pick("minute").replace(/\./g, ":");

  return `${day} ${month} ${year}, ${hour}:${minute} WIB`;
}

export function formatShortWIB(date: Date | string): string {
  return formatShortInTimeZone(date, "id-ID");
}

export function formatShortAdmin(
  date: Date | string,
  locale: AdminLocale,
): string {
  const intlLocale = locale === "en" ? "en-GB" : "id-ID";
  return formatShortInTimeZone(date, intlLocale);
}

export function formatRelativeId(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: localeId });
}

export function readingTimeMinutes(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}
