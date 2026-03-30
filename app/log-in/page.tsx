"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

import { LoginFormData, LoginFormSchema } from "../lib/definitions";
import { useAuthFormSubmit } from "../lib/useAuthFormSubmit";
import { createZodFormResolver } from "../lib/zodFormResolver";

import { AnimatedFieldWrapper } from "@/components/auth/AnimatedFieldWrapper";
import { AuthFormActions } from "@/components/auth/AuthFormActions";
import { AuthFormLayout } from "@/components/auth/AuthFormLayout";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordVisibilityToggle } from "@/components/ui/password-visibility-toggle";

const INPUT_CLASS = "bg-(--input-bg) border-(--input-border)";
const PASSWORD_INPUT_CLASS = `${INPUT_CLASS} pr-10`;

export default function LogInPage() {
  // Keep password visibility state local to this form only.
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, submitCount },
  } = useForm<LoginFormData>({
    resolver: createZodFormResolver<LoginFormData>(LoginFormSchema),
  });

  const formAction = useAuthFormSubmit<LoginFormData>({
    endpoint: "/api/auth/login",
    setError,
    buildBody: (data) => ({
      email: data.email,
      password: data.password,
    }),
  });

  return (
    <AuthFormLayout
      onSubmit={handleSubmit(formAction)}
      rootError={errors.root?.message}
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="form-email">Email or Username</FieldLabel>
          <AnimatedFieldWrapper
            fieldKey="email"
            hasError={Boolean(errors.email)}
            submitCount={submitCount}
          >
            <Input
              {...register("email")}
              id="form-email"
              type="text"
              autoComplete="username"
              placeholder="Email or username"
              className={INPUT_CLASS}
            />
          </AnimatedFieldWrapper>

          {errors.email ? (
            <FieldDescription className="text-red-400">
              {errors.email.message}
            </FieldDescription>
          ) : (
            <FieldDescription className="text-muted-foreground">
              Enter your email address or username.
            </FieldDescription>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="form-password">Password</FieldLabel>
          <AnimatedFieldWrapper
            fieldKey="password"
            hasError={Boolean(errors.password)}
            submitCount={submitCount}
            className="relative"
          >
            <Input
              {...register("password")}
              id="form-password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className={PASSWORD_INPUT_CLASS}
            />
            <PasswordVisibilityToggle
              visible={showPassword}
              onToggle={() => setShowPassword((current) => !current)}
            />
          </AnimatedFieldWrapper>
        </Field>

        {errors.password ? (
          <FieldDescription className="text-red-400">
            {errors.password.message}
          </FieldDescription>
        ) : null}

        <AuthFormActions isSubmitting={isSubmitting} />
      </FieldGroup>
    </AuthFormLayout>
  );
}
