import Link from "next/link";
import { retagUntaggedArticlesAction } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { getAdminLocale } from "@/lib/admin-locale";
import { formatCountAdmin, topicsAdminText } from "@/lib/admin/locale-ui";
import { getTopicsWithCounts } from "@/lib/topics/queries";

export const metadata = { title: "Topik" };

export default async function AdminTopicsPage() {
  const locale = await getAdminLocale();
  const copy = topicsAdminText(locale);
  const topics = await getTopicsWithCounts();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-xl font-bold sm:text-2xl">{copy.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{copy.subtitle}</p>
      </div>

      <form
        action={async () => {
          "use server";
          await retagUntaggedArticlesAction();
        }}
        className="rounded-xl border border-border bg-card p-5"
      >
        <h3 className="font-semibold">{copy.retagTitle}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{copy.retagHint}</p>
        <Button type="submit" className="mt-4" variant="secondary">
          {copy.retagButton}
        </Button>
      </form>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {topics.map((topic) => (
          <div
            key={topic.slug}
            className="rounded-xl border border-border bg-card p-5"
          >
            <p className="text-xs font-semibold uppercase text-primary">Topik</p>
            <h3 className="mt-1 font-serif text-lg font-bold">#{topic.name}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {topic.description}
            </p>
            <p className="mt-3 text-sm">
              {copy.articleCount}:{" "}
              <span className="font-semibold">
                {formatCountAdmin(topic.articleCount, locale)}
              </span>
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" asChild>
                <Link href={`/topik/${topic.slug}`} target="_blank">
                  {copy.viewPublic}
                </Link>
              </Button>
              <Button size="sm" variant="ghost" asChild>
                <Link href={`/admin/artikel?q=${encodeURIComponent(topic.name.split(" ")[0] ?? topic.slug)}`}>
                  {copy.findArticles}
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
