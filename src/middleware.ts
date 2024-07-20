import {
  DEFAULT_REDIRECT,
  PUBLIC_ROUTES,
  REFRESH_TOKEN_REDIRECT,
} from "@/lib/routes";
import { auth } from "./auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isAuthenticated = !!req.auth;
  const isPublicRoute = PUBLIC_ROUTES.includes(nextUrl.pathname);

  if (!isPublicRoute && !isAuthenticated) {
    console.log("Unauthorized");
    return NextResponse.redirect(new URL(DEFAULT_REDIRECT, nextUrl));
  }

  if (
    !isPublicRoute &&
    isAuthenticated &&
    nextUrl.pathname !== REFRESH_TOKEN_REDIRECT
  ) {
    const authentication = req.auth;
    if (!authentication) {
      return NextResponse.redirect(new URL(DEFAULT_REDIRECT, nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images).*)"],
};
