"use client";

import { Languages } from "lucide-react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LOCALE_COOKIE_NAME = "locale";
type AppLocale = "en" | "ar";

function toSupportedLocale(locale: string): AppLocale {
  return locale === "ar" ? "ar" : "en";
}

export function LocaleToggle() {
  const router = useRouter();
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();
  const [activeLocale, setActiveLocale] = useState<AppLocale>(
    toSupportedLocale(locale),
  );

  useEffect(() => {
    setActiveLocale(toSupportedLocale(locale));
  }, [locale]);

  const handleLocaleChange = (nextLocale: AppLocale) => {
    if (nextLocale === activeLocale) {
      return;
    }

    // Keep UI responsive immediately while server translations are refreshed.
    setActiveLocale(nextLocale);
    document.cookie = `${LOCALE_COOKIE_NAME}=${nextLocale}; Path=/; Max-Age=31536000; SameSite=Lax`;

    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" disabled={isPending}>
          <Languages className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => handleLocaleChange("en")}
          disabled={activeLocale === "en"}
        >
          English
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleLocaleChange("ar")}
          disabled={activeLocale === "ar"}
        >
          العربية
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
