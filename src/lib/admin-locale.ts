import { cookies } from "next/headers";

export const ADMIN_LOCALE_COOKIE = "kabardesk-admin-locale";

export type AdminLocale = "id" | "en";

export function parseAdminLocale(value: string | undefined): AdminLocale {
  return value === "en" ? "en" : "id";
}

export async function getAdminLocale(): Promise<AdminLocale> {
  const store = await cookies();
  return parseAdminLocale(store.get(ADMIN_LOCALE_COOKIE)?.value);
}
