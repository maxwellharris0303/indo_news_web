"use client";

import { useState } from "react";
import { ArticleTopicsEditor } from "@/components/admin/article-topics-editor";
import { Button } from "@/components/ui/button";
import type { Topic } from "@/lib/content/types";

type Copy = {
  button: string;
  title: string;
  hint: string;
  save: string;
  cancel: string;
  infer: string;
  saving: string;
};

export function ArticleTopicsButton({
  articleId,
  articleTitle,
  topicSlugs,
  topics,
  copy,
}: {
  articleId: string;
  articleTitle: string;
  topicSlugs: string[];
  topics: Topic[];
  copy: Copy;
}) {
  const [open, setOpen] = useState(false);
  const label =
    topicSlugs.length > 0
      ? `${copy.button} (${topicSlugs.length})`
      : copy.button;

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-8 px-2 text-xs"
        onClick={() => setOpen(true)}
      >
        {label}
      </Button>
      {open ? (
        <ArticleTopicsEditor
          articleId={articleId}
          articleTitle={articleTitle}
          topics={topics}
          initialSlugs={topicSlugs}
          copy={copy}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}
