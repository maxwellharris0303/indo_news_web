/** Static prayer schedule sample (Jakarta) — replace with live API in production. */
export function getJakartaPrayerBrief() {
  return {
    city: "Jakarta",
    next: { name: "Maghrib", time: "17:42" },
    schedule: [
      { name: "Subuh", time: "04:28" },
      { name: "Dzuhur", time: "11:52" },
      { name: "Ashar", time: "15:18" },
      { name: "Maghrib", time: "17:42" },
      { name: "Isya", time: "19:02" },
    ],
  };
}

/** Demo air quality index for Greater Jakarta. */
export function getJakartaAirQuality() {
  return {
    aqi: 78,
    label: "Sedang",
    pollutant: "PM2.5",
    recommendation: "Kelompok sensitif kurangi aktivitas di luar ruangan.",
  };
}
