import Link from "next/link";
import { getArticles } from "@/lib/content/repository";
import { formatShortWIB } from "@/lib/format";
import { categoryLabels } from "@/lib/site";

export const metadata = {
  title: "Indeks Berita",
  description: "Arsip berita KabarDesk urut waktu terbaru.",
};

export default async function IndeksPage() {
  const articles = await getArticles({ limit: 50 });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="font-serif text-3xl font-bold">Indeks Berita</h1>
      <ul className="mt-8 divide-y divide-border">
        {articles.map((article) => (
          <li key={article.id} className="py-4">
            <Link
              href={`/${article.category}/${article.slug}`}
              className="font-medium hover:text-primary"
            >
              {article.title}
            </Link>
            <p className="mt-1 text-xs text-muted-foreground">
              {categoryLabels[article.category]} ·{" "}
              {formatShortWIB(article.publishedAt)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
