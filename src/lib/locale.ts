import { cookies } from "next/headers";

export const LOCALE_COOKIE = "kabardesk-locale";

export type SiteLocale = "id" | "en";

/** Public site default: Bahasa Indonesia unless the reader chooses English. */
export const DEFAULT_SITE_LOCALE: SiteLocale = "id";

export function parseSiteLocale(value: string | undefined): SiteLocale {
  return value === "en" ? "en" : DEFAULT_SITE_LOCALE;
}

export async function getSiteLocale(): Promise<SiteLocale> {
  const store = await cookies();
  return parseSiteLocale(store.get(LOCALE_COOKIE)?.value);
}
