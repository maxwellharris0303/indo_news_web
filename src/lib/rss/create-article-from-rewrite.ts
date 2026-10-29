import type { RewriteOutput } from "@/lib/ai/rewrite-schema";
import { prisma } from "@/lib/db";
import { slugify, uniqueArticleSlug } from "@/lib/slugify";
import { resolveStoredArticleImageUrl } from "@/lib/article-image";
import { isCategorySlug } from "@/lib/site";

export async function createReviewArticleFromRewrite(input: {
  rssItemId: string;
  output: RewriteOutput;
  authorId: string;
  locale: string;
  sourceUrl: string;
  sourceName: string;
  imageUrl?: string | null;
}): Promise<{ ok: true; articleId: string; slug: string; category: string } | { ok: false; error: string }> {
  const category = isCategorySlug(input.output.suggestedCategory)
    ? input.output.suggestedCategory
    : "nasional";
  const baseSlug = slugify(input.output.title) || slugify("artikel-rss");
  const slug = await uniqueArticleSlug(category, baseSlug);

  const sources = JSON.stringify([
    input.output.attributionLine,
    input.sourceName,
    input.sourceUrl,
  ]);

  const id = `a-rss-${slug.slice(0, 20)}-${Date.now().toString(36)}`;
  const imageUrl = resolveStoredArticleImageUrl(input.imageUrl, slug);

  try {
    await prisma.$transaction(async (tx) => {
      await tx.article.create({
        data: {
          id,
          slug,
          category,
          locale: input.locale,
          status: "REVIEW",
          title: input.output.title,
          dek: input.output.dek,
          body: input.output.body,
          summaryBullets: JSON.stringify(input.output.summaryBullets),
          aiSummary: input.output.dek,
          publishedAt: new Date(),
          authorId: input.authorId,
          imageUrl,
          imageCaption: "Ilustrasi berita",
          imageCredit: input.sourceName,
          sources,
          featuredLevel: 0,
          viewCount: 0,
          galleryImages: "[]",
          verificationStatus: "verified",
        },
      });
      await tx.rssItem.update({
        where: { id: input.rssItemId },
        data: {
          articleId: id,
          status: "DRAFT_CREATED",
        },
      });
    });
    return { ok: true, articleId: id, slug, category };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Gagal simpan artikel",
    };
  }
}
