"use client";

import { Eye, EyeOff } from "lucide-react";

type PasswordVisibilityToggleProps = {
  visible: boolean;
  onToggle: () => void;
  showLabel?: string;
  hideLabel?: string;
  className?: string;
};

export function PasswordVisibilityToggle({
  visible,
  onToggle,
  showLabel = "Show password",
  hideLabel = "Hide password",
  className,
}: PasswordVisibilityToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={
        className ??
        "absolute inset-y-0 right-0 flex w-10 cursor-pointer items-center justify-center rounded-r-md text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      }
      aria-label={visible ? hideLabel : showLabel}
      aria-pressed={visible}
    >
      {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );
}
