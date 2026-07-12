import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { CommandPalette } from '@/components/search/command-palette';
import { ibmPlexSans, jetbrainsMono } from '@/lib/fonts';
import { i18nConfig } from '@/lib/i18n';
import { siteConfig } from '@/lib/site';
import '@/app/globals.css';

export function generateStaticParams() {
  return i18nConfig.languages.map((lang) => ({ lang }));
}

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — The independent AgentKit knowledge base`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export default async function RootLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  return (
    <html
      lang={lang}
      className={`${ibmPlexSans.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="flex min-h-dvh flex-col antialiased">
        <ThemeProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
          {/* Index is fetched from /search-index.json on first open, not shipped
              in this page's payload. */}
          <CommandPalette />
        </ThemeProvider>
      </body>
    </html>
  );
}
