type Props = {
  label: string;
  value: string | number;
  hint?: string;
  accent?: "default" | "trust" | "primary" | "amber";
};

const accentRing: Record<NonNullable<Props["accent"]>, string> = {
  default: "border-border",
  trust: "border-trust/40",
  primary: "border-primary/40",
  amber: "border-amber-500/40",
};

export function StatCard({ label, value, hint, accent = "default" }: Props) {
  return (
    <div
      className={`rounded-xl border bg-card p-5 shadow-sm ${accentRing[accent]}`}
    >
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-2 font-serif text-3xl font-bold tracking-tight">
        {typeof value === "number" ? value.toLocaleString("id-ID") : value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
