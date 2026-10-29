import { setArticleUrgencyFormAction } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { formatShortAdmin } from "@/lib/format";
import type { AdminLocale } from "@/lib/admin-locale";

type Copy = {
  title: string;
  none: string;
  breaking: string;
  developing: string;
  expires: string;
  clear: string;
  hint: string;
};

export function AdminUrgentPanel({
  breaking,
  developing,
  locale,
  copy,
  returnTo,
}: {
  breaking: {
    id: string;
    title: string;
    breakingExpiresAt: Date | null;
  } | null;
  developing: { id: string; title: string } | null;
  locale: AdminLocale;
  copy: Copy;
  returnTo: string;
}) {
  if (!breaking && !developing) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
        {copy.none}
      </p>
    );
  }

  return (
    <div className="space-y-2 rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm">
      <p className="font-medium text-foreground">{copy.title}</p>
      {breaking ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-breaking px-2 py-0.5 text-xs font-semibold uppercase text-white">
            {copy.breaking}
          </span>
          <span className="min-w-0 flex-1 truncate">{breaking.title}</span>
          {breaking.breakingExpiresAt ? (
            <span className="text-xs text-muted-foreground">
              {copy.expires}{" "}
              {formatShortAdmin(breaking.breakingExpiresAt, locale)}
            </span>
          ) : null}
          <form action={setArticleUrgencyFormAction}>
            <input type="hidden" name="articleId" value={breaking.id} />
            <input type="hidden" name="urgency" value="none" />
            <input type="hidden" name="returnTo" value={returnTo} />
            <Button type="submit" size="sm" variant="outline">
              {copy.clear}
            </Button>
          </form>
        </div>
      ) : null}
      {developing ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-amber-600 px-2 py-0.5 text-xs font-semibold uppercase text-white">
            {copy.developing}
          </span>
          <span className="min-w-0 flex-1 truncate">{developing.title}</span>
          <form action={setArticleUrgencyFormAction}>
            <input type="hidden" name="articleId" value={developing.id} />
            <input type="hidden" name="urgency" value="none" />
            <input type="hidden" name="returnTo" value={returnTo} />
            <Button type="submit" size="sm" variant="outline">
              {copy.clear}
            </Button>
          </form>
        </div>
      ) : null}
      <p className="text-xs text-muted-foreground">{copy.hint}</p>
    </div>
  );
}
