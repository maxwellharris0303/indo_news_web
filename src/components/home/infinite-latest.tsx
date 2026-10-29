"use client";

import { useState } from "react";
import { NewsCard } from "@/components/news/news-card";
import { Button } from "@/components/ui/button";
import type { Article } from "@/lib/content/types";
import type { SiteLocale } from "@/lib/locale";
import { homeText } from "@/lib/locale-ui";

export function InfiniteLatest({
  initial,
  startOffset,
  locale,
}: {
  initial: Article[];
  startOffset: number;
  locale: SiteLocale;
}) {
  const copy = homeText(locale);
  const [items, setItems] = useState(initial);
  const [offset, setOffset] = useState(startOffset);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(initial.length < 8);

  async function loadMore() {
    setLoading(true);
    const res = await fetch(
      `/api/articles?offset=${offset}&limit=8&locale=${locale}`,
    );
    const data = (await res.json()) as {
      items: Article[];
      nextOffset: number;
    };
    setItems((prev) => [...prev, ...data.items]);
    setOffset(data.nextOffset);
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
