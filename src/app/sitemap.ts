import type { MetadataRoute } from 'next';
import { source } from '@/lib/source';
import { skills, agents } from '@/lib/catalog';
import { isPublished } from '@/lib/overrides';
import { absoluteUrl } from '@/lib/seo';

/**
 * Only indexable URLs belong here.
 *
 * Listing a noindex page in the sitemap sends Google two contradictory signals
 * ("crawl this" / "don't index this") and wastes crawl budget on a young domain.
 * So the stub reference pages are deliberately excluded until they have content.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: absoluteUrl('/guides'), lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: absoluteUrl('/skills'), lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: absoluteUrl('/agents'), lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
  ];

  const guides: MetadataRoute.Sitemap = source
    .getPages()
    .filter((page) => !page.data.noindex)
    .map((page) => ({
      url: absoluteUrl(page.url),
      lastModified: new Date(page.data.updated),
      changeFrequency: 'monthly',
      priority: 0.8,
    }));

  const skillPages: MetadataRoute.Sitemap = skills
    .filter((skill) => isPublished('skill', skill.slug))
    .map((skill) => ({
      url: absoluteUrl(`/skills/${skill.slug}`),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    }));

  const agentPages: MetadataRoute.Sitemap = agents
    .filter((agent) => isPublished('agent', agent.slug))
    .map((agent) => ({
      url: absoluteUrl(`/agents/${agent.slug}`),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    }));

  return [...staticRoutes, ...guides, ...skillPages, ...agentPages];
}
