import { isRegionHubSlug, type RegionHubSlug } from "@/lib/regions";

export const regionHubLabels: Record<RegionHubSlug, string> = {
  "dki-jakarta": "DKI Jakarta",
  "jawa-barat": "Jawa Barat",
  "jawa-timur": "Jawa Timur",
  "jawa-tengah": "Jawa Tengah",
  bali: "Bali",
  "sulawesi-selatan": "Sulawesi Selatan",
};

/** Short labels for account region picker buttons. */
export const accountRegionOptions = [
  { slug: "dki-jakarta" as const, label: "Jakarta" },
  { slug: "jawa-barat" as const, label: "Jawa Barat" },
  { slug: "bali" as const, label: "Bali" },
];

export function regionHubLabel(slug: string | null | undefined): string {
  if (!slug) return "belum dipilih";
  if (isRegionHubSlug(slug)) return regionHubLabels[slug];
  return slug;
}
