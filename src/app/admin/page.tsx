import Link from "next/link";
import { createArticleAction } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getArticles, getAuthors } from "@/lib/content/repository";
import { categoryLabels, categorySlugs } from "@/lib/site";

export const metadata = { title: "Admin" };

export default async function AdminPage() {
  const articles = await getArticles({ limit: 15 });
  const authors = await getAuthors();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="font-serif text-3xl font-bold">Redaksi Admin</h1>
      <p className="mt-2 text-muted-foreground">
        Kelola artikel dan publikasi KabarDesk.
      </p>

      <section className="mt-10 rounded-xl border border-border p-6">
        <h2 className="font-serif text-xl font-bold">Tulis artikel cepat</h2>
        <form
          action={async (formData) => {
            "use server";
            await createArticleAction(formData);
          }}
          className="mt-4 grid gap-4"
        >
          <Input name="title" placeholder="Judul" required />
          <Input name="slug" placeholder="slug-url-artikel" required />
          <select
            name="category"
            className="h-10 rounded-md border border-border bg-background px-3 text-sm"
            required
          >
            {categorySlugs.map((c) => (
              <option key={c} value={c}>
                {categoryLabels[c]}
              </option>
            ))}
          </select>
          <Input name="dek" placeholder="Lead / dek" required />
          <textarea
            name="body"
            required
            rows={6}
            placeholder="Isi berita..."
            className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
          <select
            name="authorId"
            className="h-10 rounded-md border border-border bg-background px-3 text-sm"
            required
          >
            {authors.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          <Button type="submit">Publikasikan</Button>
        </form>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-xl font-bold">Artikel terbaru</h2>
        <ul className="mt-4 divide-y divide-border">
          {articles.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
              <div>
                <p className="font-medium">{a.title}</p>
                <p className="text-xs text-muted-foreground">
                  {categoryLabels[a.category]} · {a.viewCount} views
                </p>
              </div>
              <Button variant="link" asChild size="sm">
                <Link href={`/${a.category}/${a.slug}`}>Lihat</Link>
              </Button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
