"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { buttonVariants, textmotion } from "@/src/types/animation.types";

const MotionButton = motion.create(Button);

type AuthFormActionsProps = {
  isSubmitting: boolean;
  cancelHref?: string;
  cancelLabel?: string;
  submitLabel?: string;
  submittingLabel?: string;
};

export function AuthFormActions({
  isSubmitting,
  cancelHref = "/",
  cancelLabel = "Cancel",
  submitLabel = "Submit",
  submittingLabel = "Loading...",
}: AuthFormActionsProps) {
  return (
    <Field orientation="horizontal">
      <Button
        variant="outline"
        asChild
        className="bg-(--input-bg) border-(--input-border) text-foreground hover:bg-accent"
      >
        <Link href={cancelHref}>{cancelLabel}</Link>
      </Button>

      <motion.div
        initial={textmotion.initial}
        animate={textmotion.animate}
        transition={textmotion.transition}
      >
        <MotionButton
          whileTap={buttonVariants.whileTap}
          whileHover={buttonVariants.whileHover}
          className="cursor-pointer"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? submittingLabel : submitLabel}
        </MotionButton>
      </motion.div>
    </Field>
  );
}
