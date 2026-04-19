"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocale, useTranslations } from "next-intl";

import { SignupFormSchema, SignupFormData } from "../lib/definitions";
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

export default function SignUpPage() {
  // Local UI state keeps visibility toggles independent between both inputs.
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const t = useTranslations("Auth.Signup");
  const commonT = useTranslations("Auth.Common");
  const locale = useLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, submitCount },
  } = useForm<SignupFormData>({
    resolver: createZodFormResolver<SignupFormData>(SignupFormSchema),
  });

  const formAction = useAuthFormSubmit<SignupFormData>({
    endpoint: "/api/auth/signup",
    setError,
    buildBody: (data) => ({
      email: data.email,
      password: data.password,
      username: data.username,
    }),
    messages: {
      networkError: commonT("networkError"),
      unknownError: commonT("unknownError"),
    },
  });

  return (
    <AuthFormLayout
      onSubmit={handleSubmit(formAction)}
      rootError={errors.root?.message}
      title={t("title")}
      subtitle={t("subtitle")}
      dir={dir}
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="input-field-username">
            {t("usernameLabel")}
          </FieldLabel>
          <AnimatedFieldWrapper
            fieldKey="username"
            hasError={Boolean(errors.username)}
            submitCount={submitCount}
          >
            <Input
              {...register("username")}
              id="input-field-username"
              type="text"
              placeholder={t("usernamePlaceholder")}
              className={INPUT_CLASS}
            />
          </AnimatedFieldWrapper>

          {errors.username ? (
            <FieldDescription className="text-red-400">
              {errors.username.message}
            </FieldDescription>
          ) : (
            <FieldDescription className="text-muted-foreground">
              {t("usernameHint")}
            </FieldDescription>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="form-email">{t("emailLabel")}</FieldLabel>
          <AnimatedFieldWrapper
            fieldKey="email"
            hasError={Boolean(errors.email)}
            submitCount={submitCount}
          >
            <Input
              {...register("email")}
              id="form-email"
              type="email"
              placeholder={t("emailPlaceholder")}
              className={INPUT_CLASS}
            />
          </AnimatedFieldWrapper>

          {errors.email ? (
            <FieldDescription className="text-red-400">
              {errors.email.message}
            </FieldDescription>
          ) : (
            <FieldDescription className="text-muted-foreground">
              {t("emailHint")}
            </FieldDescription>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="form-password">{t("passwordLabel")}</FieldLabel>
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
              placeholder={t("passwordPlaceholder")}
              className={PASSWORD_INPUT_CLASS}
            />
            <PasswordVisibilityToggle
              visible={showPassword}
              onToggle={() => setShowPassword((current) => !current)}
              showLabel={t("showPassword")}
              hideLabel={t("hidePassword")}
            />
          </AnimatedFieldWrapper>
        </Field>

        {errors.password ? (
          <FieldDescription className="text-red-400">
            {errors.password.message}
          </FieldDescription>
        ) : null}

        <Field>
          <FieldLabel htmlFor="form-password-confirm">
            {t("passwordConfirmLabel")}
          </FieldLabel>
          <AnimatedFieldWrapper
            fieldKey="passwordConfirm"
            hasError={Boolean(errors.passwordConfirm)}
            submitCount={submitCount}
            className="relative"
          >
            <Input
              {...register("passwordConfirm")}
              id="form-password-confirm"
              type={showPasswordConfirm ? "text" : "password"}
              placeholder={t("passwordConfirmPlaceholder")}
              className={PASSWORD_INPUT_CLASS}
            />
            <PasswordVisibilityToggle
              visible={showPasswordConfirm}
              onToggle={() => setShowPasswordConfirm((current) => !current)}
              showLabel={t("showPasswordConfirm")}
              hideLabel={t("hidePasswordConfirm")}
            />
          </AnimatedFieldWrapper>
        </Field>

        {errors.passwordConfirm ? (
          <FieldDescription className="text-red-400">
            {errors.passwordConfirm.message}
          </FieldDescription>
        ) : null}

        <AuthFormActions
          isSubmitting={isSubmitting}
          cancelLabel={commonT("cancel")}
          submitLabel={t("submit")}
          submittingLabel={commonT("loading")}
        />
      </FieldGroup>
    </AuthFormLayout>
  );
}
