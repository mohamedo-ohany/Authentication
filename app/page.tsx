import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ModeToggle";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function HomePage() {
  const t = useTranslations("HomePage");
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-linear-to-b from-background to-muted/20 p-8">
      <div className="absolute right-8 top-8">
        <ModeToggle />
      </div>
      <div className="flex w-full max-w-md flex-col items-center space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold tracking-tight text-foreground drop-shadow-sm">
            {t("title")}
          </h1>
        </div>
        <div className="w-full space-y-4">
          <Link href="/sign-up" className="block w-full">
            <Button
              size="lg"
              className="w-full h-14 text-lg font-semibold shadow-lg hover:shadow-xl dark:shadow-lg dark:shadow-white/10 dark:hover:shadow-xl dark:hover:shadow-white/15 hover:scale-[1.02] hover:dark:border-foreground/40 transition-all duration-200"
            >
              {t("signUp")}
            </Button>
          </Link>
          <Link href="/log-in" className="block w-full">
            <Button
              size="lg"
              className="w-full h-14 text-lg font-semibold shadow-lg hover:shadow-xl dark:shadow-lg dark:shadow-white/10 dark:hover:shadow-xl dark:hover:shadow-white/15 hover:scale-[1.02] hover:dark:border-foreground/40 transition-all duration-200"
            >
              {t("log-in")}
            </Button>
          </Link>
        </div>

        <p className="text-sm text-muted-foreground text-center pt-4">
          {t("description")}
        </p>
      </div>
    </main>
  );
}
