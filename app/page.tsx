import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ModeToggle";
import { LocaleToggle } from "@/components/LocaleToggle";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import * as motion from "motion/react-client";
import {
  textmotion,
  buttonVariants,
  inputItem,
  formContainer,
} from "../src/types/animation.types";

export default function HomePage() {
  const t = useTranslations("HomePage");
  const locale = useLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";
  const controlsPositionClass = locale === "ar" ? "left-8" : "right-8";

  return (
    <motion.main
      dir={dir}
      initial={formContainer.hidden}
      animate={formContainer.show}
      transition={formContainer.show.transition}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-linear-to-b from-background via-background to-muted/25 p-8"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(13,148,136,0.14),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.12),transparent_50%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.22),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.16),transparent_50%)]"
      />

      <div
        className={`absolute ${controlsPositionClass} top-8 flex items-center gap-2`}
      >
        <LocaleToggle />
        <ModeToggle />
      </div>

      <div className="relative z-10 flex w-full max-w-md flex-col items-center space-y-8 rounded-2xl border border-border/70 bg-card/80 p-6 shadow-xl backdrop-blur-sm sm:p-8">
        <div className="text-center space-y-4">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {t("badge")}
          </p>

          <motion.h1
            initial={textmotion.initial}
            animate={textmotion.animate}
            transition={textmotion.transition}
            className="text-5xl font-bold tracking-tight text-foreground drop-shadow-sm"
          >
            {t("title")}
          </motion.h1>
        </div>

        <div className="w-full space-y-4">
          <motion.div
            className="w-full"
            initial={inputItem.hidden}
            animate={inputItem.show}
            transition={inputItem.show.transition}
            whileHover={buttonVariants.whileHover}
            whileTap={buttonVariants.whileTap}
          >
            <Button
              asChild
              size="lg"
              className="w-full h-14 text-lg font-semibold shadow-lg hover:shadow-xl dark:shadow-lg dark:shadow-white/10 dark:hover:shadow-xl dark:hover:shadow-white/15 hover:scale-[1.02] hover:dark:border-foreground/40 transition-all duration-200"
            >
              <Link href="/sign-up" className="w-full">
                {t("signUp")}
              </Link>
            </Button>
          </motion.div>
          <motion.div
            className="w-full"
            initial={inputItem.hidden}
            animate={inputItem.show}
            transition={inputItem.show.transition}
            whileHover={buttonVariants.whileHover}
            whileTap={buttonVariants.whileTap}
          >
            <Button
              asChild
              size="lg"
              className="w-full h-14 text-lg font-semibold shadow-lg hover:shadow-xl dark:shadow-lg dark:shadow-white/10 dark:hover:shadow-xl dark:hover:shadow-white/15 hover:scale-[1.02] hover:dark:border-foreground/40 transition-all duration-200"
            >
              <Link href="/log-in" className="w-full">
                {t("logIn")}
              </Link>
            </Button>
          </motion.div>
        </div>

        <p className="text-sm text-muted-foreground text-center pt-4">
          {t("description")}
        </p>

        <p className="text-xs text-muted-foreground/80 text-center">
          {t("ctaHint")}
        </p>
      </div>
    </motion.main>
  );
}
