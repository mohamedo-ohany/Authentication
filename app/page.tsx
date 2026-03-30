import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ModeToggle";
import { LocaleToggle } from "@/components/LocaleToggle";
import Link from "next/link";
import { useTranslations } from "next-intl";
import * as motion from "motion/react-client";
import {
  textmotion,
  buttonVariants,
  inputItem,
  formContainer,
} from "../src/types/animation.types";

export default function HomePage() {
  const t = useTranslations("HomePage");
  return (
    <motion.main
      initial={formContainer.hidden}
      animate={formContainer.show}
      transition={formContainer.show.transition}
      className="relative flex min-h-screen flex-col items-center justify-center bg-linear-to-b from-background to-muted/20 p-8"
    >
      <div className="absolute right-8 top-8 flex items-center gap-2">
        <LocaleToggle />
        <ModeToggle />
      </div>
      <div className="flex w-full max-w-md flex-col items-center space-y-8">
        <div className="text-center space-y-4">
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
                {t("sign-up")}
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
                {t("log-in")}
              </Link>
            </Button>
          </motion.div>
        </div>

        <p className="text-sm text-muted-foreground text-center pt-4">
          {t("description")}
        </p>
      </div>
    </motion.main>
  );
}
