import { locales } from "./locales";

export const defaultLocale = "ru" as const;
export type Locale = keyof typeof locales;
export const supportedLocales = Object.keys(locales) as Locale[];

export interface LocaleOption {
  value: Locale;
  label: string;
  nativeLabel: string;
}

export const localeOptions: LocaleOption[] = supportedLocales.map((value) => ({
  value,
  label: locales[value].option.label,
  nativeLabel: locales[value].option.nativeLabel,
}));

const fallbackLocale: Locale = defaultLocale;

export function getTranslations(locale: Locale) {
  return locales[locale] ?? locales[fallbackLocale];
}

export function getLocaleFromUrl(pathname: string, baseLocale: Locale = defaultLocale): Locale {
  const segments = pathname.split("/").filter(Boolean);
  const candidate = segments[0];
  if (candidate && supportedLocales.includes(candidate as Locale)) {
    return candidate as Locale;
  }
  return baseLocale;
}

export function isRtl(locale: Locale) {
  return locale === "ar";
}

export function translate(locale: Locale, key: string): string {
  const dictionary = getTranslations(locale);
  const parts = key.split(".");
  let current: any = dictionary;

  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = current[part];
    } else {
      const fallback = getTranslations(fallbackLocale);
      current = parts.reduce((acc: any, curr) => (acc ? acc[curr] : undefined), fallback as any);
      break;
    }
  }

  if (Array.isArray(current)) {
    return current.join(" ");
  }

  return typeof current === "string" ? current : "";
}

export function buildLocalizedLink(href: string, locale: Locale, baseLocale: Locale = defaultLocale) {
  if (href.startsWith("http")) {
    return href;
  }

  const normalizedHref = href.startsWith("/") ? href : `/${href}`;
  if (locale === baseLocale) {
    return normalizedHref;
  }

  if (normalizedHref === "/") {
    return `/${locale}`;
  }

  return `/${locale}${normalizedHref}`;
}

export function getOppositeLocale(locale: Locale): Locale {
  return locale === "ar" ? "ru" : "ar";
}

export function stripLocaleFromPath(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length && supportedLocales.includes(segments[0] as Locale)) {
    segments.shift();
  }

  return segments.length ? `/${segments.join("/")}` : "/";
}

export function normalizeLocale(value: unknown): Locale {
  if (typeof value === "string" && supportedLocales.includes(value as Locale)) {
    return value as Locale;
  }
  return defaultLocale;
}
