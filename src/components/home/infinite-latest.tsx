"use client";

import { useMemo, useState } from "react";
import { NewsCard } from "@/components/news/news-card";
import { Button } from "@/components/ui/button";
import type { Article } from "@/lib/content/types";
import type { SiteLocale } from "@/lib/locale";
import { homeText } from "@/lib/locale-ui";

export function InfiniteLatest({
  initial,
  excludeIds,
  locale,
}: {
  initial: Article[];
  /** Article ids already shown above this block (homepage dedup). */
  excludeIds: string[];
  locale: SiteLocale;
}) {
  const copy = homeText(locale);
  const [items, setItems] = useState(initial);
  const [seenIds, setSeenIds] = useState(
    () =>
      new Set([
        ...excludeIds,
        ...initial.map((article) => article.id),
      ]),
  );
  const excludeQuery = useMemo(
    () => [...seenIds].join(","),
    [seenIds],
  );
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(initial.length < 8);

  async function loadMore() {
    setLoading(true);
    const params = new URLSearchParams({
      limit: "8",
      locale,
      excludeIds: excludeQuery,
    });
    const res = await fetch(`/api/articles?${params.toString()}`);
    const data = (await res.json()) as {
      items: Article[];
      nextOffset: number;
    };
    setItems((prev) => [...prev, ...data.items]);
    setSeenIds((prev) => {
      const next = new Set(prev);
      for (const article of data.items) next.add(article.id);
      return next;
    });
    if (data.items.length === 0) setDone(true);
    setLoading(false);
  }

  return (
    <div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {items.map((article) => (
          <NewsCard key={article.id} article={article} />
        ))}
      </div>
      {!done && (
        <div className="mt-8 flex justify-center">
          <Button variant="outline" onClick={loadMore} disabled={loading}>
            {loading ? copy.loading : copy.loadMore}
          </Button>
        </div>
      )}
    </div>
  );
}
