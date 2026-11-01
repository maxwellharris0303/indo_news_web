import { auth } from "@/auth";
import { LOCALE_COOKIE, DEFAULT_SITE_LOCALE } from "@/lib/locale";
import { NextResponse } from "next/server";

const LOCALE_MAX_AGE = 60 * 60 * 24 * 365;

function withDefaultLocaleCookie(
  req: { cookies: { get: (name: string) => { value: string } | undefined } },
  res: NextResponse,
): NextResponse {
  if (!req.cookies.get(LOCALE_COOKIE)?.value) {
    res.cookies.set(LOCALE_COOKIE, DEFAULT_SITE_LOCALE, {
      path: "/",
      maxAge: LOCALE_MAX_AGE,
      sameSite: "lax",
    });
  }

  return res;
}

export default auth((req) => {
  const role = req.auth?.user?.role;
  const isStaff =
    role === "SUPERADMIN" || role === "ADMIN" || role === "EDITOR";

  if (req.nextUrl.pathname.startsWith("/admin") && !isStaff) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (req.nextUrl.pathname.startsWith("/akun") && !req.auth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return withDefaultLocaleCookie(req, NextResponse.next());
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
