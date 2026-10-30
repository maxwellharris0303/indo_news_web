"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { AiRewriteProvider, RssScrapeMode } from "@prisma/client";
import { z } from "zod";
import { rewriteArticleFromSource, aiProviderConfigured } from "@/lib/ai/rewrite-article";
import { REWRITE_PROMPT_VERSION } from "@/lib/ai/rewrite-schema";
import { requireStaff } from "@/lib/admin/require-staff";
import { prisma } from "@/lib/db";
import { createReviewArticleFromRewrite } from "@/lib/rss/create-article-from-rewrite";
import {
  ensureItemExtracted,
  pollAllEnabledFeeds,
  pollSingleFeed,
} from "@/lib/rss/poll-feeds";
import { isCategorySlug } from "@/lib/site";

const feedSchema = z.object({
  name: z.string().min(2),
  siteUrl: z.string().url(),
  feedUrl: z.string().url(),
  enabled: z.coerce.boolean(),
  scrapeMode: z.enum(["RSS_ONLY", "FETCH_ARTICLE"]),
  defaultCategory: z.string(),
  defaultAiProvider: z.enum(["OPENAI", "ANTHROPIC"]),
  defaultAuthorId: z.string().min(1),
  pollIntervalMinutes: z.coerce.number().int().min(5).max(1440),
});

function revalidateRss() {
  revalidatePath("/admin/rss");
}

export async function pollAllRssFeedsAction() {
  await requireStaff();
  const results = await pollAllEnabledFeeds();
  revalidateRss();
  return { ok: true as const, results };
}

export async function pollRssFeedAction(feedId: string) {
  await requireStaff();
  const feed = await prisma.rssFeed.findUnique({ where: { id: feedId } });
  if (!feed) return { ok: false as const, error: "Feed tidak ditemukan" };
  const result = await pollSingleFeed(feed);
  revalidateRss();
  return { ok: true as const, result };
}

export async function pollRssFeedFormAction(feedId: string) {
  await pollRssFeedAction(feedId);
  redirect("/admin/rss");
}

export async function deleteRssFeedFormAction(feedId: string) {
  await deleteRssFeedAction(feedId);
  redirect("/admin/rss");
}

export async function upsertRssFeedAction(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id") ?? "").trim() || undefined;
  const parsed = feedSchema.safeParse({
    name: formData.get("name"),
    siteUrl: formData.get("siteUrl"),
    feedUrl: formData.get("feedUrl"),
    enabled: formData
      .getAll("enabled")
      .some((v) => v === "true" || v === "on"),
    scrapeMode: formData.get("scrapeMode"),
    defaultCategory: formData.get("defaultCategory"),
    defaultAiProvider: formData.get("defaultAiProvider"),
    defaultAuthorId: formData.get("defaultAuthorId"),
    pollIntervalMinutes: formData.get("pollIntervalMinutes") ?? 30,
  });
  if (!parsed.success) {
    return { ok: false as const, error: "Validasi feed gagal" };
  }
  const data = parsed.data;
  if (!isCategorySlug(data.defaultCategory)) {
    return { ok: false as const, error: "Kategori default tidak valid" };
  }
  try {
    if (id) {
      await prisma.rssFeed.update({
        where: { id },
        data: {
          name: data.name,
          siteUrl: data.siteUrl,
          feedUrl: data.feedUrl,
          enabled: data.enabled,
          scrapeMode: data.scrapeMode as RssScrapeMode,
          defaultCategory: data.defaultCategory,
          defaultAiProvider: data.defaultAiProvider as AiRewriteProvider,
          defaultAuthorId: data.defaultAuthorId,
          pollIntervalMinutes: data.pollIntervalMinutes,
        },
      });
    } else {
      await prisma.rssFeed.create({ data });
    }
  } catch {
    return { ok: false as const, error: "Feed URL duplikat atau gagal simpan" };
  }
  revalidateRss();
  return { ok: true as const };
}

export async function upsertRssFeedFormAction(formData: FormData) {
  const res = await upsertRssFeedAction(formData);
  redirect(res.ok ? "/admin/rss" : "/admin/rss?feedError=1");
}

export async function deleteRssFeedAction(feedId: string) {
  await requireStaff();
  await prisma.rssFeed.delete({ where: { id: feedId } });
  revalidateRss();
  return { ok: true as const };
}

export async function ignoreRssItemAction(itemId: string) {
  await requireStaff();
  await prisma.rssItem.update({
    where: { id: itemId },
    data: { status: "IGNORED" },
  });
  revalidateRss();
  revalidatePath(`/admin/rss/items/${itemId}`);
  return { ok: true as const };
}

export async function ignoreRssItemFormAction(itemId: string) {
  await ignoreRssItemAction(itemId);
  redirect("/admin/rss");
}

export async function bulkIgnoreRssItemsAction(itemIds: string[]) {
  await requireStaff();
  const ids = [...new Set(itemIds.map((id) => id.trim()).filter(Boolean))];
  if (ids.length === 0) {
    return { ok: false as const, error: "Tidak ada item dipilih" };
  }
  if (ids.length > 500) {
    return { ok: false as const, error: "Maksimal 500 item per aksi" };
  }
  const result = await prisma.rssItem.updateMany({
    where: {
      id: { in: ids },
      status: { notIn: ["DRAFT_CREATED", "IGNORED"] },
    },
    data: { status: "IGNORED" },
  });
  revalidateRss();
  return { ok: true as const, count: result.count };
}

/** Mark all NEW items ignored except the newest `keepCount` (optionally per feed). */
export async function ignoreNewRssExceptLatestAction(input: {
  keepCount: number;
  feedId?: string | null;
}) {
  await requireStaff();
  const keepCount = Math.min(Math.max(input.keepCount, 0), 50);
  const feedId = input.feedId?.trim() || undefined;

  const keep = await prisma.rssItem.findMany({
    where: {
      status: "NEW",
      ...(feedId ? { feedId } : {}),
    },
    orderBy: [{ pubDate: "desc" }, { fetchedAt: "desc" }],
    take: keepCount,
    select: { id: true },
  });
  const keepIds = keep.map((k) => k.id);

  const result = await prisma.rssItem.updateMany({
    where: {
      status: "NEW",
      ...(feedId ? { feedId } : {}),
      ...(keepIds.length > 0 ? { id: { notIn: keepIds } } : {}),
    },
    data: { status: "IGNORED" },
  });
  revalidateRss();
  return { ok: true as const, ignored: result.count, kept: keepIds.length };
}

export async function rewriteRssItemAction(input: {
  itemId: string;
  aiProvider?: AiRewriteProvider;
  scrapeMode?: RssScrapeMode;
}) {
  await requireStaff();
  try {
  const item = await prisma.rssItem.findUnique({
    where: { id: input.itemId },
    include: { feed: true },
  });
  if (!item) return { ok: false as const, error: "Item tidak ditemukan" };
  if (item.articleId) {
    return { ok: false as const, error: "Artikel sudah dibuat dari item ini" };
  }

  const aiProvider =
    input.aiProvider ?? item.feed.defaultAiProvider;
  const scrapeMode = input.scrapeMode ?? item.feed.scrapeMode;

  if (!aiProviderConfigured(aiProvider)) {
    return {
      ok: false as const,
      error:
        aiProvider === "OPENAI"
          ? "OPENAI_API_KEY belum diset di server"
          : "ANTHROPIC_API_KEY belum diset di server",
    };
  }

  if (item.status === "REWRITING") {
    const staleMs = Date.now() - item.updatedAt.getTime();
    if (staleMs < 120_000) {
      return {
        ok: false as const,
        error:
          "Rewrite masih berjalan. Tunggu ~1 menit atau refresh jika macet.",
      };
    }
    await prisma.rssItem.update({
      where: { id: item.id },
      data: { status: "NEW", lastError: null },
    });
  }

  const job = await prisma.rewriteJob.create({
    data: {
      rssItemId: item.id,
      aiProvider,
      scrapeMode,
      status: "RUNNING",
      promptVersion: REWRITE_PROMPT_VERSION,
    },
  });

  await prisma.rssItem.update({
    where: { id: item.id },
    data: { status: "REWRITING", lastError: null },
  });

  const extracted = await ensureItemExtracted(item.id, scrapeMode);
  if (!extracted.ok) {
    await prisma.rewriteJob.update({
      where: { id: job.id },
      data: { status: "FAILED", error: extracted.error, completedAt: new Date() },
    });
    await prisma.rssItem.update({
      where: { id: item.id },
      data: { status: "FAILED", lastError: extracted.error },
    });
    revalidateRss();
    return { ok: false as const, error: extracted.error, jobId: job.id };
  }

  const rewrite = await rewriteArticleFromSource({
    provider: aiProvider,
    sourceTitle: item.title,
    sourceUrl: item.link,
    sourceName: item.feed.name,
    body: extracted.body,
    locale: item.feed.defaultLocale,
  });

  if (!rewrite.ok) {
    await prisma.rewriteJob.update({
      where: { id: job.id },
      data: {
        status: "FAILED",
        error: rewrite.error,
        completedAt: new Date(),
      },
    });
    await prisma.rssItem.update({
      where: { id: item.id },
      data: { status: "FAILED", lastError: rewrite.error },
    });
    revalidateRss();
    return { ok: false as const, error: rewrite.error, jobId: job.id };
  }

  await prisma.rewriteJob.update({
    where: { id: job.id },
    data: {
      status: "COMPLETED",
      model: rewrite.model,
      outputJson: JSON.stringify(rewrite.output),
      completedAt: new Date(),
    },
  });

  const created = await createReviewArticleFromRewrite({
    rssItemId: item.id,
    output: rewrite.output,
    authorId: item.feed.defaultAuthorId,
    locale: item.feed.defaultLocale,
    sourceUrl: item.link,
    sourceName: item.feed.name,
    imageUrl: item.imageUrl,
  });

  if (!created.ok) {
    await prisma.rssItem.update({
      where: { id: item.id },
      data: { status: "FAILED", lastError: created.error },
    });
    revalidateRss();
    return { ok: false as const, error: created.error, jobId: job.id };
  }

  revalidatePath("/");
  revalidatePath("/admin/artikel");
  revalidateRss();
  revalidatePath(`/admin/rss/items/${item.id}`);

  return {
    ok: true as const,
    jobId: job.id,
    articleId: created.articleId,
    category: created.category,
    slug: created.slug,
  };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Rewrite gagal (server error)";
    await prisma.rssItem
      .update({
        where: { id: input.itemId },
        data: { status: "FAILED", lastError: message },
      })
      .catch(() => undefined);
    return { ok: false as const, error: message };
  }
}

/** Safety cap per request (sequential OpenAI calls). Raise via env if needed. */
const BATCH_REWRITE_MAX =
  Number(process.env.RSS_BATCH_REWRITE_MAX) > 0
    ? Number(process.env.RSS_BATCH_REWRITE_MAX)
    : 500;

export async function batchRewriteRssItemsAction(itemIds: string[]) {
  await requireStaff();
  const ids = [...new Set(itemIds.map((id) => id.trim()).filter(Boolean))];
  if (ids.length === 0) {
    return { ok: false as const, error: "Tidak ada item dipilih" };
  }
  if (ids.length > BATCH_REWRITE_MAX) {
    return {
      ok: false as const,
      error: `Maksimal ${BATCH_REWRITE_MAX} item per batch rewrite`,
    };
  }
  const results: {
    itemId: string;
    ok: boolean;
    error?: string;
    slug?: string;
  }[] = [];
  for (const itemId of ids) {
    const res = await rewriteRssItemAction({ itemId });
    results.push({
      itemId,
      ok: res.ok,
      error: res.ok ? undefined : res.error,
      slug: res.ok ? res.slug : undefined,
    });
  }
  revalidateRss();
  revalidatePath("/admin/artikel");
  return { ok: true as const, results };
}

export async function getRssBatchProgressAction(itemIds: string[]) {
  await requireStaff();
  const ids = [...new Set(itemIds.map((id) => id.trim()).filter(Boolean))];
  if (ids.length === 0) {
    return {
      ok: true as const,
      total: 0,
      completed: 0,
      failed: 0,
      rewriting: 0,
    };
  }
  const rows = await prisma.rssItem.findMany({
    where: { id: { in: ids } },
    select: { id: true, status: true, articleId: true },
  });
  let completed = 0;
  let failed = 0;
  let rewriting = 0;
  for (const row of rows) {
    if (row.articleId || row.status === "DRAFT_CREATED") completed += 1;
    else if (row.status === "FAILED") failed += 1;
    else if (row.status === "REWRITING") rewriting += 1;
  }
  return {
    ok: true as const,
    total: ids.length,
    completed,
    failed,
    rewriting,
  };
}

export async function rewriteRssItemFormAction(formData: FormData) {
  const itemId = String(formData.get("itemId") ?? "");
  const aiProvider = String(formData.get("aiProvider") ?? "") as AiRewriteProvider;
  const scrapeMode = String(formData.get("scrapeMode") ?? "") as RssScrapeMode;
  const res = await rewriteRssItemAction({
    itemId,
    aiProvider: aiProvider === "ANTHROPIC" ? "ANTHROPIC" : "OPENAI",
    scrapeMode:
      scrapeMode === "FETCH_ARTICLE" ? "FETCH_ARTICLE" : "RSS_ONLY",
  });
  if (res.ok) {
    redirect(
      `/admin/artikel?saved=1&slug=${encodeURIComponent(res.slug)}`,
    );
  }
  redirect(
    `/admin/rss/items/${itemId}?error=${encodeURIComponent(res.error)}`,
  );
}
