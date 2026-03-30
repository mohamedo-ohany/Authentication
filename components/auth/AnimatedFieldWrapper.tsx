"use client";

import { ReactNode } from "react";
import { motion } from "motion/react";

import { inputItem, shakeError } from "@/src/types/animation.types";

type AnimatedFieldWrapperProps = {
  fieldKey: string;
  hasError: boolean;
  submitCount: number;
  className?: string;
  children: ReactNode;
};

export function AnimatedFieldWrapper({
  fieldKey,
  hasError,
  submitCount,
  className,
  children,
}: AnimatedFieldWrapperProps) {
  // Re-keying by submit count and error state ensures shake replays only when needed.
  const animationKey = `${fieldKey}-${submitCount}-${hasError ? "error" : "ok"}`;

  return (
    <motion.div
      className={className}
      initial={inputItem.hidden}
      animate={inputItem.show}
    >
      <motion.div
        key={animationKey}
        animate={hasError ? "shake" : "idle"}
        variants={shakeError}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
