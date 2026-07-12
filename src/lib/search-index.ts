import { source } from '@/lib/source';
import { skills, agents } from '@/lib/catalog';

export type SearchEntryType = 'guide' | 'skill' | 'agent';

export interface SearchEntry {
  id: string;
  type: SearchEntryType;
  title: string;
  description: string;
  href: string;
  /** Extra match surface — keywords, invocation. Not displayed. */
  terms: string;
}

/**
 * One combined index over guides, skills, and agents.
 *
 * A user searching "code review" must find the ck:code-review skill, the
 * code-reviewer agent, AND any guide covering it. An MDX-only index would return
 * one of the three and look broken.
 *
 * Emitted once as a static asset by app/search-index.json/route.ts and fetched
 * lazily the first time the palette opens.
 */
export function buildSearchIndex(): SearchEntry[] {
  const guides: SearchEntry[] = source.getPages().map((page) => ({
    id: `guide:${page.url}`,
    type: 'guide',
    title: page.data.title,
    description: page.data.description ?? '',
    href: page.url,
    terms: (page.data.keywords ?? []).join(' '),
  }));

  const skillEntries: SearchEntry[] = skills.map((skill) => ({
    id: `skill:${skill.slug}`,
    type: 'skill',
    title: skill.invocation,
    description: skill.description,
    href: `/skills/${skill.slug}`,
    // legacyInvocation keeps `/ck:plan` findable for people who learned the old prefix.
    terms: [skill.name, skill.legacyInvocation, skill.category, ...skill.keywords].join(' '),
  }));

  const agentEntries: SearchEntry[] = agents.map((agent) => ({
    id: `agent:${agent.slug}`,
    type: 'agent',
    title: agent.name,
    description: agent.description,
    href: `/agents/${agent.slug}`,
    terms: agent.tools.join(' '),
  }));

  return [...guides, ...skillEntries, ...agentEntries];
}
