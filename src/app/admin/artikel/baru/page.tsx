import { ArticleComposeForm } from "@/components/admin/article-compose-form";
import { getAuthors } from "@/lib/content/repository";

export const metadata = { title: "Tulis Artikel" };

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminNewArticlePage({ searchParams }: Props) {
  const authors = await getAuthors();
  const sp = await searchParams;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-xl font-bold sm:text-2xl">
          Tulis artikel baru
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Judul, slug, kanal, dan status publikasi. Gambar hero otomatis dari
          seed slug.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <ArticleComposeForm authors={authors} error={sp.error} />
      </div>
    </div>
  );
}
