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
    // The exact build every count on this site was taken from. Stated publicly on
    // the landing page: it is the cheapest proof we actually installed the thing.
    //
    // Counted from the kit the `ak` CLI actually ships, not the ClaudeKit-era repo
    // we vendored at launch — that one had 88 skills and 13 agents and is now
    // superseded. Re-vendor with:
    //   ak kit init engineer --target claude-code --build-only --out <dir>
    kitVersion: 'v0.2.0', // ak kit list-kits → engineer
    kitCliVersion: 'ak 2.1.0',
    kitCountedAt: '2026-07-13',
  },
  nav: [
    { title: 'Guides', href: '/guides' },
    { title: 'Skills', href: '/skills' },
    { title: 'Agents', href: '/agents' },
  ],
} as const;

export type SiteConfig = typeof siteConfig;
