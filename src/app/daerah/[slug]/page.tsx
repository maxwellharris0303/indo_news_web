import { redirect } from "next/navigation";
import ArticlePage, {
  generateMetadata as generateArticleMetadata,
} from "@/app/[category]/[slug]/page";
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
    redirect(`/daerah/provinsi/${slug}`);
  }
  return ArticlePage({
    params: Promise.resolve({ category: "daerah", slug }),
  });
}
