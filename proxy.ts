import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Primary backend URL used for authentication checks.
// In production, default to the Render backend service.
const PRIMARY_API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? process.env.RENDER_API_BASE_URL?.trim() ||
      "https://authentication-waad.onrender.com"
    : process.env.API_BASE_URL?.trim() || "http://localhost:8000";

// Canonical auth cookie name used across the app.
const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME?.trim() || "Token";
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY?.trim();

function redirectToHome(request: NextRequest) {
  // Build absolute URL to avoid invalid relative redirects in proxy runtime.
  return NextResponse.redirect(new URL("/", request.url));
}

function redirectToProfile(request: NextRequest) {
  return NextResponse.redirect(new URL("/profile", request.url));
}

function isAuthEntryPath(pathname: string) {
  return pathname === "/" || pathname === "/log-in" || pathname === "/sign-up";
}

function isProtectedProfilePath(pathname: string) {
  return pathname === "/profile" || pathname.startsWith("/profile/");
}

export default async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isAuthEntry = isAuthEntryPath(pathname);
  const isProtectedProfile = isProtectedProfilePath(pathname);

  // In proxy, read cookies from the incoming request, not next/headers cookies().
  const authCookie = request.cookies.get(AUTH_COOKIE_NAME);

  // Missing auth cookie means user is unauthenticated.
  if (!authCookie?.value) {
    return isProtectedProfile ? redirectToHome(request) : NextResponse.next();
  }

  try {
    // Send cookie to backend exactly as a Cookie header.
    // This keeps HttpOnly flow server-to-server and avoids exposing token in JS.
    const headers: Record<string, string> = {
      Cookie: `${AUTH_COOKIE_NAME}=${authCookie.value}`,
    };

    if (INTERNAL_API_KEY) {
      headers["X-Internal-Api-Key"] = INTERNAL_API_KEY;
    }

    const response = await fetch(`${PRIMARY_API_BASE_URL}/user/isloggedin`, {
      method: "POST",
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      return isProtectedProfile ? redirectToHome(request) : NextResponse.next();
    }

    const result = await response.json();
    const isAuthenticated = result?.ok === 1 || result?.login?.ok === 1;

    // Allow request only when backend explicitly confirms session validity.
    if (isAuthenticated) {
      if (isAuthEntry) {
        return redirectToProfile(request);
      }

      return NextResponse.next();
    }

    return isProtectedProfile ? redirectToHome(request) : NextResponse.next();
  } catch (err) {
    // Network/backend failures should not open protected routes.
    console.error("Error checking login status:", err);
    return isProtectedProfile ? redirectToHome(request) : NextResponse.next();
  }
}

export const config = {
  // Run proxy for all app pages (excluding API/static assets),
  // then handle route-specific redirect logic in code above.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
