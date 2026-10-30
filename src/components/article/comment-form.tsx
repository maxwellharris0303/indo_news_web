"use client";

import { useFormStatus } from "react-dom";
import { postCommentFormAction } from "@/app/actions/social";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending} className="min-h-9">
      {pending ? "Mengirim…" : "Kirim komentar"}
    </Button>
  );
}

const textareaClass =
  "min-h-[7rem] w-full resize-y rounded-lg border border-border bg-background px-3 py-2.5 text-sm leading-relaxed shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background";

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
    <form action={postCommentFormAction} className="space-y-3">
      <input type="hidden" name="articleId" value={articleId} />
      <input type="hidden" name="path" value={path} />
      <label className="block text-sm font-medium text-foreground">
        Tulis komentar
        <span className="mt-1.5 block font-normal text-xs text-muted-foreground">
          Gunakan bahasa santun. Maks. 2.000 karakter.
        </span>
        <textarea
          name="body"
          required
          minLength={3}
          maxLength={2000}
          rows={4}
          placeholder="Bagikan pendapat atau pertanyaan Anda…"
          className={cn(textareaClass, "mt-2")}
        />
      </label>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          Komentar gagal dikirim. Coba lagi.
        </p>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <p className="text-xs text-muted-foreground">
          Dengan mengirim, Anda setuju pedoman media siber KabarDesk.
        </p>
        <SubmitButton />
      </div>
    </form>
  );
}
