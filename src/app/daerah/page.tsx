import Link from "next/link";
import { RegionPicker } from "@/components/daerah/region-picker";
import { getRegions } from "@/lib/content/repository";

export const metadata = {
  title: "Daerah",
  description: "Berita daerah dan liputan lokal seluruh Indonesia.",
};

export default async function DaerahPage() {
  const regions = await getRegions();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="font-serif text-3xl font-bold">Berita Daerah</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Pilih provinsi untuk membaca liputan lokal. Fitur geolokasi (privasi
        aman) akan hadir di versi berikutnya.
      </p>
      <RegionPicker regions={regions} />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {regions.map((region) => (
          <Link
            key={region.slug}
            href={`/daerah/provinsi/${region.slug}`}
            className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary"
          >
            <p className="text-lg font-semibold">{region.name}</p>
            <p className="text-sm text-muted-foreground">{region.province}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
