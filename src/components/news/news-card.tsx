import Link from "next/link";
import { ArticleCoverImage } from "@/components/article/article-cover-image";
import { Badge } from "@/components/ui/badge";
import { formatRelativeId } from "@/lib/format";
import type { Article } from "@/lib/content/types";
import { articlePublicHref } from "@/lib/article-url";
import { categoryLabels } from "@/lib/site";
type Variant = "hero" | "featured" | "compact" | "horizontal";

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
      <article className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <Link href={href} className="grid md:grid-cols-2">
          <div className="relative aspect-[16/10] md:aspect-auto md:min-h-[320px]">
            <ArticleCoverImage
              src={article.imageUrl}
              slug={article.slug}
              alt={article.imageCaption}
              priority={priority}
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="flex flex-col justify-center p-4 sm:p-6 md:p-8">
            <Badge variant="secondary" className="mb-3 w-fit">
              {categoryLabels[article.category]}
            </Badge>
            <h2 className="font-serif text-xl font-bold leading-tight tracking-tight sm:text-2xl md:text-3xl">
              {article.title}
            </h2>
            <p className="mt-3 line-clamp-3 text-muted-foreground">{article.dek}</p>
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
      <article className="group flex gap-3 border-b border-border py-4 last:border-0 sm:gap-4">
        <Link
          href={href}
          className="relative h-[4.5rem] w-[5.5rem] shrink-0 overflow-hidden rounded-lg sm:h-24 sm:w-32"
        >
          <ArticleCoverImage
            src={article.imageUrl}
            slug={article.slug}
            alt=""
            className="object-cover transition-transform group-hover:scale-105"
            sizes="128px"
          />
        </Link>
        <div className="min-w-0 flex-1">
          <Link href={href}>
            <p className="text-xs font-medium uppercase tracking-wide text-primary">
              {categoryLabels[article.category]}
            </p>
            <h3 className="mt-1 font-serif text-base font-semibold leading-snug group-hover:text-primary sm:text-lg">
              {article.title}
            </h3>
          </Link>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
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
    <article className="group overflow-hidden rounded-xl border border-border bg-card">
      <Link href={href}>
        <div className="relative aspect-[16/10] overflow-hidden">
          <ArticleCoverImage
            src={article.imageUrl}
            slug={article.slug}
            alt=""
            priority={priority}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
        <div className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            {categoryLabels[article.category]}
          </p>
          <h3 className="mt-2 font-serif text-lg font-semibold leading-snug group-hover:text-primary">
            {article.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {article.dek}
          </p>
        </div>
      </Link>
    </article>
  );
}
