import { site } from "@/lib/site";

export function SiteOrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    name: site.name,
    url: site.url,
    description: site.description,
    logo: {
      "@type": "ImageObject",
      url: `${site.url}/icon`,
    },
    sameAs: [],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "redaksi",
      email: "redaksi@kabardesk.id",
      availableLanguage: ["Indonesian", "English"],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
