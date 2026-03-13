"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { SignupFormSchema, FormData } from "../lib/definitions";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Link from "next/dist/client/link";

export default function SignUpPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(SignupFormSchema),
  });

  const formAction: SubmitHandler<FormData> = async (data) => {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        username: data.username,
      }),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      router.push("/profile");
    } else {
      // field-specific errors (e.g. "Email already exists")
      if (result.fieldErrors) {
        for (const [field, message] of Object.entries(result.fieldErrors)) {
          setError(field as keyof FormData, { message });
        }
      }
      // general error
      if (result.error && !result.fieldErrors) {
        setError("root", { message: result.error });
      }
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-8">
      <form
        className="w-full max-w-sm"
        noValidate
        onSubmit={handleSubmit(formAction)}
      >
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="input-field-username">Username</FieldLabel>
            <Input
              {...register("username")}
              id="input-field-username"
              type="text"
              placeholder="Enter your username"
              className="bg-(--input-bg) border-(--input-border)"
            />
            {errors.username ? (
              <FieldDescription className="text-red-400">
                {errors.username.message}
              </FieldDescription>
            ) : (
              <FieldDescription className="text-muted-foreground">
                Your unique username to login.
              </FieldDescription>
            )}
          </Field>
          <Field>
            <FieldLabel htmlFor="form-email">Email</FieldLabel>
            <Input
              {...register("email")}
              id="form-email"
              type="email"
              placeholder="john@example.com"
              className="bg-(--input-bg) border-(--input-border)"
            />
            {errors.email ? (
              <FieldDescription className="text-red-400">
                {errors.email.message}
              </FieldDescription>
            ) : (
              <FieldDescription className="text-muted-foreground">
                Enter a valid email.
              </FieldDescription>
            )}
          </Field>
          <Field>
            <FieldLabel htmlFor="form-password">Password</FieldLabel>
            <Input
              {...register("password")}
              id="form-password"
              type="password"
              placeholder="Enter your password"
              className="bg-(--input-bg) border-(--input-border)"
            />
          </Field>
          {errors.password && (
            <FieldDescription className="text-red-400">
              {errors.password.message}
            </FieldDescription>
          )}
          <Field>
            <FieldLabel htmlFor="form-password-confirm">
              Confirm Password
            </FieldLabel>
            <Input
              {...register("passwordConfirm")}
              id="form-password-confirm"
              type="password"
              placeholder="Confirm your password"
              className="bg-(--input-bg) border-(--input-border)"
            />
          </Field>
          {errors.passwordConfirm && (
            <FieldDescription className="text-red-400">
              {errors.passwordConfirm.message}
            </FieldDescription>
          )}
          <Field orientation="horizontal">
            <Button
              type="button"
              variant="outline"
              className="bg-(--input-bg) border-(--input-border)"
            >
              <Link href="/">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Loading..." : "Submit"}
            </Button>
          </Field>
        </FieldGroup>
      </form>
      {errors.root?.message && (
        <div className="mt-4 text-red-400 text-center">
          {errors.root.message}
        </div>
      )}
    </main>
  );
}
