import { NextResponse } from "next/server";

import { SignupFormSchema, type FormData } from "@/app/lib/definitions";

// Base URL for the external auth backend service.
const API_BASE_URL = process.env.API_BASE_URL;

// Maps form fields to a single user-facing error message.
type FieldErrors = Partial<Record<keyof FormData, string>>;

// Backend can return errors as an array, a keyed object, or nothing.
type BackendErrors = string[] | Record<string, string[] | string> | undefined;

// Minimal backend response shape used in this route.
type BackendJson = {
  ok: number;
  errors?: BackendErrors;
  message?: string;
};

// Normalizes backend error formats into predictable field-level errors.
function toFieldErrors(errors: BackendErrors): FieldErrors {
  const fieldErrors: FieldErrors = {};

  // Fallback mapper when backend returns generic text messages.
  const setByMessage = (message: string) => {
    const m = message.toLowerCase();

    if (m.includes("email") && !fieldErrors.email) {
      fieldErrors.email = message;
    } else if (m.includes("username") && !fieldErrors.username) {
      fieldErrors.username = message;
    } else if (m.includes("password") && !fieldErrors.password) {
      fieldErrors.password = message;
    }
  };

  if (Array.isArray(errors)) {
    for (const msg of errors) setByMessage(msg);
    return fieldErrors;
  }

  // Handles structured errors like { email: ["..."] }.
  if (errors && typeof errors === "object") {
    for (const [key, value] of Object.entries(errors)) {
      const first =
        typeof value === "string"
          ? value
          : Array.isArray(value) && value.length > 0
            ? String(value[0])
            : "";

      if (!first) continue;

      if (key === "email" && !fieldErrors.email) {
        fieldErrors.email = first;
      } else if (key === "username" && !fieldErrors.username) {
        fieldErrors.username = first;
      } else if (key === "password" && !fieldErrors.password) {
        fieldErrors.password = first;
      } else {
        setByMessage(first);
      }
    }
  }

  return fieldErrors;
}

// Proxies backend Set-Cookie header so auth/session cookies reach the browser.
function applyBackendCookies(
  response: NextResponse,
  backendResponse: Response,
) {
  const setCookieHeader = backendResponse.headers.get("set-cookie");

  if (setCookieHeader) {
    response.headers.set("set-cookie", setCookieHeader);
  }
}

export async function POST(request: Request) {
  // Fail fast if backend URL is missing from environment.
  if (!API_BASE_URL) {
    return NextResponse.json(
      { success: false, error: "API is not configured" },
      { status: 500 },
    );
  }

  let body: unknown;

  // Guard against malformed JSON payloads.
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  // Validate request body with Zod schema before forwarding to backend.
  const parsed = SignupFormSchema.safeParse(body);

  if (!parsed.success) {
    const fieldErrors: FieldErrors = {};

    // Keep only the first error per field to avoid noisy UI state.
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as keyof FormData;
      if (!fieldErrors[field]) fieldErrors[field] = issue.message;
    }

    return NextResponse.json(
      { success: false, error: "Validation failed", fieldErrors },
      { status: 422 },
    );
  }

  try {
    // Forward sanitized signup payload to backend service.
    const backendResponse = await fetch(`${API_BASE_URL}/user/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: parsed.data.username,
        email: parsed.data.email,
        password: parsed.data.password,
      }),
      cache: "no-store",
    });

    // Parse backend response into the local typed shape.
    const result: BackendJson = await backendResponse.json();

    // Convert backend failure shape to a consistent frontend contract.
    if (result.ok !== 1) {
      return NextResponse.json(
        {
          success: false,
          error: result.message || "Sign-up failed",
          fieldErrors: toFieldErrors(result.errors),
        },
        {
          status: backendResponse.status >= 400 ? backendResponse.status : 422,
        },
      );
    }

    // On success, return OK and forward backend cookies if present.
    const response = NextResponse.json({ success: true }, { status: 200 });
    applyBackendCookies(response, backendResponse);

    return response;
  } catch (error) {
    // Network/runtime fallback when backend is unreachable or invalid.
    console.error("Error during sign-up:", error);
    return NextResponse.json(
      { success: false, error: "Network error, please try again" },
      { status: 502 },
    );
  }
}
