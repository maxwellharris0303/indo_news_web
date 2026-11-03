import Link from "next/link";
import { notFound } from "next/navigation";
import { NewsCard } from "@/components/news/news-card";
import { Button } from "@/components/ui/button";
import { getArticles, getTopic } from "@/lib/content/repository";
import { getSiteLocale } from "@/lib/locale";
import { homeText } from "@/lib/locale-ui";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const topic = await getTopic(slug);
  if (!topic) return { title: "Topik" };
  return {
    title: topic.name,
    description: topic.description,
  };
}

export default async function TopicPage({ params }: Props) {
  const { slug } = await params;
  const topic = await getTopic(slug);
  if (!topic) notFound();

  const locale = await getSiteLocale();
  const copy = homeText(locale);
  const articles = await getArticles({ topicSlug: slug, limit: 24, locale });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <p className="text-sm font-semibold uppercase text-primary">Topik</p>
      <h1 className="font-serif text-3xl font-bold">{topic.name}</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">{topic.description}</p>
      {articles.length === 0 ? (
        <div className="mt-10 rounded-xl border border-border bg-muted/20 p-8 text-center">
          <p className="text-muted-foreground">{copy.topicEmpty}</p>
          <Button variant="outline" className="mt-4" asChild>
            <Link href="/">{locale === "en" ? "Back to home" : "Ke beranda"}</Link>
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
