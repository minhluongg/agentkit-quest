import { skillOverrides, agentOverrides } from 'collections/server';

type Override = (typeof skillOverrides)[number];

/** `plan.mdx` → `plan`. Matches the slug produced by scripts/build-catalog.ts. */
function slugOf(entry: Override): string {
  return entry.info.path.replace(/\.mdx$/, '');
}

const skillMap = new Map(skillOverrides.map((entry) => [slugOf(entry), entry]));
const agentMap = new Map(agentOverrides.map((entry) => [slugOf(entry), entry]));

export function getSkillOverride(slug: string) {
  return skillMap.get(slug);
}

export function getAgentOverride(slug: string) {
  return agentMap.get(slug);
}

/**
 * A reference page is only indexable once someone has written real content for it.
 *
 * Without this gate we would ship 88 auto-generated skill pages and 13 agent pages
 * whose only content is a paraphrase of upstream metadata. Google classifies that
 * as scaled content abuse, and the penalty lands on the whole domain — not just the
 * thin pages. So: stubs exist (the routes are real, the data is accurate, users can
 * land on them from search of the exact skill name) but they carry `noindex` until
 * a content plan gives them substance.
 */
/**
 * "Published" = has an override AND is not opted out via `noindex`. The sitemap and
 * the page's robots directive both key off this, so a `noindex: true` override
 * pulls a page from the index without deleting the file — the kill-rule mechanism.
 */
export function isPublished(kind: 'skill' | 'agent', slug: string): boolean {
  const entry = kind === 'skill' ? skillMap.get(slug) : agentMap.get(slug);
  return entry !== undefined && entry.noindex !== true;
}

export function publishedSkillSlugs(): string[] {
  return [...skillMap.entries()].filter(([, e]) => e.noindex !== true).map(([slug]) => slug);
}

export function publishedAgentSlugs(): string[] {
  return [...agentMap.entries()].filter(([, e]) => e.noindex !== true).map(([slug]) => slug);
}
