import { NewsCard } from "@/components/news/news-card";
import { getArticles, getAuthors } from "@/lib/content/repository";

export const metadata = {
  title: "Opini",
  description: "Kolom, analisis, dan sudut pandar para kolumnis KabarDesk.",
};

export default async function OpiniPage() {
  const articles = await getArticles({ category: "opini", limit: 12 });
  const authors = await getAuthors();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="font-serif text-3xl font-bold">Opini</h1>
      <section className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        {authors.map((author) => (
          <div
            key={author.id}
            className="rounded-xl border border-border bg-card p-4"
          >
            <p className="font-semibold">{author.name}</p>
            <p className="text-sm text-muted-foreground">{author.title}</p>
          </div>
        ))}
      </section>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <NewsCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}
