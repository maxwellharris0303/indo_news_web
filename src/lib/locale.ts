import { cookies } from "next/headers";

export const LOCALE_COOKIE = "kabardesk-locale";

export type SiteLocale = "id" | "en";

export function parseSiteLocale(value: string | undefined): SiteLocale {
  return value === "en" ? "en" : "id";
}

export async function getSiteLocale(): Promise<SiteLocale> {
  const store = await cookies();
  return parseSiteLocale(store.get(LOCALE_COOKIE)?.value);
}
