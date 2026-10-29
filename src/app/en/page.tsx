import type { Metadata } from "next";
import Link from "next/link";
import { NewsCard } from "@/components/news/news-card";
import { getEnglishArticles } from "@/lib/content/repository";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "English Edition",
  description: `${site.name} English-language news selection.`,
};

export default async function EnglishHomePage() {
  const articles = await getEnglishArticles(12);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-primary">
            English Edition
          </p>
          <h1 className="font-serif text-3xl font-bold">KabarDesk in English</h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Curated Indonesian and regional stories for international readers.
          </p>
        </div>
        <Link
          href="/"
          className="text-sm font-medium text-primary hover:underline"
        >
          ← Bahasa Indonesia
        </Link>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <NewsCard key={article.id} article={article} />
        ))}
      </div>

      {articles.length === 0 && (
        <p className="mt-8 text-muted-foreground">No English stories yet.</p>
      )}
    </div>
  );
}
