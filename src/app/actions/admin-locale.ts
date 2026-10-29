"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  ADMIN_LOCALE_COOKIE,
  parseAdminLocale,
  type AdminLocale,
} from "@/lib/admin-locale";

export async function setAdminLocaleAction(locale: AdminLocale) {
  const next = parseAdminLocale(locale);
  const store = await cookies();
  store.set(ADMIN_LOCALE_COOKIE, next, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  revalidatePath("/admin", "layout");
}
