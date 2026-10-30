"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SearchForm({
  initialQuery = "",
  onSubmitted,
}: {
  initialQuery?: string;
  onSubmitted?: () => void;
}) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);

  useEffect(() => {
    setQ(initialQuery);
  }, [initialQuery]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = q.trim();
    router.push(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search");
    onSubmitted?.();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-2 sm:flex-row sm:items-center"
    >
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Cari judul atau topik..."
        aria-label="Kata kunci pencarian"
        className="min-h-11 flex-1"
      />
      <Button type="submit" className="min-h-11 shrink-0 sm:px-8">
        Cari
      </Button>
    </form>
  );
}
