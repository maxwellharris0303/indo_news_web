import Link from "next/link";
import { RetagTopicsForm } from "@/components/admin/retag-topics-form";
import { Button } from "@/components/ui/button";
import { getAdminLocale } from "@/lib/admin-locale";
import { formatCountAdmin, topicsAdminText } from "@/lib/admin/locale-ui";
import { getTopicsWithCounts } from "@/lib/topics/queries";

export const metadata = { title: "Topik" };

type Props = {
  searchParams: Promise<{ retag?: string; scanned?: string }>;
};

export default async function AdminTopicsPage({ searchParams }: Props) {
  const locale = await getAdminLocale();
  const copy = topicsAdminText(locale);
  const topics = await getTopicsWithCounts();
  const sp = await searchParams;

  let retagBanner: { kind: "ok" | "warn" | "error" | "auth"; text: string } | null =
    null;
  if (sp.retag === "error") {
    retagBanner = { kind: "error", text: copy.retagError };
  } else if (sp.retag === "auth") {
    retagBanner = { kind: "auth", text: copy.retagAuthError };
  } else if (sp.retag !== undefined) {
    const tagged = Number.parseInt(sp.retag, 10);
    const scanned = Number.parseInt(sp.scanned ?? "0", 10);
    if (Number.isFinite(tagged) && Number.isFinite(scanned)) {
      retagBanner =
        tagged > 0
          ? { kind: "ok", text: copy.retagSuccess(tagged, scanned) }
          : { kind: "warn", text: copy.retagNone(scanned) };
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-xl font-bold sm:text-2xl">{copy.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{copy.subtitle}</p>
      </div>

      {retagBanner ? (
        <div
          role="status"
          className={
            retagBanner.kind === "ok"
              ? "rounded-lg border border-trust/40 bg-trust/10 px-4 py-3 text-sm text-trust"
              : retagBanner.kind === "warn"
                ? "rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-100"
                : "rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          }
        >
          {retagBanner.text}
        </div>
      ) : null}

      <RetagTopicsForm
        title={copy.retagTitle}
        hint={copy.retagHint}
        buttonLabel={copy.retagButton}
        pendingLabel={copy.retagPending}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {topics.map((topic) => (
          <div
            key={topic.slug}
            className="rounded-xl border border-border bg-card p-5"
          >
            <p className="text-xs font-semibold uppercase text-primary">Topik</p>
            <h3 className="mt-1 font-serif text-lg font-bold">#{topic.name}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {topic.description}
            </p>
            <p className="mt-3 text-sm">
              {copy.articleCount}:{" "}
              <span className="font-semibold">
                {formatCountAdmin(topic.articleCount, locale)}
              </span>
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" asChild>
                <Link href={`/topik/${topic.slug}`} target="_blank">
                  {copy.viewPublic}
                </Link>
              </Button>
              <Button size="sm" variant="ghost" asChild>
                <Link
                  href={`/admin/artikel?q=${encodeURIComponent(topic.name.split(" ")[0] ?? topic.slug)}`}
                >
                  {copy.findArticles}
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
