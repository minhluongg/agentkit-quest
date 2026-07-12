import { defineI18n, type I18nConfig } from 'fumadocs-core/i18n';

/**
 * The site ships English-only today.
 *
 * Adding Vietnamese later is exactly one change: push 'vi' into `languages`.
 * Because `hideLocale` is 'default-locale', English URLs carry no prefix
 * (`/guides/x`) while Vietnamese would live at `/vi/guides/x`. No route file
 * needs to move.
 */
export const i18nConfig = {
  languages: ['en'],
  defaultLanguage: 'en',
  hideLocale: 'default-locale',
} satisfies I18nConfig;

export const i18n = defineI18n(i18nConfig);

export type Locale = (typeof i18nConfig.languages)[number];
