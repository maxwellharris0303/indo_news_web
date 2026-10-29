import Link from "next/link";
import type { ArticleStatus } from "@prisma/client";
import { deleteArticleFormAction } from "@/app/actions/admin";
import { updateArticleStatusFormAction } from "@/app/actions/social";
import { DeleteArticleButton } from "@/components/admin/delete-article-button";
import { Button } from "@/components/ui/button";
import { ARTICLE_STATUSES } from "@/lib/admin/constants";
import { articlePublicHref } from "@/lib/admin/article-url";

type Props = {
  id: string;
  title: string;
  category: string;
  slug: string;
  status: ArticleStatus;
  compact?: boolean;
};

export function ArticleRowActions({
  id,
  title,
  category,
  slug,
  status,
  compact,
}: Props) {
  const href = articlePublicHref(category, slug);

  return (
    <div
      className={
        compact
          ? "flex flex-wrap items-center gap-2"
          : "flex flex-col gap-2 sm:flex-row sm:items-center"
      }
    >
      <form
        action={updateArticleStatusFormAction}
        className="flex items-center gap-2"
      >
        <input type="hidden" name="articleId" value={id} />
        <select
          name="status"
          defaultValue={status}
          className="h-9 max-w-[8.5rem] rounded-md border border-border bg-background px-2 text-xs"
          aria-label="Status artikel"
        >
          {ARTICLE_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <Button type="submit" size="sm" variant="secondary">
          Update
        </Button>
      </form>
      <div className="flex items-center gap-2">
        <form action={deleteArticleFormAction}>
          <input type="hidden" name="articleId" value={id} />
          <DeleteArticleButton title={title} />
        </form>
        <Button variant="link" asChild size="sm" className="px-2">
          <Link href={href} target="_blank" rel="noopener noreferrer">
            Lihat
          </Link>
        </Button>
      </div>
    </div>
  );
}
