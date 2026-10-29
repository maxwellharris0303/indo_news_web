import { notFound } from "next/navigation";
import { NewsCard } from "@/components/news/news-card";
import { getArticles, getRegion } from "@/lib/content/repository";

type Props = { params: Promise<{ province: string }> };

export async function generateMetadata({ params }: Props) {
  const { province } = await params;
  const region = await getRegion(province);
  if (!region) return { title: "Daerah" };
  return {
    title: `Berita ${region.name}`,
    description: `Liputan terkini dari ${region.name}.`,
  };
}

export default async function ProvincePage({ params }: Props) {
  const { province } = await params;
  const region = await getRegion(province);
  if (!region) notFound();

  const articles = await getArticles({ regionSlug: province, limit: 20 });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="font-serif text-3xl font-bold">Berita {region.name}</h1>
      <p className="mt-2 text-muted-foreground">Liputan lokal KabarDesk</p>
      {articles.length === 0 ? (
        <p className="mt-8 text-muted-foreground">
          Belum ada artikel untuk wilayah ini. Cek kembali nanti.
        </p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
