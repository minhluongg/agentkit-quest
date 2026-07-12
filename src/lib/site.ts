import skills from '@/data/skills.generated.json';
import agents from '@/data/agents.generated.json';

export const siteConfig = {
  name: 'AgentKit Quest',
  shortName: 'AgentKit Quest',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://agentkit.quest',
  // Counts are derived, never typed by hand — a stale number here would end up in
  // every meta description, the OG card, and llms.txt at once.
  description: `An independent knowledge base for AgentKit — ${skills.length} skills, ${agents.length} agents, and the workflows that make AI coding agents actually ship.`,
  // The upstream product we document and refer to.
  upstream: {
    name: 'AgentKit',
    url: 'https://agentkit.best',
    // No `repo` field: the kit's source repo is private (purchase-gated), so
    // linking to it would 404 for visitors.
    docs: 'https://docs.claudekit.cc',
    formerName: 'ClaudeKit',
  },
  nav: [
    { title: 'Guides', href: '/guides' },
    { title: 'Skills', href: '/skills' },
    { title: 'Agents', href: '/agents' },
  ],
} as const;

export type SiteConfig = typeof siteConfig;
