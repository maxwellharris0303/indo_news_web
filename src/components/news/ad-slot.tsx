import Link from "next/link";

export function AdSlot({ compact }: { compact?: boolean }) {
  return (
    <aside
      className={`rounded-xl border border-dashed border-border bg-muted/30 text-center ${
        compact ? "p-4 text-xs" : "p-6 text-sm"
      }`}
      aria-label="Ruang iklan"
    >
      <p className="font-semibold text-muted-foreground">KabarDesk Plus</p>
      <p className="mt-2 text-muted-foreground">
        Baca tanpa iklan banner dan dapatkan newsletter mingguan kurasi redaksi.
      </p>
      <Link
        href="/plus"
        className="mt-3 inline-block font-medium text-primary hover:underline"
      >
        Pelajari KabarDesk Plus →
      </Link>
    </aside>
  );
}
