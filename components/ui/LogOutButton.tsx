"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/src/types/animation.types";

type LogOutButtonProps = {
  className?: string;
};
const MotionButton = motion.create(Button);
export default function LogOutButton({ className }: LogOutButtonProps) {
  const router = useRouter();

  const handleLogOut = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      router.replace("/");
      router.refresh();
    }
  };

  return (
    <MotionButton
      whileHover={buttonVariants.whileHover}
      whileTap={buttonVariants.whileTap}
      onClick={handleLogOut}
      type="button"
      variant="destructive"
      className={cn(
        "cursor-pointer border border-red-600 bg-red-600 text-white shadow-sm transition-all hover:bg-red-700 hover:shadow-md active:scale-[0.98] dark:border-red-500 dark:bg-red-500 dark:hover:bg-red-600",
        className,
      )}
    >
      Log Out
    </MotionButton>
  );
}
