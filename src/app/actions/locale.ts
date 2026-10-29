"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  LOCALE_COOKIE,
  parseSiteLocale,
  type SiteLocale,
} from "@/lib/locale";

export async function setSiteLocaleAction(locale: SiteLocale) {
  const next = parseSiteLocale(locale);
  const store = await cookies();
  store.set(LOCALE_COOKIE, next, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  revalidatePath("/", "layout");
}
