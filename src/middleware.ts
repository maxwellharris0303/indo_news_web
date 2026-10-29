import { auth } from "@/auth";
import { LOCALE_COOKIE } from "@/lib/locale";
import { NextResponse } from "next/server";

export default auth((req) => {
  if (req.nextUrl.pathname === "/en") {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    const res = NextResponse.redirect(url);
    res.cookies.set(LOCALE_COOKIE, "en", {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    return res;
  }

  const role = req.auth?.user?.role;
  const isStaff =
    role === "SUPERADMIN" || role === "ADMIN" || role === "EDITOR";

  if (req.nextUrl.pathname.startsWith("/admin") && !isStaff) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (req.nextUrl.pathname.startsWith("/akun") && !req.auth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
});

export const config = {
  matcher: ["/admin/:path*", "/akun/:path*", "/en"],
};
