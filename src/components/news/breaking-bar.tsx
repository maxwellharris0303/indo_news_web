import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
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
          ? "border-b border-breaking bg-breaking text-white"
          : "border-b border-amber-700 bg-amber-100 text-amber-950 dark:bg-amber-950/40 dark:text-amber-50"
      }
    >
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-6">
        <Badge
          variant={isBreaking ? "breaking" : "hoax"}
          className={cn(
            "shrink-0",
            isBreaking && "bg-white/20 text-white",
          )}
        >
          {LABELS[kind]}
        </Badge>
        <Link
          href={articlePublicHref(category, slug)}
          className={cn(
            "min-w-0 flex-1 truncate text-sm font-semibold sm:text-base",
            isBreaking
              ? "text-white hover:underline"
              : "text-amber-950 hover:underline dark:text-amber-50",
          )}
        >
          {title}
        </Link>
        <span
          className={cn(
            "ml-auto hidden text-xs sm:inline",
            isBreaking ? "text-white/80" : "text-amber-900/70 dark:text-amber-100/70",
          )}
        >
          {categoryLabels[category]}
        </span>
      </div>
    </div>
  );
}
