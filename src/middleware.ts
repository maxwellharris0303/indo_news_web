import { auth } from "@/auth";
import { NextResponse } from "next/server";

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
});

export const config = {
  matcher: ["/admin/:path*", "/akun/:path*"],
};
