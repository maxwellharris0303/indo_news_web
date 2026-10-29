import Link from "next/link";
import {
  createArticleFormAction,
} from "@/app/actions/admin";
import { updateArticleStatusFormAction } from "@/app/actions/social";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { prisma } from "@/lib/db";
import { getAuthors } from "@/lib/content/repository";
import { categoryLabels, categorySlugs } from "@/lib/site";

export const metadata = { title: "Admin" };

const statusOptions = [
  "DRAFT",
  "REVIEW",
  "SCHEDULED",
  "PUBLISHED",
  "CORRECTED",
  "ARCHIVED",
] as const;

export default async function AdminPage() {
  const authors = await getAuthors();
  const articles = await prisma.article.findMany({
    orderBy: { publishedAt: "desc" },
    take: 25,
    select: {
      id: true,
      title: true,
      category: true,
      slug: true,
      viewCount: true,
      status: true,
      locale: true,
    },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="font-serif text-3xl font-bold">Redaksi Admin</h1>
      <p className="mt-2 text-muted-foreground">
        Kelola artikel, status workflow, dan publikasi KabarDesk.
      </p>

      <section className="mt-10 rounded-xl border border-border p-6">
        <h2 className="font-serif text-xl font-bold">Tulis artikel cepat</h2>
        <form action={createArticleFormAction} className="mt-4 grid gap-4">
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
          <select
            name="status"
            className="h-10 rounded-md border border-border bg-background px-3 text-sm"
            defaultValue="PUBLISHED"
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s}
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
          <Button type="submit">Simpan artikel</Button>
        </form>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-xl font-bold">Daftar artikel & workflow</h2>
        <ul className="mt-4 divide-y divide-border">
          {articles.map((a) => (
            <li
              key={a.id}
              className="flex flex-wrap items-center justify-between gap-3 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium">{a.title}</p>
                <p className="text-xs text-muted-foreground">
                  {categoryLabels[a.category as keyof typeof categoryLabels]} ·{" "}
                  {a.locale.toUpperCase()} · {a.viewCount} views · {a.status}
                </p>
              </div>
              <form action={updateArticleStatusFormAction} className="flex items-center gap-2">
                <input type="hidden" name="articleId" value={a.id} />
                <select
                  name="status"
                  defaultValue={a.status}
                  className="h-9 rounded-md border border-border bg-background px-2 text-xs"
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <Button type="submit" size="sm" variant="secondary">
                  Update
                </Button>
              </form>
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
