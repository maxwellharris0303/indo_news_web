"use client";

import { useTransition } from "react";
import { setRegionPreference } from "@/app/actions/user";
import { Button } from "@/components/ui/button";

export function RegionPicker({
  regions,
}: {
  regions: { slug: string; name: string }[];
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="mt-6 flex flex-wrap gap-2">
      {regions.map((r) => (
        <Button
          key={r.slug}
          type="button"
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() =>
            startTransition(() => {
              void setRegionPreference(r.slug);
            })
          }
        >
          Jadikan {r.name} sebagai daerah utama
        </Button>
      ))}
    </div>
  );
}
