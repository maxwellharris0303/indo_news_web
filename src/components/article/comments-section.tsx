import Link from "next/link";
import { MessageSquareText } from "lucide-react";
import { CommentForm } from "@/components/article/comment-form";
import { CommentAvatar } from "@/components/article/comment-avatar";
import type { CommentView } from "@/lib/content/repository";
import { formatRelativeId } from "@/lib/format";
import { cn } from "@/lib/utils";

function CommentThreadItem({ comment }: { comment: CommentView }) {
  return (
    <div className="flex gap-3 sm:gap-4">
      <CommentAvatar name={comment.userName} className="mt-0.5" />
      <article className="min-w-0 flex-1">
        <header className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <h3 className="text-sm font-semibold text-foreground">
            {comment.userName}
          </h3>
          <time
            dateTime={comment.createdAt}
            className="text-xs text-muted-foreground"
          >
            {formatRelativeId(comment.createdAt)}
          </time>
        </header>
        <p className="mt-2 text-sm leading-relaxed text-foreground/90">
          {comment.body}
        </p>
      </article>
    </div>
  );
}

export function CommentsSection({
  articleId,
  path,
  comments,
  isLoggedIn,
  commentError,
  commentOk,
  sessionStale,
}: {
  articleId: string;
  path: string;
  comments: CommentView[];
  isLoggedIn: boolean;
  commentError?: boolean;
  commentOk?: boolean;
  sessionStale?: boolean;
}) {
  return (
    <section
      id="komentar"
      className="scroll-mt-24 border-t border-border pt-10"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <MessageSquareText className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <h2 className="font-serif text-2xl font-bold tracking-tight">
            Diskusi pembaca
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {comments.length === 0
              ? "Belum ada komentar — mulai percakapan dengan sopan."
              : `${comments.length} komentar · urut terbaru`}
          </p>
        </div>
      </div>

      {commentOk ? (
        <p
          className="mt-4 rounded-lg border border-trust/40 bg-trust/10 px-4 py-3 text-sm text-trust"
          role="status"
        >
          Komentar terkirim. Terima kasih sudah berpartisipasi.
        </p>
      ) : null}

      <div className="mt-6 rounded-xl border border-border bg-muted/20 p-4 sm:p-5">
        {sessionStale ? (
          <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm">
            Sesi login kedaluwarsa setelah pembaruan server.{" "}
            <Link
              href={`/login?callbackUrl=${encodeURIComponent(path)}`}
              className="font-medium text-primary hover:underline"
            >
              Masuk lagi
            </Link>{" "}
            untuk berkomentar.
          </p>
        ) : isLoggedIn ? (
          <CommentForm
            articleId={articleId}
            path={path}
            error={commentError}
          />
        ) : (
          <p className="text-sm leading-relaxed text-muted-foreground">
            <Link
              href={`/login?callbackUrl=${encodeURIComponent(path)}`}
              className="font-semibold text-primary hover:underline"
            >
              Masuk
            </Link>{" "}
            untuk ikut berdiskusi. Komentar yang melanggar pedoman media siber
            dapat disembunyikan.
          </p>
        )}
      </div>

      {comments.length > 0 ? (
        <ol
          className={cn(
            "mt-8 list-none divide-y divide-border rounded-xl border border-border bg-card/40",
            "px-4 py-2 sm:px-5",
          )}
        >
          {comments.map((c) => (
            <li key={c.id} className="py-5 first:pt-4 last:pb-4">
              <CommentThreadItem comment={c} />
            </li>
          ))}
        </ol>
      ) : (
        <div className="mt-8 rounded-xl border border-dashed border-border bg-muted/10 px-6 py-10 text-center">
          <MessageSquareText
            className="mx-auto h-8 w-8 text-muted-foreground/60"
            aria-hidden
          />
          <p className="mt-3 text-sm font-medium text-foreground">
            Belum ada komentar
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Jadilah yang pertama memberi tanggapan terhadap artikel ini.
          </p>
        </div>
      )}
    </section>
  );
}
