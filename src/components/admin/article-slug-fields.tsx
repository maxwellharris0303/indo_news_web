"use client";

import { useId, useState } from "react";
import { Input } from "@/components/ui/input";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function ArticleSlugFields() {
  const titleId = useId();
  const slugId = useId();
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  return (
    <>
      <label className="block text-sm" htmlFor={titleId}>
        <span className="font-medium">Judul</span>
        <Input
          id={titleId}
          name="title"
          required
          minLength={10}
          placeholder="Judul berita"
          className="mt-1.5"
          onChange={(e) => {
            if (!slugTouched) {
              setSlug(slugify(e.target.value));
            }
          }}
        />
      </label>
      <label className="block text-sm" htmlFor={slugId}>
        <span className="font-medium">Slug URL</span>
        <Input
          id={slugId}
          name="slug"
          required
          minLength={3}
          value={slug}
          placeholder="slug-url-artikel"
          className="mt-1.5 font-mono text-sm"
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(slugify(e.target.value));
          }}
        />
        <span className="mt-1 block text-xs text-muted-foreground">
          Otomatis dari judul; bisa diedit manual.
        </span>
      </label>
    </>
  );
}
