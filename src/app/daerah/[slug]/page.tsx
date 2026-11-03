import { redirect } from "next/navigation";
import ArticlePage, {
  generateMetadata as generateArticleMetadata,
} from "@/app/[category]/[slug]/page";
import { prisma } from "@/lib/db";
import { isRegionHubSlug } from "@/lib/regions";

export const dynamicParams = true;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  if (isRegionHubSlug(slug)) {
    return { title: "Daerah" };
  }
  return generateArticleMetadata({
    params: Promise.resolve({ category: "daerah", slug }),
  });
}

/** Daerah articles live at /daerah/[slug]; province hubs at /daerah/provinsi/[slug]. */
export default async function DaerahArticlePage({ params }: Props) {
  const { slug } = await params;
  if (isRegionHubSlug(slug)) {
    const article = await prisma.article.findUnique({
      where: { category_slug: { category: "daerah", slug } },
      select: { id: true },
    });
    if (!article) {
      redirect(`/daerah/provinsi/${slug}`);
    }
  }
  return ArticlePage({
    params: Promise.resolve({ category: "daerah", slug }),
  });
}
