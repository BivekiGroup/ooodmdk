import { defaultLocale, type Locale, normalizeLocale, supportedLocales } from "../i18n";

const domainLocaleMap: Record<string, Locale> = {
  "ooodmdk.ru": "ru",
  "www.ooodmdk.ru": "ru",
  "indprecmet.ae": "en",
  "www.indprecmet.ae": "en",
};

export const primaryDomainByLocale: Partial<Record<Locale, string>> = {
  ru: "ooodmdk.ru",
  en: "indprecmet.ae",
};

export function normalizeHost(host: string | null | undefined): string | null {
  if (!host) {
    return null;
  }

  const lower = host.toLowerCase();
  const [clean] = lower.split(":");
  return clean ?? lower;
}

export function getLocaleForHost(host: string | null | undefined): Locale {
  const normalizedHost = normalizeHost(host);
  if (!normalizedHost) {
    return defaultLocale;
  }

  const mapped = domainLocaleMap[normalizedHost];
  if (mapped) {
    return mapped;
  }

  return defaultLocale;
}

export function ensureValidLocale(value: string | null | undefined, fallback: Locale = defaultLocale): Locale {
  if (!value) {
    return fallback;
  }

  const normalized = normalizeLocale(value);
  return supportedLocales.includes(normalized) ? normalized : fallback;
}
