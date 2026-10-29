import type { ArticleStatus } from "@prisma/client";
import { ARTICLE_STATUSES } from "@/lib/admin/constants";
import type { AdminLocale } from "@/lib/admin-locale";
import { adminStatusLabels, formatCountAdmin } from "@/lib/admin/locale-ui";

type Props = {
  byStatus: Record<ArticleStatus, number>;
  total: number;
  title: string;
  subtitle: string;
  locale: AdminLocale;
};

const barColors: Record<ArticleStatus, string> = {
  PUBLISHED: "bg-trust",
  CORRECTED: "bg-primary",
  DRAFT: "bg-muted-foreground/40",
  REVIEW: "bg-amber-500",
  SCHEDULED: "bg-violet-500",
  ARCHIVED: "bg-muted-foreground/25",
};

export function WorkflowBar({
  byStatus,
  total,
  title,
  subtitle,
  locale,
}: Props) {
  const safeTotal = total || 1;
  const statusLabels = adminStatusLabels[locale];

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h2 className="font-serif text-lg font-bold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-muted">
        {ARTICLE_STATUSES.map((status) => {
          const count = byStatus[status];
          if (count === 0) return null;
          const pct = (count / safeTotal) * 100;
          return (
            <div
              key={status}
              className={barColors[status]}
              style={{ width: `${pct}%` }}
              title={`${statusLabels[status]}: ${count}`}
            />
          );
        })}
      </div>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {ARTICLE_STATUSES.map((status) => (
          <li
            key={status}
            className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-sm"
          >
            <span className="flex items-center gap-2">
              <span
                className={`inline-block h-2.5 w-2.5 rounded-full ${barColors[status]}`}
              />
              {statusLabels[status]}
            </span>
            <span className="font-semibold tabular-nums">
              {formatCountAdmin(byStatus[status], locale)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
