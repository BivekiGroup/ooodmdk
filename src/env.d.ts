/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
/// <reference types="@sanity/astro/module" />

interface ImportMetaEnv {
  readonly PUBLIC_SANITY_PROJECT_ID: string;
  readonly PUBLIC_SANITY_DATASET: string;
  readonly HOST?: string;
  readonly PORT?: string;
  readonly POSTGRES_URL?: string;
  readonly DATABASE_URL?: string;
  readonly POSTGRES_CONNECTION_STRING?: string;
  readonly YANDEX_TRANSLATE_API_KEY?: string;
  readonly YANDEX_FOLDER_ID?: string;
  readonly YANDEX_TRANSLATE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

type Locale = import("./i18n").Locale;

declare namespace App {
  interface Locals {
    host?: string;
    siteOrigin?: string;
    baseLocale?: Locale;
  }
}
