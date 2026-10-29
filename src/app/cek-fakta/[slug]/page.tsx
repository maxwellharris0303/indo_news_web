import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getArticleBySlugOnly,
  getFactCheck,
} from "@/lib/content/repository";
import { formatShortWIB } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

const verdictLabel: Record<string, string> = {
  benar: "Benar",
  salah: "Salah",
  menyesatkan: "Menyesatkan",
  tidak_dapat_diverifikasi: "Tidak dapat diverifikasi",
};

export default async function FactCheckDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = await getFactCheck(slug);
  if (!item) notFound();

  const relatedArticles = (
    await Promise.all(
      item.relatedArticleSlugs.map((s) => getArticleBySlugOnly(s)),
    )
  ).filter(Boolean);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link href="/cek-fakta" className="text-sm text-primary hover:underline">
        ← Semua cek fakta
      </Link>
      <p className="mt-4 text-sm font-bold uppercase text-primary">
        {verdictLabel[item.verdict]}
      </p>
      <h1 className="mt-2 font-serif text-3xl font-bold">{item.claim}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {formatShortWIB(item.publishedAt)}
      </p>
      <div className="prose-article mt-8">
        <p>{item.explanation}</p>
      </div>
      <div className="mt-8 rounded-xl border border-border p-4">
        <p className="text-sm font-semibold">Sumber verifikasi</p>
        <ul className="mt-2 list-disc pl-5 text-sm">
          {item.sources.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </div>
      {relatedArticles.length > 0 && (
        <div className="mt-8">
          <p className="font-semibold">Artikel terkait</p>
          <ul className="mt-2 space-y-2 text-sm">
            {relatedArticles.map((article) => (
              <li key={article!.slug}>
                <Link
                  href={`/${article!.category}/${article!.slug}`}
                  className="text-primary hover:underline"
                >
                  {article!.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
