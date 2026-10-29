"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { rewriteRssItemAction } from "@/app/actions/admin-rss";
import { Button } from "@/components/ui/button";
import { selectClassName } from "@/lib/admin/constants";
import type { AiRewriteProvider, RssScrapeMode } from "@prisma/client";

type Copy = {
  rewrite: string;
  rewriteOptions: string;
  overrideHint: string;
  feedDefaults: string;
  scrapeMode: string;
  scrapeRssOnly: string;
  scrapeFetch: string;
  aiProvider: string;
  openai: string;
  anthropic: string;
  missing: string;
  rewriting: string;
  rewriteHint: string;
};

export function RssItemRewritePanel({
  itemId,
  defaultScrapeMode,
  defaultAiProvider,
  openaiOk,
  anthropicOk,
  copy,
}: {
  itemId: string;
  defaultScrapeMode: RssScrapeMode;
  defaultAiProvider: AiRewriteProvider;
  openaiOk: boolean;
  anthropicOk: boolean;
  copy: Copy;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scrapeMode, setScrapeMode] = useState(defaultScrapeMode);
  const [aiProvider, setAiProvider] = useState(defaultAiProvider);

  async function onRewrite() {
    setPending(true);
    setError(null);
    try {
      const res = await rewriteRssItemAction({
        itemId,
        aiProvider,
        scrapeMode,
      });
      if (res.ok) {
        router.push(
          `/admin/artikel?saved=1&slug=${encodeURIComponent(res.slug)}`,
        );
        router.refresh();
        return;
      }
      setError(res.error);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Rewrite gagal");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-4 space-y-3">
      <label className="block text-sm">
        <span className="font-medium">{copy.scrapeMode}</span>
        <select
          name="scrapeMode"
          value={scrapeMode}
          disabled={pending}
          onChange={(e) =>
            setScrapeMode(e.target.value as RssScrapeMode)
          }
          className={`mt-1 ${selectClassName}`}
        >
          <option value="RSS_ONLY">{copy.scrapeRssOnly}</option>
          <option value="FETCH_ARTICLE">{copy.scrapeFetch}</option>
        </select>
      </label>
      <label className="block text-sm">
        <span className="font-medium">{copy.aiProvider}</span>
        <select
          name="aiProvider"
          value={aiProvider}
          disabled={pending}
          onChange={(e) =>
            setAiProvider(e.target.value as AiRewriteProvider)
          }
          className={`mt-1 ${selectClassName}`}
        >
          <option value="OPENAI" disabled={!openaiOk}>
            {copy.openai}
            {!openaiOk ? ` (${copy.missing})` : ""}
          </option>
          <option value="ANTHROPIC" disabled={!anthropicOk}>
            {copy.anthropic}
            {!anthropicOk ? ` (${copy.missing})` : ""}
          </option>
        </select>
      </label>

      {error ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {pending ? (
        <p className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-foreground">
          {copy.rewriting}
          <span className="mt-1 block text-xs text-muted-foreground">
            {copy.rewriteHint}
          </span>
        </p>
      ) : null}

      <Button
        type="button"
        disabled={
          pending ||
          (!openaiOk && aiProvider === "OPENAI") ||
          (!anthropicOk && aiProvider === "ANTHROPIC")
        }
        onClick={onRewrite}
      >
        {pending ? copy.rewriting : copy.rewrite}
      </Button>
    </div>
  );
}
