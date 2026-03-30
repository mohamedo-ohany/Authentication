"use client";

import { useRouter } from "next/navigation";
import {
  FieldValues,
  Path,
  SubmitHandler,
  UseFormSetError,
} from "react-hook-form";

type ApiErrorResponse<T extends FieldValues> = {
  success?: boolean;
  error?: string;
  fieldErrors?: Partial<Record<Path<T>, string>>;
};

type UseAuthFormSubmitParams<T extends FieldValues> = {
  endpoint: string;
  setError: UseFormSetError<T>;
  buildBody: (data: T) => unknown;
  successPath?: string;
};

export function useAuthFormSubmit<T extends FieldValues>({
  endpoint,
  setError,
  buildBody,
  successPath = "/profile",
}: UseAuthFormSubmitParams<T>): SubmitHandler<T> {
  const router = useRouter();

  return async (data) => {
    let response: Response;
    let result: ApiErrorResponse<T> | undefined;

    // Send the auth form payload to the provided endpoint.
    try {
      response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildBody(data)),
      });
    } catch {
      setError("root" as Path<T>, {
        message: "Network error, please try again",
      });
      return;
    }

    try {
      result = (await response.json()) as ApiErrorResponse<T>;
    } catch {
      result = undefined;
    }

    // On successful auth, redirect the user to the target page.
    if (response.ok && result?.success) {
      router.push(successPath);
      return;
    }

    // Map API field-level errors to react-hook-form errors.
    if (result?.fieldErrors) {
      for (const [field, message] of Object.entries(result.fieldErrors)) {
        if (typeof message === "string") {
          setError(field as Path<T>, { message });
        }
      }
    }

    // Fallback for non-field backend errors (e.g., invalid credentials).
    if (result?.error) {
      setError("root" as Path<T>, { message: result.error });
      return;
    }

    setError("root" as Path<T>, {
      message: "Something went wrong, please try again",
    });
  };
}
