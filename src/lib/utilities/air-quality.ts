import type { AirQualityBrief } from "@/lib/utilities/types";

const JAKARTA_LAT = -6.2088;
const JAKARTA_LON = 106.8456;

type OpenMeteoAir = {
  current?: {
    us_aqi?: number;
    pm2_5?: number;
  };
};

function usAqiLabel(aqi: number): string {
  if (aqi <= 50) return "Baik";
  if (aqi <= 100) return "Sedang";
  if (aqi <= 150) return "Tidak sehat (sensitif)";
  if (aqi <= 200) return "Tidak sehat";
  if (aqi <= 300) return "Sangat tidak sehat";
  return "Berbahaya";
}

function usAqiRecommendation(aqi: number): string {
  if (aqi <= 50) {
    return "Kualitas udara memuaskan; aktivitas luar ruangan aman.";
  }
  if (aqi <= 100) {
    return "Kelompok sensitif kurangi aktivitas di luar ruangan.";
  }
  if (aqi <= 150) {
    return "Kelompok sensitif hindari aktivitas berat di luar; masyarakat umum aman.";
  }
  if (aqi <= 200) {
    return "Semua kelompok kurangi aktivitas di luar ruangan.";
  }
  if (aqi <= 300) {
    return "Hindari aktivitas di luar ruangan; gunakan masker jika harus keluar.";
  }
  return "Tetap di dalam ruangan; kualitas udara sangat berbahaya.";
}

export async function fetchJakartaAirQuality(): Promise<AirQualityBrief> {
  const url =
    "https://air-quality-api.open-meteo.com/v1/air-quality" +
    `?latitude=${JAKARTA_LAT}&longitude=${JAKARTA_LON}` +
    "&current=us_aqi,pm2_5&timezone=Asia%2FJakarta";
  const res = await fetch(url, { next: { revalidate: 1800 } });
  if (!res.ok) throw new Error("Air quality unavailable");

  const data = (await res.json()) as OpenMeteoAir;
  const aqi = data.current?.us_aqi;
  if (aqi == null || !Number.isFinite(aqi)) {
    throw new Error("Air quality AQI missing");
  }

  const rounded = Math.round(aqi);
  const pm25 = data.current?.pm2_5;
  const pm25Rounded =
    pm25 != null && Number.isFinite(pm25) ? Math.round(pm25 * 10) / 10 : null;

  return {
    aqi: rounded,
    label: usAqiLabel(rounded),
    pollutant: "PM2.5",
    pm25: pm25Rounded,
    recommendation: usAqiRecommendation(rounded),
  };
}
