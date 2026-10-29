import Link from "next/link";
import { getFactChecks } from "@/lib/content/repository";
import { formatShortWIB } from "@/lib/format";

const verdictLabel: Record<string, string> = {
  benar: "Benar",
  salah: "Salah",
  menyesatkan: "Menyesatkan",
  tidak_dapat_diverifikasi: "Tidak dapat diverifikasi",
};

export const metadata = {
  title: "Cek Fakta",
  description: "Verifikasi klaim viral dan hoaks terkini.",
};

export default async function CekFaktaPage() {
  const items = await getFactChecks();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="font-serif text-3xl font-bold">Cek Fakta KabarDesk</h1>
      <p className="mt-2 text-muted-foreground">
        Tim redaksi meninjau klaim yang beredar di media sosial dan messenger.
      </p>
      <ul className="mt-8 divide-y divide-border">
        {items.map((item) => (
          <li key={item.slug} className="py-6">
            <Link href={`/cek-fakta/${item.slug}`} className="group block">
              <p className="text-xs font-bold uppercase text-primary">
                {verdictLabel[item.verdict] ?? item.verdict}
              </p>
              <h2 className="mt-2 font-serif text-xl font-semibold group-hover:text-primary">
                {item.claim}
              </h2>
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                {item.explanation}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {formatShortWIB(item.publishedAt)}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
