import Image from "next/image";
import type { GalleryImage } from "@/lib/content/types";

export function ArticleGallery({ items }: { items: GalleryImage[] }) {
  if (!items.length) return null;

  return (
    <section className="my-8">
      <h2 className="text-sm font-bold uppercase tracking-wide text-primary">
        Galeri foto
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <figure
            key={item.url}
            className="overflow-hidden rounded-xl border border-border"
          >
            <div className="relative aspect-[4/3]">
              <Image
                src={item.url}
                alt={item.caption}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 400px"
              />
            </div>
            <figcaption className="p-3 text-xs text-muted-foreground">
              {item.caption}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
