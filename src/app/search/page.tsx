import Link from "next/link";
import { getArticles } from "@/lib/content/repository";
import { categoryLabels } from "@/lib/site";

type Props = { searchParams: Promise<{ q?: string }> };

export const metadata = {
  title: "Pencarian",
};

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const results = query ? await getArticles({ q: query, limit: 20 }) : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="font-serif text-3xl font-bold">
        {query ? "Hasil pencarian" : "Pencarian"}
      </h1>
      {!query ? (
        <p className="mt-2 text-sm text-muted-foreground">
          Gunakan ikon cari di header atau tekan Ctrl+K, lalu ketik kata kunci.
        </p>
      ) : null}
      {query && (
        <p className="mt-4 text-sm text-muted-foreground">
          {results.length} hasil untuk &quot;{query}&quot;
        </p>
      )}
      {query && results.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">
          Tidak ada artikel yang cocok. Coba kata kunci lain dari header (Ctrl+K).
        </p>
      ) : null}
      <ul className="mt-6 divide-y divide-border">
        {results.map((article) => (
          <li key={article.id} className="py-4">
            <Link
              href={`/${article.category}/${article.slug}`}
              className="font-medium hover:text-primary"
            >
              {article.title}
            </Link>
            <p className="mt-1 text-sm text-muted-foreground">{article.dek}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {categoryLabels[article.category]}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
