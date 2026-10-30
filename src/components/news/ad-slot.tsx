import Link from "next/link";
import { NoTranslateBrand } from "@/components/brand/no-translate-brand";
import { site } from "@/lib/site";

export function AdSlot({ compact }: { compact?: boolean }) {
  return (
    <aside
      className={`rounded-xl border border-dashed border-border bg-muted/30 text-center ${
        compact ? "p-4 text-xs" : "p-6 text-sm"
      }`}
      aria-label="Ruang iklan"
    >
      <NoTranslateBrand as="p" className="font-semibold text-muted-foreground">
        {site.name} Plus
      </NoTranslateBrand>
      <p className="mt-2 text-muted-foreground">
        Baca tanpa iklan banner dan dapatkan newsletter mingguan kurasi redaksi.
      </p>
      <Link
        href="/plus"
        className="mt-3 inline-block font-medium text-primary hover:underline"
      >
        Pelajari{" "}
        <NoTranslateBrand as="span">{site.name} Plus</NoTranslateBrand> →
      </Link>
    </aside>
  );
}
