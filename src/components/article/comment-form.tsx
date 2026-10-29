"use client";

import { postCommentFormAction } from "@/app/actions/social";
import { Button } from "@/components/ui/button";

export function CommentForm({
  articleId,
  path,
}: {
  articleId: string;
  path: string;
}) {
  return (
    <form action={postCommentFormAction} className="mt-6 space-y-3">
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
  );
}
