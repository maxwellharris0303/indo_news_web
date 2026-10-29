import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getArticles } from "@/lib/content/repository";

export const metadata: Metadata = {
  title: "Galeri Foto",
  description: "Kumpulan foto liputan KabarDesk.",
};

export default async function FotoPage() {
  const articles = await getArticles({ limit: 30 });
  const withGallery = articles.filter((a) => a.galleryImages.length > 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="font-serif text-3xl font-bold">Galeri Foto</h1>
      <p className="mt-2 text-muted-foreground">
        Momen visual dari berita terpilih redaksi KabarDesk.
      </p>

      <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {withGallery.flatMap((article) =>
          article.galleryImages.map((img) => (
            <figure
              key={`${article.id}-${img.url}`}
              className="overflow-hidden rounded-xl border border-border"
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={img.url}
                  alt={img.caption}
                  fill
                  className="object-cover"
                  sizes="400px"
                />
              </div>
              <figcaption className="p-4 text-sm">
                <p className="text-muted-foreground">{img.caption}</p>
                <Link
                  href={`/${article.category}/${article.slug}`}
                  className="mt-2 inline-block font-medium text-primary hover:underline"
                >
                  {article.title}
                </Link>
              </figcaption>
            </figure>
          )),
        )}
      </div>

      {withGallery.length === 0 && (
        <p className="mt-8 text-muted-foreground">Belum ada galeri foto.</p>
      )}
    </div>
  );
}
