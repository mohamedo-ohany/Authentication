import LogOutButton from "@/components/ui/LogOutButton";
import * as motion from "motion/react-client";
import { useLocale, useTranslations } from "next-intl";

import { textmotion } from "../../src/types/animation.types";

export default function ProfilePage() {
  const t = useTranslations("Auth.Profile");
  const locale = useLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <main
      dir={dir}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-linear-to-b from-background via-background to-muted/30 p-8"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(13,148,136,0.14),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.12),transparent_48%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.2),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.14),transparent_48%)]"
      />

      <motion.h1
        initial={textmotion.initial}
        animate={textmotion.animate}
        transition={textmotion.transition}
        className="relative z-10 text-center text-4xl font-bold tracking-tight text-foreground drop-shadow-sm sm:text-5xl"
      >
        {t("title")}
      </motion.h1>

      <motion.p
        initial={textmotion.initial}
        animate={textmotion.animate}
        transition={{ ...textmotion.transition, delay: 0.3 }}
        className="relative z-10 mt-3 max-w-xl text-center text-sm text-muted-foreground sm:text-base"
      >
        {t("subtitle")}
      </motion.p>

      <LogOutButton className="mt-8" />
    </main>
  );
}
