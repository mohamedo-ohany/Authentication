import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

const SUPPORTED_LOCALES = ["en", "ar"] as const;
const DEFAULT_LOCALE = "en" as const;
const LOCALE_COOKIE_NAME = "locale";

type AppLocale = (typeof SUPPORTED_LOCALES)[number];

function isSupportedLocale(locale: string): locale is AppLocale {
  return SUPPORTED_LOCALES.includes(locale as AppLocale);
}

function normalizeLocale(locale?: string | null): AppLocale | undefined {
  if (!locale) {
    return undefined;
  }

  const baseLocale = locale.toLowerCase().split("-")[0];
  return isSupportedLocale(baseLocale) ? baseLocale : undefined;
}

export default getRequestConfig(async ({ requestLocale }) => {
  const cookieStore = await cookies();

  const localeFromCookie = normalizeLocale(
    cookieStore.get(LOCALE_COOKIE_NAME)?.value,
  );

  const localeFromRequest = normalizeLocale(await requestLocale);

  const locale = localeFromCookie ?? localeFromRequest ?? DEFAULT_LOCALE;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
