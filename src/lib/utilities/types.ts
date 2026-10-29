export type PrayerTime = { name: string; time: string };

export type PrayerBrief = {
  city: string;
  method: string;
  next: PrayerTime & { isTomorrow?: boolean };
  schedule: PrayerTime[];
};

export type AirQualityBrief = {
  aqi: number;
  label: string;
  pollutant: string;
  pm25: number | null;
  recommendation: string;
};

export type UtilitySnapshot = {
  prayer: PrayerBrief;
  air: AirQualityBrief;
  updatedAt: string;
  isStale?: boolean;
};
