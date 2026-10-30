import Link from "next/link";
import { createArticleFormAction } from "@/app/actions/admin";
import { ArticleSlugFields } from "@/components/admin/article-slug-fields";
import { Button } from "@/components/ui/button";
import {
  ARTICLE_STATUSES,
  selectClassName,
  STATUS_LABELS,
  textareaClassName,
} from "@/lib/admin/constants";
import { BREAKING_HOUR_OPTIONS } from "@/lib/content/urgency";
import type { composeText } from "@/lib/admin/locale-ui";
import { categoryLabels, categorySlugs } from "@/lib/site";

type Author = { id: string; name: string };

type Props = {
  authors: Author[];
  error?: string;
  copy: ReturnType<typeof composeText>;
};

export function ArticleComposeForm({ authors, error, copy }: Props) {
  return (
    <form action={createArticleFormAction} className="space-y-6">
      <input type="hidden" name="editorialOrigin" value="ORIGINAL" />
      {error ? (
        <div
          className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          {error === "validasi"
            ? "Validasi gagal. Periksa judul, slug, dek, dan isi (min. 50 karakter)."
            : error === "slug"
              ? "Slug sudah dipakai. Gunakan slug lain."
              : "Gagal menyimpan artikel."}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <ArticleSlugFields />
        <div className="space-y-4">
          <label className="block text-sm">
            <span className="font-medium">Kanal</span>
            <select name="category" className={`mt-1.5 ${selectClassName}`} required>
              {categorySlugs.map((c) => (
                <option key={c} value={c}>
                  {categoryLabels[c]}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-medium">Status publikasi</span>
            <select
              name="status"
              className={`mt-1.5 ${selectClassName}`}
              defaultValue="PUBLISHED"
            >
              {ARTICLE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-medium">Penulis</span>
            <select name="authorId" className={`mt-1.5 ${selectClassName}`} required>
              {authors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <fieldset className="space-y-3 rounded-lg border border-border bg-muted/20 p-4">
        <legend className="px-1 text-sm font-medium">{copy.urgencyTitle}</legend>
        <p className="text-xs text-muted-foreground">{copy.urgencyHint}</p>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="markBreaking" className="size-4 rounded border-border" />
            {copy.markBreaking}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">{copy.breakingHours}</span>
            <select
              name="breakingHours"
              className={`h-9 ${selectClassName}`}
              defaultValue="6"
            >
              {BREAKING_HOUR_OPTIONS.map((h) => (
                <option key={h} value={h}>
                  {h} jam
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="markDeveloping"
              className="size-4 rounded border-border"
            />
            {copy.markDeveloping}
          </label>
        </div>
      </fieldset>

      <fieldset className="space-y-3 rounded-lg border border-border bg-muted/20 p-4">
        <legend className="px-1 text-sm font-medium">{copy.featuredTitle}</legend>
        <p className="text-xs text-muted-foreground">{copy.featuredHint}</p>
        <select
          name="featuredLevel"
          className={selectClassName}
          defaultValue="0"
        >
          <option value="0">{copy.featuredNone}</option>
          <option value="1">{copy.featuredEditorPick}</option>
          <option value="3">{copy.featuredHero}</option>
        </select>
      </fieldset>

      <label className="block text-sm">
        <span className="font-medium">Lead / dek</span>
        <textarea
          name="dek"
          required
          rows={2}
          placeholder="Ringkasan 1–2 kalimat di atas artikel..."
          className={`mt-1.5 ${textareaClassName}`}
        />
      </label>

      <label className="block text-sm">
        <span className="font-medium">Isi berita</span>
        <textarea
          name="body"
          required
          rows={12}
          placeholder="Tulis isi artikel. Paragraf dipisah baris kosong."
          className={`mt-1.5 font-mono text-[0.8125rem] leading-relaxed ${textareaClassName}`}
        />
      </label>

      <div className="flex flex-wrap gap-3 border-t border-border pt-4">
        <Button type="submit" size="lg">
          Simpan artikel
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/admin/artikel">Batal</Link>
        </Button>
      </div>
    </form>
  );
}
