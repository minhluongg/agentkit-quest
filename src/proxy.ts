import { createI18nMiddleware } from 'fumadocs-core/i18n/middleware';
import { i18nConfig } from '@/lib/i18n';

// Next.js 16 renamed `middleware` to `proxy`.
export const proxy = createI18nMiddleware(i18nConfig);

export const config = {
  // Skip static assets, metadata routes, and the OG image route.
  //
  // Anything NOT excluded here gets rewritten to /<defaultLocale><path> by the
  // i18n middleware. `/og` is a top-level route handler with no [lang] segment, so
  // leaving it in scope rewrote it to /en/og — which does not exist. Result: every
  // og:image and twitter:image on the site 404'd, and every social share rendered
  // a blank card.
  matcher: [
    '/((?!api|og|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|llms.txt|search-index.json|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)',
  ],
};
