import { NextResponse } from "next/server";
import * as z from "zod/v4";

import {
  LoginFormSchema,
  SignupFormSchema,
  type SignupFormData,
  type LoginFormData,
} from "@/app/lib/definitions";

// Base URL for the external auth backend service.
// Falls back to the Render backend URL when env var is missing.
const API_BASE_URL =
  process.env.API_BASE_URL?.trim() || "https://authentication-waad.onrender.com";

type AuthOperation = "login" | "signup";

type AuthRouteParams = {
  operation: string;
};

type OperationConfig = {
  schema: z.ZodTypeAny;
  buildPayload: (data: unknown) => Record<string, string>;
};

type FormFieldKey = keyof SignupFormData | keyof LoginFormData;

const operationConfigs: Record<AuthOperation, OperationConfig> = {
  login: {
    schema: LoginFormSchema,
    buildPayload: (data) => ({
      username_email: (data as LoginFormData).email,
      password: (data as LoginFormData).password,
    }),
  },
  signup: {
    schema: SignupFormSchema,
    buildPayload: (data) => ({
      username: (data as SignupFormData).username,
      email: (data as SignupFormData).email,
      password: (data as SignupFormData).password,
    }),
  },
};

function isAuthOperation(value: string): value is AuthOperation {
  return value === "login" || value === "signup";
}

function firstErrorMessage(value: string[] | string): string {
  if (typeof value === "string") {
    return value.trim();
  }

  const first = value[0];
  return typeof first === "string" ? first.trim() : "";
}

function normalizeFieldKey(
  key: string,
  operation: AuthOperation,
): FormFieldKey | undefined {
  if (operation === "login") {
    if (key === "username" || key === "username_email" || key === "email") {
      return "email";
    }

    if (key === "password") {
      return "password";
    }

    return undefined;
  }

  if (key === "username") {
    return "username";
  }

  if (key === "email") {
    return "email";
  }

  if (key === "password") {
    return "password";
  }

  if (key === "passwordConfirm" || key === "password_confirm") {
    return "passwordConfirm";
  }

  return undefined;
}

// Maps form fields to a single user-facing error message.
type FieldErrors = Partial<Record<FormFieldKey, string>>;

// Backend can send errors as a list or a field-keyed object.
type BackendErrors = string[] | Record<string, string[] | string>;

// Minimal backend response shape used in this route.
type BackendJson = {
  ok: number;
  errors?: BackendErrors;
  message?: string;
  jwt_token?: string;
};

// Converts backend field errors to first-message-per-field shape for the form.
function toFieldErrors(
  errors: BackendErrors | undefined,
  operation: AuthOperation,
): FieldErrors {
  const fieldErrors: FieldErrors = {};

  if (!errors || Array.isArray(errors)) {
    return fieldErrors;
  }

  for (const [key, messages] of Object.entries(errors)) {
    const first = firstErrorMessage(messages);

    if (!first) continue;

    const field = normalizeFieldKey(key, operation);

    if (!field) {
      continue;
    }

    if (!fieldErrors[field]) {
      fieldErrors[field] = first;
    }
  }

  return fieldErrors;
}

function getFallbackErrorMessage(errors?: BackendErrors): string | undefined {
  if (!errors) {
    return undefined;
  }

  if (Array.isArray(errors)) {
    const first = errors[0];
    return typeof first === "string" && first.length > 0 ? first : undefined;
  }

  for (const messages of Object.values(errors)) {
    const first = firstErrorMessage(messages);

    if (first) {
      return first;
    }
  }

  return undefined;
}

// Proxies backend Set-Cookie header so auth/session cookies reach the browser.
function applyBackendCookies(
  response: NextResponse,
  backendResponse: Response,
) {
  const headers = backendResponse.headers as Headers & {
    getSetCookie?: () => string[];
  };

  const setCookieValues = headers.getSetCookie?.();

  if (Array.isArray(setCookieValues) && setCookieValues.length > 0) {
    for (const value of setCookieValues) {
      response.headers.append("set-cookie", value);
    }
    return;
  }

  const setCookieHeader = backendResponse.headers.get("set-cookie");

  if (setCookieHeader) {
    response.headers.append("set-cookie", setCookieHeader);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<AuthRouteParams> },
) {
  const { operation } = await params;

  if (!isAuthOperation(operation)) {
    return NextResponse.json(
      { success: false, error: "Unsupported auth operation" },
      { status: 404 },
    );
  }

  const operationConfig = operationConfigs[operation];

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

  // Validate request body with operation-specific schema before forwarding.
  const parsed = operationConfig.schema.safeParse(body);

  if (!parsed.success) {
    const fieldErrors: FieldErrors = {};

    // Keep only the first error per field to avoid noisy UI state.
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];

      if (typeof field !== "string") {
        continue;
      }

      const normalizedField = normalizeFieldKey(field, operation);

      if (normalizedField && !fieldErrors[normalizedField]) {
        fieldErrors[normalizedField] = issue.message;
      }
    }

    return NextResponse.json(
      { success: false, error: "Validation failed", fieldErrors },
      { status: 422 },
    );
  }

  try {
    // Forward sanitized payload to backend service for the selected operation.
    const backendResponse = await fetch(`${API_BASE_URL}/user/${operation}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(operationConfig.buildPayload(parsed.data)),
      cache: "no-store",
    });

    // Parse backend response into the local typed shape.
    let result: BackendJson;

    try {
      result = (await backendResponse.json()) as BackendJson;
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid response from authentication service",
        },
        {
          status: 502,
        },
      );
    }

    // Convert backend failure shape to a consistent frontend contract.
    if (result.ok !== 1) {
      return NextResponse.json(
        {
          success: false,
          error:
            result.message ||
            getFallbackErrorMessage(result.errors) ||
            "Request failed",
          fieldErrors: toFieldErrors(result.errors, operation),
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
    console.error(`Error during ${operation}:`, error);
    return NextResponse.json(
      { success: false, error: "Network error, please try again" },
      { status: 502 },
    );
  }
}
