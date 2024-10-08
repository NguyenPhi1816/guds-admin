import {
  DEFAULT_REDIRECT,
  PUBLIC_ROUTES,
  REFRESH_TOKEN_REDIRECT,
} from "@/lib/routes";
import { auth } from "./auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const pathname = "/" + nextUrl.pathname.split("/")[1];

  const isAuthenticated = !!req.auth;
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  if (isPublicRoute) {
    return NextResponse.next();
  }

  if (!isPublicRoute && !isAuthenticated) {
    console.log("Unauthorized");
    return NextResponse.redirect(new URL(DEFAULT_REDIRECT, nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images).*)"],
};
