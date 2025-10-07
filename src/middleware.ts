import type { MiddlewareHandler } from "astro";
import { defaultLocale } from "./i18n";
import { getLocaleForHost, normalizeHost } from "./config/localization";

export const onRequest: MiddlewareHandler = async ({ locals, request }, next) => {
  const url = new URL(request.url);
  const headerHost = request.headers.get("host") ?? url.host;
  const normalizedHost = normalizeHost(headerHost) ?? url.hostname;
  const baseLocale = getLocaleForHost(normalizedHost) ?? defaultLocale;

  locals.baseLocale = baseLocale;
  locals.host = normalizedHost;
  locals.siteOrigin = `${url.protocol}//${url.host}`;

  return next();
};
