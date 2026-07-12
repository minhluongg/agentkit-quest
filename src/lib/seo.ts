import type { Metadata } from 'next';
import { siteConfig } from '@/lib/site';

interface BuildMetadataOptions {
  title: string;
  description: string;
  /** Site-relative path, e.g. `/guides/what-is-agentkit`. */
  path: string;
  /** Stub pages must never be indexed — thin auto-generated pages are spam signals. */
  noindex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  keywords?: string[];
}

export function absoluteUrl(path: string): string {
  return new URL(path, siteConfig.url).toString();
}

/**
 * Every page's metadata goes through here. Canonical, OG, and robots are then
 * impossible to forget — which is the only reliable way to get them right on a
 * site that will grow to hundreds of pages.
 */
export function buildMetadata({
  title,
  description,
  path,
  noindex = false,
  publishedTime,
  modifiedTime,
  keywords,
}: BuildMetadataOptions): Metadata {
  const url = absoluteUrl(path);
  const ogImage = absoluteUrl(`/og?title=${encodeURIComponent(title)}`);

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: url,
      // One language today. The plumbing means the VI rollout needs no SEO rework.
      languages: { en: url },
    },
    // `follow: true` even when noindex. A stub page should not enter the index,
    // but it must still pass crawlers through to the pages it links to — several
    // stubs are the only inbound links a published page has. `nofollow` here would
    // strand the published pages behind a wall of dead ends.
    robots: noindex
      ? { index: false, follow: true }
      : { index: true, follow: true, 'max-image-preview': 'large' },
    openGraph: {
      type: publishedTime ? 'article' : 'website',
      url,
      title,
      description,
      siteName: siteConfig.name,
      locale: 'en_US',
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}
