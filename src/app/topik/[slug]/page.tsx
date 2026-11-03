import Link from "next/link";
import { notFound } from "next/navigation";
import { NewsCard } from "@/components/news/news-card";
import { Button } from "@/components/ui/button";
import { getArticles } from "@/lib/content/repository";
import { getSiteLocale } from "@/lib/locale";
import { homeText, topicStoryCountLabel } from "@/lib/locale-ui";
import { getTopicWithCount } from "@/lib/topics/queries";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const topic = await getTopicWithCount(slug);
  if (!topic) return { title: "Topik" };
  return {
    title: topic.name,
    description: topic.description,
  };
}

export default async function TopicPage({ params }: Props) {
  const { slug } = await params;
  const topic = await getTopicWithCount(slug);
  if (!topic) notFound();

  const locale = await getSiteLocale();
  const copy = homeText(locale);
  const articles = await getArticles({ topicSlug: slug, limit: 24, locale });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <nav className="text-sm text-muted-foreground">
        <Link href="/topik" className="hover:text-primary">
          {copy.allTopics}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{topic.name}</span>
      </nav>
      <p className="mt-4 text-sm font-semibold uppercase text-primary">Topik</p>
      <h1 className="font-serif text-3xl font-bold">{topic.name}</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">{topic.description}</p>
      <p className="mt-2 text-sm text-muted-foreground">
        {topicStoryCountLabel(topic.articleCount, locale)}
      </p>
      {articles.length === 0 ? (
        <div className="mt-10 rounded-xl border border-border bg-muted/20 p-8 text-center">
          <p className="text-muted-foreground">{copy.topicEmpty}</p>
          <Button variant="outline" className="mt-4" asChild>
            <Link href="/topik">{copy.allTopics}</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
