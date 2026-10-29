import Link from "next/link";
import { SearchForm } from "@/components/search/search-form";
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
      <h1 className="font-serif text-3xl font-bold">Cari berita</h1>
      <div className="mt-6">
        <SearchForm initialQuery={query} />
      </div>
      {query && (
        <p className="mt-4 text-sm text-muted-foreground">
          {results.length} hasil untuk &quot;{query}&quot;
        </p>
      )}
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
