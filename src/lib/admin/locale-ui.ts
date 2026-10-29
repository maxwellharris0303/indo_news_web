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
    rss: "RSS & AI",
  },
  en: {
    overview: "Overview",
    articles: "Articles",
    compose: "New article",
    rss: "RSS & AI",
  },
} as const;

export const adminRssCopy = {
  id: {
    title: "RSS & rewrite AI",
    subtitle:
      "Ambil berita dari feed RSS, scrape opsional, rewrite dengan OpenAI atau Anthropic.",
    pollAll: "Poll semua feed",
    addFeed: "Tambah feed",
    feeds: "Feed",
    inbox: "Inbox",
    enabled: "Aktif",
    disabled: "Nonaktif",
    lastFetch: "Fetch terakhir",
    error: "Error",
    poll: "Poll",
    polling: "Memuat…",
    inboxNew: "baru di inbox",
    fieldName: "Nama",
    fieldFeedUrl: "URL feed",
    fieldSiteUrl: "URL situs",
    fieldCategory: "Kanal",
    fieldAuthor: "Penulis",
    fieldPollInterval: "Interval poll (menit)",
    feedsHint: "Klik Poll per sumber atau Poll semua feed. Logo diambil dari favicon situs.",
    edit: "Edit",
    delete: "Hapus",
    scrapeMode: "Mode konten",
    scrapeRssOnly: "RSS saja",
    scrapeFetch: "Scrape halaman artikel",
    aiProvider: "Provider AI",
    openai: "OpenAI",
    anthropic: "Anthropic",
    openaiKey: "OPENAI_API_KEY",
    anthropicKey: "ANTHROPIC_API_KEY",
    configured: "terkonfigurasi",
    missing: "belum diset",
    itemTitle: "Judul",
    itemSource: "Sumber",
    itemStatus: "Status",
    itemDate: "Tanggal",
    actions: "Aksi",
    view: "Detail",
    rewrite: "Rewrite → REVIEW",
    rewriting: "Sedang rewrite…",
    rewriteHint:
      "Scrape + OpenAI biasanya 30–90 detik. Jangan tutup tab ini.",
    ignore: "Abaikan",
    emptyInbox: "Belum ada item. Poll feed untuk mengisi inbox.",
    saveFeed: "Simpan feed",
    cancel: "Batal",
    rewriteOptions: "Opsi rewrite",
    feedDefaults: "Default feed",
    overrideHint: "Pilih provider AI dan mode scrape per aksi.",
  },
  en: {
    title: "RSS & AI rewrite",
    subtitle:
      "Ingest from RSS feeds, optional page scrape, rewrite with OpenAI or Anthropic.",
    pollAll: "Poll all feeds",
    addFeed: "Add feed",
    feeds: "Feeds",
    inbox: "Inbox",
    enabled: "Enabled",
    disabled: "Disabled",
    lastFetch: "Last fetch",
    error: "Error",
    poll: "Poll",
    polling: "Polling…",
    inboxNew: "new in inbox",
    fieldName: "Name",
    fieldFeedUrl: "Feed URL",
    fieldSiteUrl: "Site URL",
    fieldCategory: "Channel",
    fieldAuthor: "Author",
    fieldPollInterval: "Poll interval (min)",
    feedsHint: "Use Poll on each source or Poll all feeds. Logos come from site favicons.",
    edit: "Edit",
    delete: "Delete",
    scrapeMode: "Content mode",
    scrapeRssOnly: "RSS only",
    scrapeFetch: "Scrape article page",
    aiProvider: "AI provider",
    openai: "OpenAI",
    anthropic: "Anthropic",
    openaiKey: "OPENAI_API_KEY",
    anthropicKey: "ANTHROPIC_API_KEY",
    configured: "configured",
    missing: "not set",
    itemTitle: "Title",
    itemSource: "Source",
    itemStatus: "Status",
    itemDate: "Date",
    actions: "Actions",
    view: "Detail",
    rewrite: "Rewrite → REVIEW",
    rewriting: "Rewriting…",
    rewriteHint:
      "Scrape + OpenAI usually takes 30–90 seconds. Keep this tab open.",
    ignore: "Ignore",
    emptyInbox: "No items yet. Poll feeds to fill the inbox.",
    saveFeed: "Save feed",
    cancel: "Cancel",
    rewriteOptions: "Rewrite options",
    feedDefaults: "Feed defaults",
    overrideHint: "Choose AI provider and scrape mode per action.",
  },
} as const;

export const rssItemStatusLabels: Record<
  AdminLocale,
  Record<string, string>
> = {
  id: {
    NEW: "Baru",
    IGNORED: "Diabaikan",
    QUEUED: "Antrean",
    REWRITING: "Rewriting",
    DRAFT_CREATED: "Artikel REVIEW",
    FAILED: "Gagal",
  },
  en: {
    NEW: "New",
    IGNORED: "Ignored",
    QUEUED: "Queued",
    REWRITING: "Rewriting",
    DRAFT_CREATED: "Article REVIEW",
    FAILED: "Failed",
  },
};

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

export function rssText(locale: AdminLocale) {
  return adminRssCopy[locale];
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
