import type { Metadata } from "next";
import Link from "next/link";
import { ArticleCoverImage } from "@/components/article/article-cover-image";
import { notFound } from "next/navigation";
import { ArticleGallery } from "@/components/article/article-gallery";
import { ArticleShareBar } from "@/components/article/article-share-bar";
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
  getArticleBySlugStaffPreview,
  getAuthor,
  getRelatedArticles,
  getComments,
  getSavedArticleIds,
  getTopic,
  incrementArticleViews,
} from "@/lib/content/repository";
import { isStaffRole } from "@/lib/admin/require-staff";
import { prisma } from "@/lib/db";
import {
  formatShortWIB,
  formatWIB,
  readingTimeMinutes,
} from "@/lib/format";
import { categoryLabels, isCategorySlug, site } from "@/lib/site";

type Props = {
  params: Promise<{ category: string; slug: string }>;
  searchParams?: Promise<{
    commentError?: string;
    commentOk?: string;
    reason?: string;
  }>;
};

export const dynamicParams = true;

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

export default async function ArticlePage({ params, searchParams }: Props) {
  const { category, slug } = await params;
  const sp = (await searchParams) ?? {};
  if (!isCategorySlug(category)) notFound();

  const session = await auth();
  const staffPreview = isStaffRole(session?.user?.role);

  let article = await getArticleBySlug(category, slug);
  let isUnpublishedPreview = false;
  if (!article && staffPreview) {
    article = await getArticleBySlugStaffPreview(category, slug);
    isUnpublishedPreview = !!article;
  }
  if (!article) notFound();

  if (!isUnpublishedPreview) {
    await incrementArticleViews(article.id);
  }
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
  const shareUrl = `${site.url.replace(/\/$/, "")}${articlePath}`;

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
    <article className="mx-auto max-w-7xl px-3 py-6 sm:px-6 sm:py-8">
      {isUnpublishedPreview ? (
        <div className="mb-6 rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm">
          <p className="font-medium text-amber-900 dark:text-amber-200">
            Pratinjau staff — artikel belum dipublikasikan ke publik.
          </p>
          <p className="mt-1 text-muted-foreground">
            Pembaca tanpa akun admin akan melihat halaman 404.{" "}
            <Link href="/admin/artikel" className="text-primary hover:underline">
              Kelola di admin
            </Link>
          </p>
        </div>
      ) : null}
      {session?.user?.id && !isUnpublishedPreview ? (
        <TrackReading articleId={article.id} />
      ) : null}
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
        <h1 className="font-serif text-2xl font-bold leading-tight tracking-tight sm:text-3xl md:text-4xl">
          {article.title}
        </h1>
        <p className="mt-4 text-base text-muted-foreground sm:text-lg">
          {article.dek}
        </p>

        <div className="mt-4 space-y-4">
          <ArticleToolbar
            articleId={article.id}
            title={article.title}
            dek={article.dek}
            summaryBullets={article.summaryBullets}
            body={article.body}
            returnPath={articlePath}
            initiallySaved={initiallySaved}
          />
          <ArticleShareBar url={shareUrl} title={article.title} />
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
          <ArticleCoverImage
            src={article.imageUrl}
            slug={article.slug}
            alt={article.imageCaption}
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 720px"
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {article.imageCaption} · {article.imageCredit}
        </p>
      </div>

      <div className="mx-auto mt-8 grid max-w-5xl gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(240px,280px)]">
        <div className="min-w-0">
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

          <CommentsSection
            articleId={article.id}
            path={articlePath}
            comments={comments}
            isLoggedIn={Boolean(session?.user?.id)}
            commentError={sp.commentError === "1"}
            commentOk={sp.commentOk === "1"}
            sessionStale={
              sp.reason === "session" ||
              Boolean(
                session?.user?.id &&
                  !(await prisma.user.findUnique({
                    where: { id: session.user.id },
                    select: { id: true },
                  })),
              )
            }
          />
        </div>

        <aside className="min-w-0 space-y-4 lg:sticky lg:top-24 lg:z-10 lg:self-start">
          <TrustBox status={article.verificationStatus} sources={article.sources} />
          <div className="rounded-xl border border-border bg-card p-4 text-xs text-muted-foreground shadow-sm">
            <p className="font-semibold text-foreground">Transparansi</p>
            <p className="mt-2 leading-relaxed break-words">
              Artikel dipublikasikan {formatWIB(article.publishedAt)}. Status
              verifikasi ditinjau redaksi KabarDesk.
            </p>
          </div>
        </aside>
      </div>

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
