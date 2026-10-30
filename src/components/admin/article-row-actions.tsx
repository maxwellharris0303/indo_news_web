import Link from "next/link";
import type { ArticleStatus } from "@prisma/client";
import {
  deleteArticleFormAction,
  setArticleFeaturedLevelFormAction,
  setArticleUrgencyFormAction,
} from "@/app/actions/admin";
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
  returnTo: string;
  isBreaking?: boolean;
  isDeveloping?: boolean;
  featuredLevel?: number;
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
  returnTo,
  isBreaking,
  isDeveloping,
  featuredLevel = 0,
}: Props) {
  const href = articlePublicHref(category, slug);
  const isPreviewOnly = !PUBLIC_STATUSES.has(status);
  const canUrgent = PUBLIC_STATUSES.has(status);
  const canFeature = PUBLIC_STATUSES.has(status);
  const isEditorPick = featuredLevel >= 1 && featuredLevel !== 3;
  const isHero = featuredLevel === 3;

  return (
    <div
      className={
        compact
          ? "flex min-w-[11rem] flex-col gap-2"
          : "flex flex-col gap-2 sm:flex-row sm:items-center"
      }
    >
      {canFeature ? (
        <div className="flex flex-wrap gap-1">
          <form action={setArticleFeaturedLevelFormAction}>
            <input type="hidden" name="articleId" value={id} />
            <input
              type="hidden"
              name="featuredLevel"
              value={isEditorPick || isHero ? "0" : "1"}
            />
            <input type="hidden" name="returnTo" value={returnTo} />
            <Button
              type="submit"
              size="sm"
              variant={isEditorPick || isHero ? "default" : "outline"}
              className="h-8 px-2 text-xs"
              aria-label={copy.featuredEditorPickAria}
            >
              {copy.featuredEditorPick}
            </Button>
          </form>
          <form action={setArticleFeaturedLevelFormAction}>
            <input type="hidden" name="articleId" value={id} />
            <input type="hidden" name="featuredLevel" value="3" />
            <input type="hidden" name="returnTo" value={returnTo} />
            <Button
              type="submit"
              size="sm"
              variant={isHero ? "default" : "outline"}
              className="h-8 px-2 text-xs"
              aria-label={copy.featuredHeroAria}
            >
              {copy.featuredHero}
            </Button>
          </form>
          {featuredLevel > 0 ? (
            <form action={setArticleFeaturedLevelFormAction}>
              <input type="hidden" name="articleId" value={id} />
              <input type="hidden" name="featuredLevel" value="0" />
              <input type="hidden" name="returnTo" value={returnTo} />
              <Button
                type="submit"
                size="sm"
                variant="ghost"
                className="h-8 px-2 text-xs"
                aria-label={copy.featuredClearAria}
              >
                {copy.featuredClear}
              </Button>
            </form>
          ) : null}
        </div>
      ) : null}
      {canUrgent ? (
        <div className="flex flex-wrap gap-1">
          <form action={setArticleUrgencyFormAction}>
            <input type="hidden" name="articleId" value={id} />
            <input type="hidden" name="urgency" value="breaking" />
            <input type="hidden" name="breakingHours" value="6" />
            <input type="hidden" name="returnTo" value={returnTo} />
            <Button
              type="submit"
              size="sm"
              variant={isBreaking ? "default" : "outline"}
              className="h-8 px-2 text-xs"
              aria-label={copy.urgencyBreakingAria}
            >
              {copy.urgencyBreaking}
            </Button>
          </form>
          <form action={setArticleUrgencyFormAction}>
            <input type="hidden" name="articleId" value={id} />
            <input type="hidden" name="urgency" value="developing" />
            <input type="hidden" name="returnTo" value={returnTo} />
            <Button
              type="submit"
              size="sm"
              variant={isDeveloping ? "secondary" : "outline"}
              className="h-8 px-2 text-xs"
              aria-label={copy.urgencyDevelopingAria}
            >
              {copy.urgencyDeveloping}
            </Button>
          </form>
          {isBreaking || isDeveloping ? (
            <form action={setArticleUrgencyFormAction}>
              <input type="hidden" name="articleId" value={id} />
              <input type="hidden" name="urgency" value="none" />
              <input type="hidden" name="returnTo" value={returnTo} />
              <Button
                type="submit"
                size="sm"
                variant="ghost"
                className="h-8 px-2 text-xs"
                aria-label={copy.urgencyClearAria}
              >
                {copy.urgencyClear}
              </Button>
            </form>
          ) : null}
        </div>
      ) : null}
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
