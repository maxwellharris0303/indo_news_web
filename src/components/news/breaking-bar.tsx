import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { categoryLabels, type CategorySlug } from "@/lib/site";

export function BreakingBar({
  title,
  category,
  slug,
}: {
  title: string;
  category: CategorySlug;
  slug: string;
}) {
  return (
    <div className="border-b border-breaking/20 bg-breaking/10">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2 sm:px-6">
        <Badge variant="breaking" className="shrink-0 uppercase tracking-wide">
          Breaking
        </Badge>
        <Link
          href={`/${category}/${slug}`}
          className="truncate text-sm font-semibold text-foreground hover:text-primary sm:text-base"
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
