import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getSiteLocale } from "@/lib/locale";
import { homeText, topicStoryCountLabel } from "@/lib/locale-ui";
import { getTopicsWithCounts } from "@/lib/topics/queries";

export const metadata = {
  title: "Topik",
  description: "Liputan berkelanjutan KabarDesk per topik.",
};

export default async function TopicsIndexPage() {
  const locale = await getSiteLocale();
  const copy = homeText(locale);
  const topics = await getTopicsWithCounts();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <p className="text-sm font-semibold uppercase text-primary">KabarDesk</p>
      <h1 className="font-serif text-3xl font-bold">{copy.hotTopics}</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">{copy.hotTopicsSub}</p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {topics.map((topic) => (
          <Link
            key={topic.slug}
            href={`/topik/${topic.slug}`}
            className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary"
          >
            <p className="text-sm font-semibold text-primary">#{topic.name}</p>
            <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
              {topic.description}
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              {topicStoryCountLabel(topic.articleCount, locale)}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-10">
        <Button variant="outline" asChild>
          <Link href="/">{locale === "en" ? "Back to home" : "Ke beranda"}</Link>
        </Button>
      </div>
    </div>
  );
}
