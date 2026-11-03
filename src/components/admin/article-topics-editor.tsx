"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  inferArticleTopicsAction,
  updateArticleTopicsAction,
} from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import type { Topic } from "@/lib/content/types";

type Copy = {
  title: string;
  hint: string;
  save: string;
  cancel: string;
  infer: string;
  saving: string;
};

export function ArticleTopicsEditor({
  articleId,
  articleTitle,
  topics,
  initialSlugs,
  copy,
  onClose,
}: {
  articleId: string;
  articleTitle: string;
  topics: Topic[];
  initialSlugs: string[];
  copy: Copy;
  onClose: () => void;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>(initialSlugs);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggle(slug: string) {
    setSelected((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const res = await updateArticleTopicsAction(articleId, selected);
      if (!res.ok) {
        setError(res.error ?? "Gagal");
        return;
      }
      router.refresh();
      onClose();
    });
  }

  function inferFromText() {
    setError(null);
    startTransition(async () => {
      const res = await inferArticleTopicsAction(articleId);
      if (!res.ok) {
        setError(res.error ?? "Gagal");
        return;
      }
      setSelected(res.topicSlugs);
      router.refresh();
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
      role="dialog"
      aria-labelledby="topics-editor-title"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-card p-5 shadow-lg">
        <h3 id="topics-editor-title" className="font-serif text-lg font-bold">
          {copy.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {articleTitle}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">{copy.hint}</p>

        <div className="mt-4 space-y-2">
          {topics.map((topic) => {
            const active = selected.includes(topic.slug);
            return (
              <label
                key={topic.slug}
                className="flex cursor-pointer items-start gap-2 rounded-lg border border-border px-3 py-2 text-sm has-[:checked]:border-primary"
              >
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => toggle(topic.slug)}
                  className="mt-0.5 size-4 rounded border-border"
                />
                <span>
                  <span className="font-medium">#{topic.name}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {topic.description}
                  </span>
                </span>
              </label>
            );
          })}
        </div>

        {error ? (
          <p className="mt-3 text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
          <Button type="button" onClick={save} disabled={pending}>
            {pending ? copy.saving : copy.save}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={inferFromText}
            disabled={pending}
          >
            {copy.infer}
          </Button>
          <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
            {copy.cancel}
          </Button>
        </div>
      </div>
    </div>
  );
}
