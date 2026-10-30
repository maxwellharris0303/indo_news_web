"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ArticleStatus } from "@prisma/client";
import { requireStaff } from "@/lib/admin/require-staff";
import {
  applyArticleUrgency,
  BREAKING_HOUR_OPTIONS,
  DEFAULT_BREAKING_HOURS,
  type UrgencyMode,
} from "@/lib/content/urgency";
import { prisma } from "@/lib/db";
import { isCategorySlug } from "@/lib/site";
import { z } from "zod";

const BULK_STATUS_ALLOWED: ArticleStatus[] = [
  "REVIEW",
  "PUBLISHED",
  "CORRECTED",
  "ARCHIVED",
  "DRAFT",
  "SCHEDULED",
];

const FEATURED_LEVELS = [0, 1, 2, 3] as const;
export type FeaturedLevel = (typeof FEATURED_LEVELS)[number];

function parseFeaturedLevel(raw: unknown): FeaturedLevel {
  const n = Number(raw);
  if (n === 1 || n === 2 || n === 3) return n;
  return 0;
}

const articleSchema = z.object({
  title: z.string().min(10),
  slug: z.string().min(3),
  category: z.string().min(2),
  dek: z.string().min(10),
  body: z.string().min(50),
  authorId: z.string(),
  status: z
    .enum([
      "DRAFT",
      "REVIEW",
      "SCHEDULED",
      "PUBLISHED",
      "CORRECTED",
      "ARCHIVED",
    ])
    .default("PUBLISHED"),
  featuredLevel: z.coerce.number().int().min(0).max(3).default(0),
  editorialOrigin: z.enum(["ORIGINAL", "RSS_REWRITE"]).default("ORIGINAL"),
});

export async function createArticleFormAction(formData: FormData) {
  const result = await createArticleAction(formData);
  if (result.ok) {
    redirect(
      `/admin/artikel?saved=1&slug=${encodeURIComponent(result.slug)}`,
    );
  }
  const err =
    result.error === "Slug sudah dipakai atau gagal simpan"
      ? "slug"
      : "validasi";
  redirect(`/admin/artikel/baru?error=${err}`);
}

export async function createArticleAction(formData: FormData) {
  await requireStaff();

  const parsed = articleSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    category: formData.get("category"),
    dek: formData.get("dek"),
    body: formData.get("body"),
    authorId: formData.get("authorId"),
    status: formData.get("status") ?? "PUBLISHED",
    featuredLevel: formData.get("featuredLevel") ?? "0",
    editorialOrigin: formData.get("editorialOrigin") ?? "ORIGINAL",
  });

  if (!parsed.success) {
    return { ok: false as const, error: "Validasi gagal" };
  }

  const data = parsed.data;
  if (!isCategorySlug(data.category)) {
    return { ok: false as const, error: "Kategori tidak valid" };
  }
  const id = `a-${data.slug.slice(0, 24)}`;

  try {
    await prisma.article.create({
      data: {
        id,
        slug: data.slug,
        category: data.category,
      title: data.title,
      dek: data.dek,
      body: data.body,
      summaryBullets: JSON.stringify([
        "Artikel baru dari redaksi KabarDesk.",
        "Detail lengkap ada di isi berita.",
        "Ikuti pembaruan di kanal terkait.",
      ]),
      publishedAt: new Date(),
      authorId: data.authorId,
      imageUrl: `https://picsum.photos/seed/kabardesk-${data.slug.slice(0, 20)}/1200/750`,
      imageCaption: "Ilustrasi berita",
      imageCredit: "KabarDesk",
      sources: JSON.stringify(["Redaksi KabarDesk"]),
      featuredLevel: parseFeaturedLevel(data.featuredLevel),
      viewCount: 0,
      status: data.status,
      editorialOrigin: data.editorialOrigin,
      locale: "id",
      galleryImages: "[]",
      aiSummary: "Artikel baru dari redaksi KabarDesk.",
      },
    });
  } catch {
    return { ok: false as const, error: "Slug sudah dipakai atau gagal simpan" };
  }

  const urgency = parseUrgencyFromForm(formData);
  if (urgency !== "none") {
    const hours = parseBreakingHours(formData);
    await applyArticleUrgency(id, urgency, hours);
  }

  revalidatePath("/");
  revalidatePath(`/${data.category}`);
  revalidatePath(`/${data.category}/${data.slug}`);
  revalidatePath("/admin");
  revalidatePath("/admin/artikel");
  revalidatePath("/indeks");
  if (data.category === "daerah") {
    revalidatePath(`/daerah/${data.slug}`);
  }

  const featured = parseFeaturedLevel(data.featuredLevel);
  if (featured === 3) {
    await demoteOtherHeroArticles(id, "id");
  }

  return { ok: true as const, id, category: data.category, slug: data.slug };
}

export async function deleteArticleFormAction(formData: FormData) {
  await deleteArticleAction(formData);
}

export async function deleteArticleAction(formData: FormData) {
  await requireStaff();

  const articleId = String(formData.get("articleId") ?? "").trim();
  if (!articleId) {
    return { ok: false as const, error: "Artikel tidak ditemukan" };
  }

  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { category: true, slug: true },
  });
  if (!article) {
    return { ok: false as const, error: "Artikel tidak ditemukan" };
  }

  await prisma.article.delete({ where: { id: articleId } });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/artikel");
  revalidatePath("/indeks");
  revalidatePath(`/${article.category}`);
  if (article.category === "daerah") {
    revalidatePath(`/daerah/${article.slug}`);
  } else {
    revalidatePath(`/${article.category}/${article.slug}`);
  }

  return { ok: true as const };
}

export async function bulkUpdateArticleStatusAction(
  articleIds: string[],
  status: ArticleStatus,
) {
  await requireStaff();
  if (!BULK_STATUS_ALLOWED.includes(status)) {
    return { ok: false as const, error: "Status tidak valid" };
  }
  const ids = [...new Set(articleIds.map((id) => id.trim()).filter(Boolean))];
  if (ids.length === 0) {
    return { ok: false as const, error: "Tidak ada artikel dipilih" };
  }
  if (ids.length > 100) {
    return { ok: false as const, error: "Maksimal 100 artikel per aksi" };
  }

  const clearUrgency = !["PUBLISHED", "CORRECTED"].includes(status);
  const result = await prisma.article.updateMany({
    where: { id: { in: ids } },
    data: {
      status,
      ...(clearUrgency
        ? {
            isBreaking: false,
            isDeveloping: false,
            breakingExpiresAt: null,
          }
        : {}),
    },
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/artikel");
  revalidatePath("/indeks");
  revalidatePath("/api/articles");

  return { ok: true as const, count: result.count };
}

function parseUrgencyFromForm(formData: FormData): UrgencyMode {
  if (formData.get("markDeveloping") === "on") return "developing";
  if (formData.get("markBreaking") === "on") return "breaking";
  const raw = String(formData.get("urgency") ?? "").trim();
  if (raw === "breaking" || raw === "developing" || raw === "none") return raw;
  return "none";
}

function parseBreakingHours(formData: FormData): number {
  const raw = Number(formData.get("breakingHours"));
  if (BREAKING_HOUR_OPTIONS.includes(raw as (typeof BREAKING_HOUR_OPTIONS)[number])) {
    return raw;
  }
  return DEFAULT_BREAKING_HOURS;
}

export async function setArticleUrgencyAction(
  articleId: string,
  mode: UrgencyMode,
  breakingHours = DEFAULT_BREAKING_HOURS,
) {
  await requireStaff();
  const id = articleId.trim();
  if (!id) {
    return { ok: false as const, error: "Artikel tidak ditemukan" };
  }
  if (mode !== "none" && mode !== "breaking" && mode !== "developing") {
    return { ok: false as const, error: "Mode tidak valid" };
  }

  const result = await applyArticleUrgency(id, mode, breakingHours);
  if (!result.ok) return result;

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/artikel");
  revalidatePath("/indeks");

  return { ok: true as const };
}

export async function setArticleUrgencyFormAction(formData: FormData) {
  await requireStaff();
  const articleId = String(formData.get("articleId") ?? "").trim();
  const mode = parseUrgencyFromForm(formData);
  const hours = parseBreakingHours(formData);
  const returnTo = String(formData.get("returnTo") ?? "/admin/artikel").trim();

  const result = await setArticleUrgencyAction(articleId, mode, hours);
  if (!result.ok) {
    redirect(`${returnTo}${returnTo.includes("?") ? "&" : "?"}urgencyError=1`);
  }
  redirect(returnTo);
}

async function demoteOtherHeroArticles(
  articleId: string,
  locale: string,
): Promise<void> {
  await prisma.article.updateMany({
    where: {
      locale,
      featuredLevel: 3,
      id: { not: articleId },
    },
    data: { featuredLevel: 1 },
  });
}

function revalidateHomeAndArticles() {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/artikel");
  revalidatePath("/indeks");
  revalidatePath("/api/articles");
}

export async function setArticleFeaturedLevelAction(
  articleId: string,
  featuredLevel: FeaturedLevel,
) {
  await requireStaff();
  const id = articleId.trim();
  if (!id) {
    return { ok: false as const, error: "Artikel tidak ditemukan" };
  }
  const level = parseFeaturedLevel(featuredLevel);
  if (!FEATURED_LEVELS.includes(level)) {
    return { ok: false as const, error: "Level sorotan tidak valid" };
  }

  const article = await prisma.article.findUnique({
    where: { id },
    select: { locale: true },
  });
  if (!article) {
    return { ok: false as const, error: "Artikel tidak ditemukan" };
  }

  if (level === 3) {
    await demoteOtherHeroArticles(id, article.locale);
  }

  await prisma.article.update({
    where: { id },
    data: { featuredLevel: level },
  });

  revalidateHomeAndArticles();
  return { ok: true as const };
}

export async function setArticleFeaturedLevelFormAction(formData: FormData) {
  await requireStaff();
  const articleId = String(formData.get("articleId") ?? "").trim();
  const level = parseFeaturedLevel(formData.get("featuredLevel"));
  const returnTo = String(formData.get("returnTo") ?? "/admin/artikel").trim();

  const result = await setArticleFeaturedLevelAction(articleId, level);
  if (!result.ok) {
    redirect(`${returnTo}${returnTo.includes("?") ? "&" : "?"}featuredError=1`);
  }
  redirect(returnTo);
}

export async function bulkSetArticleFeaturedLevelAction(
  articleIds: string[],
  featuredLevel: FeaturedLevel,
) {
  await requireStaff();
  const level = parseFeaturedLevel(featuredLevel);
  if (level !== 0 && level !== 1 && level !== 3) {
    return { ok: false as const, error: "Level sorotan tidak valid" };
  }
  const ids = [...new Set(articleIds.map((id) => id.trim()).filter(Boolean))];
  if (ids.length === 0) {
    return { ok: false as const, error: "Tidak ada artikel dipilih" };
  }
  if (ids.length > 100) {
    return { ok: false as const, error: "Maksimal 100 artikel per aksi" };
  }

  if (level === 3) {
    if (ids.length !== 1) {
      return {
        ok: false as const,
        error: "Hero utama: pilih tepat satu artikel",
      };
    }
    const article = await prisma.article.findUnique({
      where: { id: ids[0] },
      select: { locale: true },
    });
    if (!article) {
      return { ok: false as const, error: "Artikel tidak ditemukan" };
    }
    await demoteOtherHeroArticles(ids[0]!, article.locale);
    await prisma.article.update({
      where: { id: ids[0] },
      data: { featuredLevel: 3 },
    });
    revalidateHomeAndArticles();
    return { ok: true as const, count: 1 };
  }

  const result = await prisma.article.updateMany({
    where: { id: { in: ids } },
    data: { featuredLevel: level },
  });

  revalidateHomeAndArticles();
  return { ok: true as const, count: result.count };
}
