import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // /og renders social cards on demand; it has no business in the image index.
      disallow: ['/og'],
    },
    sitemap: absoluteUrl('/sitemap.xml'),
  };
}
