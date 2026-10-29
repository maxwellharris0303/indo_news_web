import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatRelativeId } from "@/lib/format";
import type { Article } from "@/lib/content/types";
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
  const href = `/${article.category}/${article.slug}`;

  if (variant === "hero") {
    return (
      <article className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <Link href={href} className="grid md:grid-cols-2">
          <div className="relative aspect-[16/10] md:aspect-auto md:min-h-[320px]">
            <Image
              src={article.imageUrl}
              alt={article.imageCaption}
              fill
              priority={priority}
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="flex flex-col justify-center p-6 md:p-8">
            <Badge variant="secondary" className="mb-3 w-fit">
              {categoryLabels[article.category]}
            </Badge>
            <h2 className="font-serif text-2xl font-bold leading-tight tracking-tight md:text-3xl">
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
      <article className="group flex gap-4 border-b border-border py-4 last:border-0">
        <Link href={href} className="relative h-24 w-32 shrink-0 overflow-hidden rounded-lg">
          <Image
            src={article.imageUrl}
            alt=""
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="128px"
          />
        </Link>
        <div className="min-w-0 flex-1">
          <Link href={href}>
            <p className="text-xs font-medium uppercase tracking-wide text-primary">
              {categoryLabels[article.category]}
            </p>
            <h3 className="mt-1 font-serif text-lg font-semibold leading-snug group-hover:text-primary">
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
          <Image
            src={article.imageUrl}
            alt=""
            fill
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
