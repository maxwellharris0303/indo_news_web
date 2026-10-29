import { Badge } from "@/components/ui/badge";
import { parseArticleSources } from "@/lib/article-sources";
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
  const parsed = parseArticleSources(sources);

  return (
    <aside className="min-w-0 rounded-xl border border-border bg-muted/30 p-4 lg:sticky lg:top-24">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold">Status kepercayaan</span>
        <Badge variant={variants[status]}>{labels[status]}</Badge>
      </div>
      {parsed.length > 0 && (
        <div className="mt-3 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Sumber
          </p>
          <ul className="mt-2 space-y-3 text-sm text-foreground">
            {parsed.map((s, i) => (
              <li key={`${s.href ?? s.label}-${i}`} className="min-w-0">
                {s.href ? (
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary underline-offset-2 hover:underline break-words"
                  >
                    {s.label}
                  </a>
                ) : (
                  <span className="break-words">{s.label}</span>
                )}
                {s.note && s.note !== s.label ? (
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground break-words">
                    {s.note}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
