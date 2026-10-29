"use client";

import { useFormStatus } from "react-dom";
import { postCommentFormAction } from "@/app/actions/social";
import { Button } from "@/components/ui/button";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? "Mengirim…" : "Kirim komentar"}
    </Button>
  );
}

export function CommentForm({
  articleId,
  path,
  error,
}: {
  articleId: string;
  path: string;
  error?: boolean;
}) {
  return (
    <form action={postCommentFormAction} className="mt-6 space-y-3">
      <input type="hidden" name="articleId" value={articleId} />
      <input type="hidden" name="path" value={path} />
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          Komentar gagal dikirim. Coba lagi.
        </p>
      ) : null}
      <textarea
        name="body"
        required
        minLength={3}
        maxLength={2000}
        rows={4}
        placeholder="Tulis komentar dengan santun..."
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
      />
      <SubmitButton />
    </form>
  );
}
