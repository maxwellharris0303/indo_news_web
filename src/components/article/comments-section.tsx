import Link from "next/link";
import { postCommentAction } from "@/app/actions/social";
import { Button } from "@/components/ui/button";
import type { CommentView } from "@/lib/content/repository";
import { formatRelativeId } from "@/lib/format";

export function CommentsSection({
  articleId,
  path,
  comments,
  isLoggedIn,
}: {
  articleId: string;
  path: string;
  comments: CommentView[];
  isLoggedIn: boolean;
}) {
  return (
    <section className="mx-auto mt-16 max-w-3xl border-t border-border pt-10">
      <h2 className="font-serif text-2xl font-bold">
        Komentar ({comments.length})
      </h2>

      {isLoggedIn ? (
        <form
          action={async (formData) => {
            await postCommentAction(formData);
          }}
          className="mt-6 space-y-3"
        >
          <input type="hidden" name="articleId" value={articleId} />
          <input type="hidden" name="path" value={path} />
          <textarea
            name="body"
            required
            minLength={3}
            maxLength={2000}
            rows={4}
            placeholder="Tulis komentar dengan santun..."
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
          <Button type="submit" size="sm">
            Kirim komentar
          </Button>
        </form>
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
