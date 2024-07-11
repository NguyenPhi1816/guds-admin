import {
  DEFAULT_REDIRECT,
  PUBLIC_ROUTES,
  REFRESH_TOKEN_REDIRECT,
  ROOT,
} from "@/lib/routes";
import { auth } from "./auth";
import { NextResponse } from "next/server";

function isTokenExpired(token: string) {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString()
    );
    const exp = payload.exp * 1000;
    return Date.now() > exp;
  } catch (error) {
    console.error("Invalid token", error);
    return true;
  }
}

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
    if (authentication) {
      const accessToken = authentication.user.access_token;
      const refreshToken = authentication.user.refresh_token;
      if (isTokenExpired(accessToken)) {
        console.log("Access token expired");

        if (isTokenExpired(refreshToken)) {
          console.log("Refresh token expired");
          return NextResponse.redirect(new URL(DEFAULT_REDIRECT, nextUrl));
        }

        const redirectUrl = new URL(REFRESH_TOKEN_REDIRECT, nextUrl);
        redirectUrl.searchParams.set("redirect", nextUrl.pathname);
        return NextResponse.redirect(redirectUrl);
      }
    } else {
      return NextResponse.redirect(new URL(DEFAULT_REDIRECT, nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images).*)"],
};
