import Link from "next/link";
import { CommentForm } from "@/components/article/comment-form";
import type { CommentView } from "@/lib/content/repository";
import { formatRelativeId } from "@/lib/format";

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
      <h2 className="font-serif text-2xl font-bold">
        Komentar ({comments.length})
      </h2>

      {commentOk ? (
        <p className="mt-3 text-sm text-trust" role="status">
          Komentar terkirim.
        </p>
      ) : null}

      {sessionStale ? (
        <p className="mt-4 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm">
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
        <p className="mt-4 text-sm text-muted-foreground">
          <Link href="/login" className="font-medium text-primary hover:underline">
            Masuk
          </Link>{" "}
          untuk berkomentar.
        </p>
      )}

      <ul className="mt-8 space-y-6">
        {comments.map((c) => (
          <li key={c.id} className="rounded-lg border border-border p-4">
            <p className="text-sm font-semibold">{c.userName}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatRelativeId(c.createdAt)}
            </p>
            <p className="mt-2 text-sm leading-relaxed">{c.body}</p>
          </li>
        ))}
        {comments.length === 0 && (
          <li className="text-sm text-muted-foreground">
            Belum ada komentar. Jadilah yang pertama.
          </li>
        )}
      </ul>
    </section>
  );
}
