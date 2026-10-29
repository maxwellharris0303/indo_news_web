import Link from "next/link";
import { site } from "@/lib/site";

const footerLinks = [
  { href: "/redaksi", label: "Redaksi" },
  { href: "/pedoman-media-siber", label: "Pedoman Media Siber" },
  { href: "/privasi", label: "Kebijakan Privasi" },
  { href: "/indeks", label: "Indeks Berita" },
  { href: "/search", label: "Pencarian" },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-muted/30">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-serif text-xl font-bold">{site.name}</p>
          <p className="mt-2 text-sm text-muted-foreground">{site.tagline}</p>
          <p className="mt-4 text-xs text-muted-foreground">
            © 2026 {site.name}. Hak cipta dilindungi.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold">Informasi</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-primary">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">Kepercayaan Pembaca</p>
          <p className="mt-3 text-sm text-muted-foreground">
            Setiap artikel memuat status verifikasi, sumber, dan jalur koreksi
            terbuka sesuai pedoman media siber.
          </p>
        </div>
      </div>
    </footer>
  );
}
