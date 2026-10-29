import Link from "next/link";
import type { ArticleStatus } from "@prisma/client";
import { deleteArticleFormAction } from "@/app/actions/admin";
import { updateArticleStatusFormAction } from "@/app/actions/social";
import { DeleteArticleButton } from "@/components/admin/delete-article-button";
import { Button } from "@/components/ui/button";
import { ARTICLE_STATUSES } from "@/lib/admin/constants";
import { articlePublicHref } from "@/lib/admin/article-url";
import type { actionsText, adminStatusLabels } from "@/lib/admin/locale-ui";
import type { AdminLocale } from "@/lib/admin-locale";

const PUBLIC_STATUSES = new Set(["PUBLISHED", "CORRECTED"]);

type Props = {
  id: string;
  title: string;
  category: string;
  slug: string;
  status: ArticleStatus;
  compact?: boolean;
  copy: ReturnType<typeof actionsText>;
  statusLabels: (typeof adminStatusLabels)[AdminLocale];
};

export function ArticleRowActions({
  id,
  title,
  category,
  slug,
  status,
  compact,
  copy,
  statusLabels,
}: Props) {
  const href = articlePublicHref(category, slug);
  const isPreviewOnly = !PUBLIC_STATUSES.has(status);

  return (
    <div
      className={
        compact
          ? "flex min-w-[11rem] flex-col gap-2"
          : "flex flex-col gap-2 sm:flex-row sm:items-center"
      }
    >
      <form
        action={updateArticleStatusFormAction}
        className="flex flex-wrap items-center gap-2"
      >
        <input type="hidden" name="articleId" value={id} />
        <select
          name="status"
          defaultValue={status}
          className="h-9 max-w-[8.5rem] rounded-md border border-border bg-background px-2 text-xs"
          aria-label={copy.statusAria}
        >
          {ARTICLE_STATUSES.map((s) => (
            <option key={s} value={s}>
              {statusLabels[s]}
            </option>
          ))}
        </select>
        <Button type="submit" size="sm" variant="secondary">
          {copy.update}
        </Button>
      </form>
      <div className="flex items-center gap-2">
        <form action={deleteArticleFormAction}>
          <input type="hidden" name="articleId" value={id} />
          <DeleteArticleButton
            title={title}
            deleteLabel={copy.delete}
            confirmIntro={copy.deleteConfirmIntro}
            confirmDetail={copy.deleteConfirmDetail}
          />
        </form>
        <Button variant="link" asChild size="sm" className="h-8 px-2">
          <Link
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            title={
              isPreviewOnly ? copy.viewPreviewHint : copy.viewPublishedHint
            }
          >
            {isPreviewOnly ? copy.viewPreview : copy.view}
          </Link>
        </Button>
      </div>
    </div>
  );
}
