import { NextResponse } from "next/server";

// Primary cookie name used by the app, with a safe default.
const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME?.trim() || "Token";

// Clear all legacy/current auth cookie names to guarantee logout.
const AUTH_COOKIE_NAMES = [
  ...new Set([AUTH_COOKIE_NAME, "jwt_token", "httpOnlyCookie"]),
].filter((name): name is string => Boolean(name && name.trim()));

function clearAuthCookies(response: NextResponse) {
  const secure = process.env.NODE_ENV === "production";

  for (const name of AUTH_COOKIE_NAMES) {
    response.cookies.set({
      name,
      value: "",
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
      expires: new Date(0),
    });
  }
}

function buildLogoutResponse() {
  const response = NextResponse.json({ success: true }, { status: 200 });
  clearAuthCookies(response);
  return response;
}

// Accept POST for standard logout actions from buttons/forms.
export async function POST() {
  return buildLogoutResponse();
}

// Accept DELETE as an optional REST-style logout action.
export async function DELETE() {
  return buildLogoutResponse();
}
