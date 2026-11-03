import { prisma } from "@/lib/db";
import { parseTopicSlugs } from "@/lib/topics/catalog";

export async function setArticleTopics(
  articleId: string,
  topicSlugs: string[],
): Promise<void> {
  const slugs = parseTopicSlugs(topicSlugs);
  await prisma.$transaction(async (tx) => {
    await tx.articleTopic.deleteMany({ where: { articleId } });
    for (const topicSlug of slugs) {
      await tx.articleTopic.create({ data: { articleId, topicSlug } });
    }
  });
}
