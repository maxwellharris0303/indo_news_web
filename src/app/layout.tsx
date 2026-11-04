import type { Metadata } from "next";
import { Merriweather, Work_Sans } from "next/font/google";
import { Providers } from "@/components/providers";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteShell } from "@/components/layout/site-shell";
import { SiteOrganizationJsonLd } from "@/components/site-organization-jsonld";
import { getSiteLocale } from "@/lib/locale";
import { site } from "@/lib/site";
import "./globals.css";

const workSans = Work_Sans({
  variable: "--font-work",
  subsets: ["latin"],
});

const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin"],
  weight: ["700", "900"],
});

export const metadata: Metadata = {
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  metadataBase: new URL(site.url),
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: site.name,
    title: site.name,
    description: site.description,
  },
  icons: {
    icon: [{ url: "/icon", type: "image/png" }],
    apple: [{ url: "/apple-icon", type: "image/png" }],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getSiteLocale();

  return (
    <html
      lang={locale === "en" ? "en" : "id"}
      className={`${workSans.variable} ${merriweather.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col antialiased">
        <SiteOrganizationJsonLd />
        <Providers locale={locale}>
          <ThemeProvider>
            <SiteShell>{children}</SiteShell>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
