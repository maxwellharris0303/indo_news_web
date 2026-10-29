import type { ArticleStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS } from "@/lib/admin/constants";
import { cn } from "@/lib/utils";

const statusStyles: Record<ArticleStatus, string> = {
  PUBLISHED: "bg-trust/15 text-trust border-trust/30",
  CORRECTED: "bg-primary/15 text-primary border-primary/30",
  DRAFT: "bg-muted text-muted-foreground border-border",
  REVIEW: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
  SCHEDULED: "bg-violet-500/15 text-violet-700 dark:text-violet-400 border-violet-500/30",
  ARCHIVED: "bg-muted/80 text-muted-foreground border-border",
};

export function StatusBadge({ status }: { status: ArticleStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn("font-medium", statusStyles[status])}
    >
      {STATUS_LABELS[status]}
    </Badge>
  );
}
