import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleGallery } from "@/components/article/article-gallery";
import { ArticleToolbar } from "@/components/article/article-toolbar";
import { ArticleVideo } from "@/components/article/article-video";
import { CommentsSection } from "@/components/article/comments-section";
import { TrackReading } from "@/components/article/track-reading";
import { AdSlot } from "@/components/news/ad-slot";
import { NewsCard } from "@/components/news/news-card";
import { TrustBox } from "@/components/news/trust-box";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/auth";
import {
  getAllArticlePaths,
  getArticleBySlug,
  getAuthor,
  getRelatedArticles,
  getComments,
  getSavedArticleIds,
  getTopic,
  incrementArticleViews,
} from "@/lib/content/repository";
import { prisma } from "@/lib/db";
import {
  formatShortWIB,
  formatWIB,
  readingTimeMinutes,
} from "@/lib/format";
import { categoryLabels, isCategorySlug, site } from "@/lib/site";

type Props = { params: Promise<{ category: string; slug: string }> };

export async function generateStaticParams() {
  return getAllArticlePaths();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params;
  if (!isCategorySlug(category)) return {};
  const article = await getArticleBySlug(category, slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.dek,
    openGraph: {
      title: article.title,
      description: article.dek,
      type: "article",
      publishedTime: article.publishedAt,
      images: [{ url: article.imageUrl }],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { category, slug } = await params;
  if (!isCategorySlug(category)) notFound();

  const article = await getArticleBySlug(category, slug);
  if (!article) notFound();

  await incrementArticleViews(article.id);

  const session = await auth();
  const savedIds = session?.user?.id
    ? await getSavedArticleIds(session.user.id)
    : [];
  const initiallySaved = savedIds.includes(article.id);
  const comments = await getComments(article.id);
  let showAds = true;
  if (session?.user?.id) {
    const u = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true },
    });
    showAds = u?.plan !== "PLUS";
  }
  const articlePath = `/${category}/${slug}`;

  const author = await getAuthor(article.authorId);
  const related = await getRelatedArticles(article);
  const readMin = readingTimeMinutes(article.body);
  const paragraphs = article.body.split("\n\n");
  const topicEntries = await Promise.all(
    article.topicSlugs.map(async (slug) => ({
      slug,
      topic: await getTopic(slug),
    })),
  );
  const summaryText = article.summaryBullets.join(" ");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.dek,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    author: {
      "@type": "Person",
      name: author?.name ?? "Redaksi KabarDesk",
    },
    publisher: {
      "@type": "Organization",
      name: site.name,
    },
    image: [article.imageUrl],
  };

  return (
    <article className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {session?.user?.id && <TrackReading articleId={article.id} />}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-3xl">
        <nav className="mb-4 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">
            Beranda
          </Link>
          {" / "}
          <Link href={`/${category}`} className="hover:text-primary">
            {categoryLabels[category]}
          </Link>
        </nav>

        <Badge variant="secondary" className="mb-3">
          {categoryLabels[category]}
        </Badge>
        <h1 className="font-serif text-3xl font-bold leading-tight tracking-tight md:text-4xl">
          {article.title}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">{article.dek}</p>

        <div className="mt-4">
          <ArticleToolbar
            articleId={article.id}
            title={article.title}
            summaryText={summaryText}
            initiallySaved={initiallySaved}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span>{author?.name ?? article.authorName}</span>
          <span>·</span>
          <time dateTime={article.publishedAt}>{formatShortWIB(article.publishedAt)}</time>
          <span>·</span>
          <span>{readMin} menit baca</span>
        </div>

        {article.correctionNote && (
          <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm">
            <strong>Koreksi:</strong> {article.correctionNote}
          </p>
        )}

        <div className="relative mt-8 aspect-[16/10] overflow-hidden rounded-2xl">
          <Image
            src={article.imageUrl}
            alt={article.imageCaption}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 720px"
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {article.imageCaption} · {article.imageCredit}
        </p>
      </div>

      <div className="mx-auto mt-8 grid max-w-5xl gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div>
          <section className="mb-8 rounded-xl border border-border bg-muted/20 p-5">
            <h2 className="text-sm font-bold uppercase tracking-wide text-primary">
              Baca cepat
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm">
              {article.summaryBullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </section>

          {article.aiSummary && (
            <section className="mb-8 rounded-xl border border-primary/20 bg-primary/5 p-5">
              <h2 className="text-sm font-bold uppercase tracking-wide text-primary">
                Ringkasan AI
              </h2>
              <p className="mt-2 text-sm leading-relaxed">{article.aiSummary}</p>
            </section>
          )}

          {article.videoUrl && (
            <ArticleVideo url={article.videoUrl} title={article.title} />
          )}

          <div className="prose-article max-w-3xl text-foreground">
            {paragraphs.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
          </div>

          <ArticleGallery items={article.galleryImages} />

          {showAds && (
            <div className="my-8">
              <AdSlot />
            </div>
          )}

          {topicEntries.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {topicEntries.map(({ slug, topic }) => {
                if (!topic) return null;
                return (
                  <Link
                    key={slug}
                    href={`/topik/${slug}`}
                    className="rounded-full bg-muted px-3 py-1 text-sm font-medium hover:text-primary"
                  >
                    #{topic.name}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <TrustBox status={article.verificationStatus} sources={article.sources} />
          <div className="rounded-xl border border-border p-4 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">Transparansi</p>
            <p className="mt-2">
              Artikel dipublikasikan {formatWIB(article.publishedAt)}. Status
              verifikasi ditinjau redaksi KabarDesk.
            </p>
          </div>
        </aside>
      </div>

      <CommentsSection
        articleId={article.id}
        path={articlePath}
        comments={comments}
        isLoggedIn={Boolean(session?.user?.id)}
      />

      {related.length > 0 && (
        <section className="mx-auto mt-16 max-w-7xl border-t border-border pt-10">
          <h2 className="font-serif text-2xl font-bold">Artikel terkait</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <NewsCard key={item.id} article={item} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
