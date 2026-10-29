import Link from "next/link";
import type { ArticleStatus } from "@prisma/client";
import { ArticleRowActions } from "@/components/admin/article-row-actions";
import { StatCard } from "@/components/admin/stat-card";
import { StatusBadge } from "@/components/admin/status-badge";
import { WorkflowBar } from "@/components/admin/workflow-bar";
import { Button } from "@/components/ui/button";
import { articlePublicHref } from "@/lib/admin/article-url";
import { getAdminDashboardStats } from "@/lib/admin/dashboard";
import {
  actionsText,
  adminCategoryLabel,
  adminStatusLabels,
  dashboardText,
  formatCountAdmin,
} from "@/lib/admin/locale-ui";
import { getAdminLocale } from "@/lib/admin-locale";
import { formatShortAdmin } from "@/lib/format";

export default async function AdminDashboardPage() {
  const locale = await getAdminLocale();
  const copy = dashboardText(locale);
  const actionCopy = actionsText(locale);
  const statusLabels = adminStatusLabels[locale];
  const stats = await getAdminDashboardStats();
  const publishedCount =
    stats.byStatus.PUBLISHED + stats.byStatus.CORRECTED;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl font-bold sm:text-2xl">
            {copy.title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{copy.subtitle}</p>
        </div>
        <Button asChild>
          <Link href="/admin/artikel/baru">{copy.newArticle}</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={copy.statTotal}
          value={stats.totalArticles}
          hint={copy.statTotalHint(publishedCount)}
          accent="primary"
        />
        <StatCard
          label={copy.statViews}
          value={stats.totalViews}
          hint={copy.statViewsHint}
        />
        <StatCard
          label={copy.statQueue}
          value={stats.draftCount + stats.inReviewCount}
          hint={copy.statQueueHint(stats.draftCount, stats.inReviewCount)}
          accent="amber"
        />
        <StatCard
          label={copy.statCommunity}
          value={stats.commentCount}
          hint={copy.statCommunityHint(
            stats.commentCount,
            stats.subscriberCount,
          )}
          accent="trust"
        />
      </div>

      <WorkflowBar
        byStatus={stats.byStatus}
        total={stats.totalArticles}
        title={copy.workflow}
        subtitle={copy.workflowSub}
        locale={locale}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-5 py-4">
            <h2 className="font-serif text-lg font-bold">{copy.topPopular}</h2>
            <p className="text-sm text-muted-foreground">{copy.topPopularSub}</p>
          </div>
          <ul className="divide-y divide-border">
            {stats.topByViews.map((a, i) => (
              <li key={a.id} className="flex items-start gap-3 px-5 py-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <Link
                    href={articlePublicHref(a.category, a.slug)}
                    className="font-medium hover:text-primary"
                  >
                    {a.title}
                  </Link>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatCountAdmin(a.viewCount, locale)} views ·{" "}
                    {adminCategoryLabel(a.category, locale)}
                  </p>
                </div>
                <StatusBadge status={a.status} locale={locale} />
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="font-serif text-lg font-bold">{copy.recent}</h2>
              <p className="text-sm text-muted-foreground">{copy.recentSub}</p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/artikel">{copy.allArticles}</Link>
            </Button>
          </div>
          <ul className="divide-y divide-border">
            {stats.recentArticles.map((a) => (
              <li key={a.id} className="px-5 py-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium leading-snug">{a.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatShortAdmin(a.publishedAt, locale)} ·{" "}
                      {formatCountAdmin(a.viewCount, locale)} views
                    </p>
                  </div>
                  <StatusBadge
                    status={a.status as ArticleStatus}
                    locale={locale}
                  />
                </div>
                <div className="mt-2">
                  <ArticleRowActions
                    id={a.id}
                    title={a.title}
                    category={a.category}
                    slug={a.slug}
                    status={a.status}
                    compact
                    copy={actionCopy}
                    statusLabels={statusLabels}
                    returnTo="/admin"
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
