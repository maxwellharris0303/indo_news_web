"use client";

import { useState, useTransition } from "react";
import { updateUserInterests, setRegionPreference } from "@/app/actions/user";
import { Button } from "@/components/ui/button";
import { categoryLabels, categorySlugs, type CategorySlug } from "@/lib/site";

const selectable = categorySlugs.filter(
  (c) => c !== "multimedia" && c !== "daerah",
) as CategorySlug[];

export function AccountSettings({
  initialInterests,
  regionSlug,
}: {
  initialInterests: string[];
  regionSlug?: string | null;
}) {
  const [interests, setInterests] = useState<string[]>(initialInterests);
  const [pending, startTransition] = useTransition();

  function toggleInterest(slug: CategorySlug) {
    const next = interests.includes(slug)
      ? interests.filter((s) => s !== slug)
      : [...interests, slug];
    setInterests(next);
    startTransition(() => {
      void updateUserInterests(next);
    });
  }

  return (
    <section className="mt-10 rounded-xl border border-border p-6">
      <h2 className="font-serif text-xl font-bold">Atur minat</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Memengaruhi modul &quot;Untuk kamu&quot; di beranda.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {selectable.map((slug) => {
          const active = interests.includes(slug);
          return (
            <Button
              key={slug}
              type="button"
              size="sm"
              variant={active ? "default" : "outline"}
              disabled={pending}
              onClick={() => toggleInterest(slug)}
            >
              {categoryLabels[slug]}
            </Button>
          );
        })}
      </div>

      <h3 className="mt-8 font-semibold">Wilayah utama</h3>
      <p className="text-sm text-muted-foreground">
        Saat ini: {regionSlug ?? "belum dipilih"}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {[
          { slug: "dki-jakarta", label: "Jakarta" },
          { slug: "jawa-barat", label: "Jawa Barat" },
          { slug: "bali", label: "Bali" },
        ].map((r) => (
          <Button
            key={r.slug}
            type="button"
            size="sm"
            variant="secondary"
            disabled={pending}
            onClick={() =>
              startTransition(() => {
                void setRegionPreference(r.slug);
              })
            }
          >
            {r.label}
          </Button>
        ))}
      </div>
    </section>
  );
}
