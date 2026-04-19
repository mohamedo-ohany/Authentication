"use client";

import { FormEventHandler, ReactNode } from "react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";
import { formContainer } from "@/src/types/animation.types";

type AuthFormLayoutProps = {
  children: ReactNode;
  onSubmit: FormEventHandler<HTMLFormElement>;
  rootError?: string;
  title?: string;
  subtitle?: string;
  dir?: "rtl" | "ltr";
  className?: string;
};

// Shared shell for auth forms to keep page files focused on form logic.
export function AuthFormLayout({
  children,
  onSubmit,
  rootError,
  title,
  subtitle,
  dir = "ltr",
  className,
}: AuthFormLayoutProps) {
  return (
    <main
      dir={dir}
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-b from-background via-background to-muted/40 p-6 sm:p-8"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(13,148,136,0.16),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.12),transparent_50%)] dark:bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.22),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.18),transparent_50%)]"
      />

      <motion.form
        initial={formContainer.hidden}
        animate={formContainer.show}
        transition={formContainer.show.transition}
        className={cn(
          "relative z-10 w-full max-w-md rounded-2xl border border-border/70 bg-card/85 p-6 shadow-xl backdrop-blur-sm sm:p-8",
          className,
        )}
        noValidate
        onSubmit={onSubmit}
      >
        {title ? (
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
        ) : null}

        {subtitle ? (
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
        ) : null}

        <div className="mt-6">{children}</div>

        {rootError ? (
          <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-500">
            {rootError}
          </div>
        ) : null}
      </motion.form>
    </main>
  );
}
