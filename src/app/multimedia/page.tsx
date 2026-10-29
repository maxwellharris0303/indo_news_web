import type { Metadata } from "next";
import Link from "next/link";
import { NewsCard } from "@/components/news/news-card";
import { getArticles, getMultimediaArticles } from "@/lib/content/repository";

export const metadata: Metadata = {
  title: "Multimedia",
  description: "Video, foto, dan liputan visual KabarDesk.",
};

export default async function MultimediaPage() {
  const featured = await getMultimediaArticles(6);
  const latest = await getArticles({ category: "multimedia", limit: 12 });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="font-serif text-3xl font-bold">Multimedia</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Video drone, galeri lapangan, dan reportase visual dari jaringan KabarDesk.
      </p>

      <section className="mt-10">
        <h2 className="font-serif text-xl font-bold">Sorotan video & foto</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      </section>

      <section className="mt-12 border-t border-border pt-10">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-serif text-xl font-bold">Semua liputan multimedia</h2>
          <Link href="/foto" className="text-sm font-medium text-primary hover:underline">
            Galeri foto →
          </Link>
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {latest.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      </section>
    </div>
  );
}
