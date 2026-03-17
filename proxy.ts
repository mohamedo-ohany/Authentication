import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Backend base URL used for authentication checks.
const API_BASE_URL = process.env.API_BASE_URL;

// Cookie name expected to carry the auth session/token.
const AUTH_COOKIE_NAME = "httpOnlyCookie";

// Only these routes require authentication.
const protectedRoutes = ["/profile"];

function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

function redirectToHome(request: NextRequest) {
  // Build absolute URL to avoid invalid relative redirects in proxy runtime.
  return NextResponse.redirect(new URL("/", request.url));
}

export default async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Fast path: skip backend validation for non-protected routes.
  if (!isProtectedRoute(pathname)) {
    return NextResponse.next();
  }

  // In proxy, read cookies from the incoming request, not next/headers cookies().
  const authCookie = request.cookies.get(AUTH_COOKIE_NAME);

  // Missing auth cookie means user is unauthenticated.
  if (!authCookie?.value) {
    return redirectToHome(request);
  }

  // If backend URL is not configured, fail closed for protected pages.
  if (!API_BASE_URL) {
    console.error("API_BASE_URL is not configured");
    return redirectToHome(request);
  }

  try {
    // Send cookie to backend exactly as a Cookie header.
    // This keeps HttpOnly flow server-to-server and avoids exposing token in JS.
    const response = await fetch(`${API_BASE_URL}/user/isloggedin`, {
      method: "POST",
      headers: {
        Cookie: `${AUTH_COOKIE_NAME}=${authCookie.value}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return redirectToHome(request);
    }

    const result = await response.json();

    // Allow request only when backend explicitly confirms session validity.
    if (result?.success === true || result?.ok === 1) {
      return NextResponse.next();
    }

    return redirectToHome(request);
  } catch (err) {
    // Network/backend failures should not open protected routes.
    console.error("Error checking login status:", err);
    return redirectToHome(request);
  }
}

export const config = {
  // Include nested profile routes too, e.g. /profile/settings.
  matcher: ["/profile/:path*"],
};
