export interface WeatherBrief {
  tempC: number;
  label: string;
}

export async function getJakartaWeather(): Promise<WeatherBrief | null> {
  try {
    const url =
      "https://api.open-meteo.com/v1/forecast?latitude=-6.2088&longitude=106.8456&current=temperature_2m,weather_code&timezone=Asia%2FJakarta";
    const res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      current?: { temperature_2m?: number; weather_code?: number };
    };
    const temp = data.current?.temperature_2m;
    if (temp == null) return null;
    const code = data.current?.weather_code ?? 0;
    return {
      tempC: Math.round(temp),
      label: weatherLabel(code),
    };
  } catch {
    return null;
  }
}

function weatherLabel(code: number): string {
  if (code === 0) return "Cerah";
  if (code <= 3) return "Berawan";
  if (code <= 67) return "Hujan";
  return "Cuaca ekstrem";
}
