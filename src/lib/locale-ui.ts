import type { SiteLocale } from "@/lib/locale";

const navLabels = {
  id: {
    nasional: "Nasional",
    internasional: "Internasional",
    daerah: "Daerah",
    ekonomi: "Ekonomi",
    politik: "Politik & Hukum",
    olahraga: "Olahraga",
    tekno: "Tekno",
    gaya: "Gaya Hidup",
    indeks: "Indeks",
    search: "Cari berita",
    menuOpen: "Buka menu navigasi",
    menuClose: "Tutup menu",
    language: "Bahasa",
    indexNews: "Indeks Berita",
  },
  en: {
    nasional: "National",
    internasional: "World",
    daerah: "Regions",
    ekonomi: "Business",
    politik: "Politics & Law",
    olahraga: "Sports",
    tekno: "Tech",
    gaya: "Lifestyle",
    indeks: "Index",
    search: "Search news",
    menuOpen: "Open navigation menu",
    menuClose: "Close menu",
    language: "Language",
    indexNews: "News index",
  },
} as const;

export const homeCopy = {
  id: {
    forYou: "Untuk kamu",
    forYouSub: "Berdasarkan minat di akun KabarDesk",
    hotTopics: "Topik hangat",
    hotTopicsSub: "Liputan berkelanjutan dari redaksi KabarDesk",
    yourRegion: "Daerah kamu",
    latest: "Terkini",
    viewIndex: "Lihat indeks",
    popular: "Terpopuler",
    editorPicks: "Pilihan editor",
    regions: "Daerah",
    allProvinces: "Semua provinsi",
    localCoverage: "Liputan lokal",
    factCheck: "Cek Fakta",
    factCheckSub: "Verifikasi klaim viral sebelum share",
    allFactCheck: "Semua cek fakta",
    loadMore: "Muat berita lagi",
    loading: "Memuat...",
  },
  en: {
    forYou: "For you",
    forYouSub: "Based on your KabarDesk interests",
    hotTopics: "Hot topics",
    hotTopicsSub: "Ongoing coverage from the KabarDesk desk",
    yourRegion: "Your region",
    latest: "Latest",
    viewIndex: "View index",
    popular: "Most read",
    editorPicks: "Editor's picks",
    regions: "Regions",
    allProvinces: "All provinces",
    localCoverage: "Local coverage",
    factCheck: "Fact check",
    factCheckSub: "Verify viral claims before you share",
    allFactCheck: "All fact checks",
    loadMore: "Load more stories",
    loading: "Loading...",
  },
} as const;

export function navCopy(locale: SiteLocale) {
  return navLabels[locale];
}

export function homeText(locale: SiteLocale) {
  return homeCopy[locale];
}
