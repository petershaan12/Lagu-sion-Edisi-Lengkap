import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/admin-auth";

export function proxy(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE)?.value || "";
  if (verifyAdminToken(token)) return NextResponse.next();

  return NextResponse.rewrite(new URL("/admin-tidak-ada", request.url), { status: 404 });
}

export const config = {
  matcher: ["/admin/:path*", "/admin"],
};
