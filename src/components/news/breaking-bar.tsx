import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { articlePublicHref } from "@/lib/article-url";
import type { UrgentBannerKind } from "@/lib/content/repository";
import { categoryLabels, type CategorySlug } from "@/lib/site";

const LABELS: Record<UrgentBannerKind, string> = {
  breaking: "Breaking",
  developing: "Berlangsung",
};

export function BreakingBar({
  kind,
  title,
  category,
  slug,
}: {
  kind: UrgentBannerKind;
  title: string;
  category: CategorySlug;
  slug: string;
}) {
  const isBreaking = kind === "breaking";

  return (
    <div
      className={
        isBreaking
          ? "border-b border-breaking/20 bg-breaking/10"
          : "border-b border-amber-500/20 bg-amber-500/10"
      }
    >
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-6">
        <Badge
          variant={isBreaking ? "breaking" : "hoax"}
          className="shrink-0 uppercase tracking-wide"
        >
          {LABELS[kind]}
        </Badge>
        <Link
          href={articlePublicHref(category, slug)}
          className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground hover:text-primary sm:text-base"
        >
          {title}
        </Link>
        <span className="ml-auto hidden text-xs text-muted-foreground sm:inline">
          {categoryLabels[category]}
        </span>
      </div>
    </div>
  );
}
