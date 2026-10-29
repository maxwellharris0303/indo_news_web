export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export async function uniqueArticleSlug(
  category: string,
  baseSlug: string,
  excludeArticleId?: string,
): Promise<string> {
  const { prisma } = await import("@/lib/db");
  let slug = baseSlug || "artikel";
  let n = 0;
  while (n < 50) {
    const existing = await prisma.article.findUnique({
      where: { category_slug: { category, slug } },
      select: { id: true },
    });
    if (!existing || existing.id === excludeArticleId) return slug;
    n += 1;
    slug = `${baseSlug}-${n}`;
  }
  return `${baseSlug}-${Date.now()}`;
}
