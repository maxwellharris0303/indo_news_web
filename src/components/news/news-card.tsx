import Link from "next/link";
import { ArticleCoverImage } from "@/components/article/article-cover-image";
import { formatRelativeId } from "@/lib/format";
import type { Article } from "@/lib/content/types";
import { articlePublicHref } from "@/lib/article-url";
import { categoryLabels } from "@/lib/site";

type Variant = "hero" | "featured" | "compact" | "horizontal";

function CategoryKicker({ category }: { category: Article["category"] }) {
  return (
    <p className="kicker">{categoryLabels[category]}</p>
  );
}

export function NewsCard({
  article,
  variant = "compact",
  priority,
}: {
  article: Article;
  variant?: Variant;
  priority?: boolean;
}) {
  const authorLabel = article.authorName ?? "Redaksi";
  const href = articlePublicHref(article.category, article.slug);

  if (variant === "hero") {
    return (
      <article className="group border border-border bg-card">
        <Link href={href} className="grid md:grid-cols-2">
          <div className="relative aspect-[16/10] md:aspect-auto md:min-h-[300px]">
            <ArticleCoverImage
              src={article.imageUrl}
              slug={article.slug}
              alt={article.imageCaption}
              priority={priority}
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="flex flex-col justify-center border-t border-border p-4 sm:p-6 md:border-t-0 md:border-l md:p-8">
            <CategoryKicker category={article.category} />
            <h2 className="mt-2 font-serif text-xl font-bold leading-tight sm:text-2xl md:text-[1.75rem]">
              {article.title}
            </h2>
            <p className="mt-3 line-clamp-3 text-[15px] leading-relaxed text-muted-foreground">
              {article.dek}
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              {authorLabel} · {formatRelativeId(article.publishedAt)}
            </p>
          </div>
        </Link>
      </article>
    );
  }

  if (variant === "horizontal") {
    return (
      <article className="group flex gap-3 py-4 sm:gap-4">
        <Link
          href={href}
          className="relative h-[4.25rem] w-[5.25rem] shrink-0 overflow-hidden border border-border sm:h-[5.5rem] sm:w-[7rem]"
        >
          <ArticleCoverImage
            src={article.imageUrl}
            slug={article.slug}
            alt=""
            className="object-cover"
            sizes="112px"
          />
        </Link>
        <div className="min-w-0 flex-1">
          <Link href={href}>
            <CategoryKicker category={article.category} />
            <h3 className="mt-1 font-serif text-base font-bold leading-snug group-hover:underline sm:text-[17px]">
              {article.title}
            </h3>
          </Link>
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {article.dek}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {formatRelativeId(article.publishedAt)}
          </p>
        </div>
      </article>
    );
  }

  return (
    <article className="group border border-border bg-card">
      <Link href={href}>
        <div className="relative aspect-[16/10] overflow-hidden border-b border-border">
          <ArticleCoverImage
            src={article.imageUrl}
            slug={article.slug}
            alt=""
            priority={priority}
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
        <div className="p-4">
          <CategoryKicker category={article.category} />
          <h3 className="mt-2 font-serif text-lg font-bold leading-snug group-hover:underline">
            {article.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {article.dek}
          </p>
        </div>
      </Link>
    </article>
  );
}
