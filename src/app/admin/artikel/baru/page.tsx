import { ArticleComposeForm } from "@/components/admin/article-compose-form";
import { composeText } from "@/lib/admin/locale-ui";
import { getAdminLocale } from "@/lib/admin-locale";
import { getAuthors } from "@/lib/content/repository";

export const metadata = { title: "Tulis Artikel" };

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminNewArticlePage({ searchParams }: Props) {
  const locale = await getAdminLocale();
  const copy = composeText(locale);
  const authors = await getAuthors();
  const sp = await searchParams;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-xl font-bold sm:text-2xl">
          {copy.title}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{copy.subtitle}</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <ArticleComposeForm authors={authors} error={sp.error} copy={copy} />
      </div>
    </div>
  );
}
