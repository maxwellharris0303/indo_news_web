import Link from "next/link";
import { NoTranslateBrand } from "@/components/brand/no-translate-brand";
import { NewsletterForm } from "@/components/news/newsletter-form";
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
    <footer className="mt-auto border-t-2 border-foreground/10 bg-[#1c1917] text-[#f5f0e8] dark:bg-[#0a0a0a]">
      <div className="mx-auto grid max-w-7xl gap-8 px-3 py-10 sm:px-6 sm:py-12 md:grid-cols-3">
        <div>
          <NoTranslateBrand as="p" className="font-serif text-xl font-bold">
            {site.name}
          </NoTranslateBrand>
          <p className="mt-2 text-sm text-[#c9c2b8]">{site.tagline}</p>
          <p className="mt-4 text-xs text-[#9a9288]">
            © 2026{" "}
            <NoTranslateBrand as="span">{site.name}</NoTranslateBrand>. Hak
            cipta dilindungi.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#c9c2b8]">
            Informasi
          </p>
          <ul className="mt-3 space-y-2 text-sm text-[#ddd6cc]">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#c9c2b8]">
            Newsletter
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[#c9c2b8]">
            Ringkasan mingguan dari redaksi.
          </p>
          <div className="mt-4">
            <NewsletterForm compact />
          </div>
        </div>
      </div>
    </footer>
  );
}
