import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NewsCard } from "@/components/news/news-card";
import { getArticles } from "@/lib/content/repository";
import { getSiteLocale } from "@/lib/locale";
import { categoryLabels, isCategorySlug } from "@/lib/site";

type Props = { params: Promise<{ category: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  if (!isCategorySlug(category)) return { title: "Kanal" };
  return {
    title: categoryLabels[category],
    description: `Berita ${categoryLabels[category]} terkini dari KabarDesk.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  if (!isCategorySlug(category)) notFound();

  const locale = await getSiteLocale();
  const articles = await getArticles({ category, limit: 30, locale });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <header className="mb-8 border-b border-border pb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          Kanal
        </p>
        <h1 className="font-serif text-3xl font-bold md:text-4xl">
          {categoryLabels[category]}
        </h1>
      </header>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <NewsCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}
