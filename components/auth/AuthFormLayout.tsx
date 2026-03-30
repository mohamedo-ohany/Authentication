"use client";

import { FormEventHandler, ReactNode } from "react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";
import { formContainer } from "@/src/types/animation.types";

type AuthFormLayoutProps = {
  children: ReactNode;
  onSubmit: FormEventHandler<HTMLFormElement>;
  rootError?: string;
  className?: string;
};

// Shared shell for auth forms to keep page files focused on form logic.
export function AuthFormLayout({
  children,
  onSubmit,
  rootError,
  className,
}: AuthFormLayoutProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-8">
      <motion.form
        initial={formContainer.hidden}
        animate={formContainer.show}
        transition={formContainer.show.transition}
        className={cn("w-full max-w-sm", className)}
        noValidate
        onSubmit={onSubmit}
      >
        {children}
      </motion.form>

      {rootError ? (
        <div className="mt-4 text-center text-red-400">{rootError}</div>
      ) : null}
    </main>
  );
}
