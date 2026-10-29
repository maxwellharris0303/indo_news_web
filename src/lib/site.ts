export const site = {
  name: "KabarDesk",
  tagline: "Berita Terkini, Terpercaya, Dekat Kamu",
  description:
    "Portal berita Indonesia dengan cek fakta, liputan daerah, dan ringkasan cepat untuk pembaca modern.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "id-ID",
  primaryColor: "#1D4ED8",
} as const;

export const navMain = [
  { label: "Nasional", href: "/nasional" },
  { label: "Internasional", href: "/internasional" },
  { label: "Daerah", href: "/daerah" },
  { label: "Ekonomi", href: "/ekonomi" },
  { label: "Politik & Hukum", href: "/politik-hukum" },
  { label: "Olahraga", href: "/olahraga" },
  { label: "Tekno", href: "/tekno" },
  { label: "Gaya Hidup", href: "/gaya-hidup" },
  { label: "Multimedia", href: "/multimedia" },
  { label: "Opini", href: "/opini" },
  { label: "Cek Fakta", href: "/cek-fakta" },
  { label: "Indeks", href: "/indeks" },
] as const;

export const categorySlugs = [
  "nasional",
  "internasional",
  "ekonomi",
  "politik-hukum",
  "olahraga",
  "tekno",
  "gaya-hidup",
  "daerah",
  "opini",
  "multimedia",
] as const;

export type CategorySlug = (typeof categorySlugs)[number];

export function isCategorySlug(value: string): value is CategorySlug {
  return (categorySlugs as readonly string[]).includes(value);
}

export const categoryLabels: Record<CategorySlug, string> = {
  nasional: "Nasional",
  internasional: "Internasional",
  ekonomi: "Ekonomi",
  "politik-hukum": "Politik & Hukum",
  olahraga: "Olahraga",
  tekno: "Tekno",
  "gaya-hidup": "Gaya Hidup",
  daerah: "Daerah",
  opini: "Opini",
  multimedia: "Multimedia",
};
