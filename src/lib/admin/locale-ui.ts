import type { AdminLocale } from "@/lib/admin-locale";
import {
  categoryLabels,
  type CategorySlug,
} from "@/lib/site";

export const adminShellCopy = {
  id: {
    desk: "Redaksi",
    viewSite: "Lihat situs",
    account: "Akun",
    switchToEn: "Switch to English",
    switchToId: "Ganti ke Bahasa Indonesia",
  },
  en: {
    desk: "Editorial",
    viewSite: "View site",
    account: "Account",
    switchToEn: "Switch to English",
    switchToId: "Switch to Bahasa Indonesia",
  },
} as const;

export const adminNavCopy = {
  id: {
    overview: "Ringkasan",
    articles: "Artikel",
    compose: "Tulis baru",
  },
  en: {
    overview: "Overview",
    articles: "Articles",
    compose: "New article",
  },
} as const;

export const adminDashboardCopy = {
  id: {
    title: "Ringkasan",
    subtitle: "Pantau publikasi, engagement, dan antrean redaksi.",
    newArticle: "+ Tulis artikel",
    workflow: "Alur workflow",
    workflowSub: "Distribusi status seluruh artikel di database.",
    topPopular: "Terpopuler",
    topPopularSub: "Berdasarkan views",
    recent: "Terbaru",
    recentSub: "8 publikasi terakhir",
    allArticles: "Semua",
    statTotal: "Total artikel",
    statTotalHint: (n: number) => `${n} terbit / koreksi`,
    statViews: "Total views",
    statViewsHint: "Akumulasi seluruh artikel",
    statQueue: "Antrean redaksi",
    statQueueHint: (d: number, r: number) => `${d} draft · ${r} review/jadwal`,
    statCommunity: "Komunitas",
    statCommunityHint: (c: number, s: number) =>
      `${c} komentar · ${s} langganan newsletter`,
  },
  en: {
    title: "Overview",
    subtitle: "Track publishing, engagement, and the editorial queue.",
    newArticle: "+ New article",
    workflow: "Workflow",
    workflowSub: "Status distribution for all articles in the database.",
    topPopular: "Top stories",
    topPopularSub: "By page views",
    recent: "Recent",
    recentSub: "Last 8 publications",
    allArticles: "View all",
    statTotal: "Total articles",
    statTotalHint: (n: number) => `${n} published / corrected`,
    statViews: "Total views",
    statViewsHint: "Across all articles",
    statQueue: "Editorial queue",
    statQueueHint: (d: number, r: number) => `${d} draft · ${r} review/scheduled`,
    statCommunity: "Community",
    statCommunityHint: (c: number, s: number) =>
      `${c} comments · ${s} newsletter subscribers`,
  },
} as const;

export const adminStatusLabels: Record<
  AdminLocale,
  Record<string, string>
> = {
  id: {
    DRAFT: "Draft",
    REVIEW: "Review",
    SCHEDULED: "Terjadwal",
    PUBLISHED: "Terbit",
    CORRECTED: "Koreksi",
    ARCHIVED: "Arsip",
  },
  en: {
    DRAFT: "Draft",
    REVIEW: "Review",
    SCHEDULED: "Scheduled",
    PUBLISHED: "Published",
    CORRECTED: "Corrected",
    ARCHIVED: "Archived",
  },
};

export const adminArticlesCopy = {
  id: {
    title: "Daftar artikel",
    new: "+ Tulis baru",
    saved: "Artikel berhasil disimpan",
    search: "Cari judul",
    searchPh: "Kata kunci...",
    status: "Status",
    allStatus: "Semua status",
    channel: "Kanal",
    allChannels: "Semua kanal",
    apply: "Terapkan filter",
    reset: "Reset",
    empty: "Tidak ada artikel untuk filter ini.",
    prev: "← Sebelumnya",
    next: "Berikutnya →",
    perPage: "per halaman",
    colTitle: "Judul",
    colStatus: "Status",
    colViews: "Views",
    colActions: "Aksi",
  },
  en: {
    title: "Article list",
    new: "+ New article",
    saved: "Article saved successfully",
    search: "Search title",
    searchPh: "Keywords...",
    status: "Status",
    allStatus: "All statuses",
    channel: "Channel",
    allChannels: "All channels",
    apply: "Apply filters",
    reset: "Reset",
    empty: "No articles match these filters.",
    prev: "← Previous",
    next: "Next →",
    perPage: "per page",
    colTitle: "Title",
    colStatus: "Status",
    colViews: "Views",
    colActions: "Actions",
  },
} as const;

export const adminActionsCopy = {
  id: {
    view: "Lihat",
    delete: "Hapus",
    update: "Update",
    statusAria: "Status artikel",
    deleteConfirmIntro: "Hapus artikel",
    deleteConfirmDetail:
      "Tindakan ini permanen (komentar & simpanan terkait ikut terhapus).",
  },
  en: {
    view: "View",
    delete: "Delete",
    update: "Update",
    statusAria: "Article status",
    deleteConfirmIntro: "Delete article",
    deleteConfirmDetail:
      "This is permanent (related comments and saves will be removed).",
  },
} as const;

export const adminCategoryLabels: Record<
  AdminLocale,
  Record<CategorySlug, string>
> = {
  id: categoryLabels,
  en: {
    nasional: "National",
    internasional: "International",
    ekonomi: "Economy",
    "politik-hukum": "Politics & Law",
    olahraga: "Sports",
    tekno: "Tech",
    "gaya-hidup": "Lifestyle",
    daerah: "Regions",
    opini: "Opinion",
    multimedia: "Multimedia",
  },
};

export const adminComposeCopy = {
  id: {
    title: "Tulis artikel baru",
    subtitle:
      "Judul, slug, kanal, dan status publikasi. Gambar hero otomatis dari seed slug.",
  },
  en: {
    title: "Write new article",
    subtitle:
      "Title, slug, channel, and publish status. Hero image is auto-seeded from the slug.",
  },
} as const;

export function shellText(locale: AdminLocale) {
  return adminShellCopy[locale];
}

export function navText(locale: AdminLocale) {
  return adminNavCopy[locale];
}

export function dashboardText(locale: AdminLocale) {
  return adminDashboardCopy[locale];
}

export function articlesText(locale: AdminLocale) {
  return adminArticlesCopy[locale];
}

export function composeText(locale: AdminLocale) {
  return adminComposeCopy[locale];
}

export function actionsText(locale: AdminLocale) {
  return adminActionsCopy[locale];
}

export function adminCategoryLabel(
  slug: string,
  locale: AdminLocale,
): string {
  if (slug in adminCategoryLabels[locale]) {
    return adminCategoryLabels[locale][slug as CategorySlug];
  }
  return slug;
}

export function formatCountAdmin(n: number, locale: AdminLocale): string {
  return n.toLocaleString(locale === "en" ? "en-US" : "id-ID");
}
