import { Badge } from "@/components/ui/badge";
import type { VerificationStatus } from "@/lib/content/types";

const labels: Record<VerificationStatus, string> = {
  verified: "Terverifikasi redaksi",
  investigation: "Dalam penyelidikan",
  hoax: "Hoaks / disinformasi",
};

const variants: Record<
  VerificationStatus,
  "verified" | "secondary" | "hoax"
> = {
  verified: "verified",
  investigation: "secondary",
  hoax: "hoax",
};

export function TrustBox({
  status,
  sources,
}: {
  status: VerificationStatus;
  sources: string[];
}) {
  return (
    <aside className="rounded-xl border border-border bg-muted/30 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold">Status kepercayaan</span>
        <Badge variant={variants[status]}>{labels[status]}</Badge>
      </div>
      {sources.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Sumber
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-foreground">
            {sources.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
