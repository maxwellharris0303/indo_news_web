import type { PrayerBrief, PrayerTime } from "@/lib/utilities/types";

const JAKARTA_LAT = -6.2088;
const JAKARTA_LON = 106.8456;
/** Kementerian Agama Republik Indonesia (Aladhan method 20) */
const KEMENAG_METHOD = 20;
const TZ = "Asia/Jakarta";

const PRAYER_KEYS: { name: string; key: keyof AladhanTimings }[] = [
  { name: "Subuh", key: "Fajr" },
  { name: "Dzuhur", key: "Dhuhr" },
  { name: "Ashar", key: "Asr" },
  { name: "Maghrib", key: "Maghrib" },
  { name: "Isya", key: "Isha" },
];

type AladhanTimings = {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
};

type AladhanResponse = {
  code?: number;
  data?: {
    timings?: AladhanTimings;
    meta?: { method?: { name?: string } };
  };
};

function ymdInJakarta(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(date);
}

function ymdAddDays(ymd: string, days: number): string {
  const dt = new Date(`${ymd}T12:00:00+07:00`);
  dt.setUTCDate(dt.getUTCDate() + days);
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(dt);
}

function minutesNowJakarta(): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return hour * 60 + minute;
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + (m ?? 0);
}

async function fetchTimings(dateYmd: string): Promise<{
  timings: AladhanTimings;
  methodName: string;
} | null> {
  const url =
    `https://api.aladhan.com/v1/timings/${dateYmd}` +
    `?latitude=${JAKARTA_LAT}&longitude=${JAKARTA_LON}&method=${KEMENAG_METHOD}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return null;
  const json = (await res.json()) as AladhanResponse;
  if (json.code !== 200 || !json.data?.timings) return null;
  return {
    timings: json.data.timings,
    methodName: json.data.meta?.method?.name ?? "Kemenag RI",
  };
}

function scheduleFromTimings(timings: AladhanTimings): PrayerTime[] {
  return PRAYER_KEYS.map(({ name, key }) => ({
    name,
    time: timings[key],
  }));
}

function findNextPrayer(
  schedule: PrayerTime[],
  nowMin: number,
): { next: PrayerTime; needTomorrow: boolean } {
  for (const entry of schedule) {
    if (toMinutes(entry.time) > nowMin) {
      return { next: entry, needTomorrow: false };
    }
  }
  return { next: schedule[0], needTomorrow: true };
}

export async function fetchJakartaPrayerBrief(): Promise<PrayerBrief> {
  const today = ymdInJakarta();
  const loaded = await fetchTimings(today);
  if (!loaded) throw new Error("Prayer timings unavailable");

  const schedule = scheduleFromTimings(loaded.timings);
  const nowMin = minutesNowJakarta();
  let { next, needTomorrow } = findNextPrayer(schedule, nowMin);

  if (needTomorrow) {
    const tomorrow = ymdAddDays(today, 1);
    const tLoaded = await fetchTimings(tomorrow);
    if (tLoaded) {
      next = { name: "Subuh", time: tLoaded.timings.Fajr };
    }
  }

  return {
    city: "Jakarta",
    method: loaded.methodName,
    next: needTomorrow ? { ...next, isTomorrow: true } : next,
    schedule,
  };
}
