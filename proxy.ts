import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Primary backend URL used for authentication checks.
// In production, default to the Render backend service.
const PRIMARY_API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? process.env.RENDER_API_BASE_URL?.trim() ||
      "https://authentication-waad.onrender.com"
    : process.env.API_BASE_URL?.trim() || "http://localhost:8000";

// Optional fallback backend (for migration period), e.g. existing Railway URL.
const FALLBACK_API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? process.env.API_BASE_URL?.trim() || ""
    : "";

// Canonical auth cookie name used across the app.
const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME?.trim() || "Token";
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY?.trim();

function redirectToHome(request: NextRequest) {
  // Build absolute URL to avoid invalid relative redirects in proxy runtime.
  return NextResponse.redirect(new URL("/", request.url));
}

export default async function proxy(request: NextRequest) {
  // In proxy, read cookies from the incoming request, not next/headers cookies().
  const authCookie = request.cookies.get(AUTH_COOKIE_NAME);

  // Missing auth cookie means user is unauthenticated.
  if (!authCookie?.value) {
    return redirectToHome(request);
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

    const candidates = [
      PRIMARY_API_BASE_URL,
      ...(FALLBACK_API_BASE_URL && FALLBACK_API_BASE_URL !== PRIMARY_API_BASE_URL
        ? [FALLBACK_API_BASE_URL]
        : []),
    ];

    for (const baseUrl of candidates) {
      try {
        const response = await fetch(`${baseUrl}/user/isloggedin`, {
          method: "POST",
          headers,
          cache: "no-store",
        });

        if (!response.ok) {
          continue;
        }

        const result = await response.json();
        const isAuthenticated = result?.ok === 1 || result?.login?.ok === 1;

        // Allow request only when backend explicitly confirms session validity.
        if (isAuthenticated) {
          return NextResponse.next();
        }
      } catch {
        // Try next backend candidate on errors.
      }
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
