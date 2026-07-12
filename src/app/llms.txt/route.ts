import { source } from '@/lib/source';
import { skills, agents } from '@/lib/catalog';
import { siteConfig } from '@/lib/site';
import { absoluteUrl } from '@/lib/seo';

export const dynamic = 'force-static';

/**
 * llmstxt.org index.
 *
 * AI coding agents are a real discovery channel — especially for a site that is
 * *about* AI coding tools. Cheap to emit, and the audience is exactly ours.
 */
export function GET() {
  const guides = source.getPages();

  const body = [
    `# ${siteConfig.name}`,
    '',
    `> ${siteConfig.description}`,
    '',
    `AgentKit was formerly called ClaudeKit. The CLI moved from \`ck\` to \`ak\`.`,
    '',
    '## Guides',
    '',
    ...guides.map((page) => `- [${page.data.title}](${absoluteUrl(page.url)}): ${page.data.description}`),
    '',
    `## Skills (${skills.length})`,
    '',
    ...skills.map((skill) => `- [${skill.invocation}](${absoluteUrl(`/skills/${skill.slug}`)}): ${skill.description}`),
    '',
    `## Agents (${agents.length})`,
    '',
    ...agents.map((agent) => `- [${agent.name}](${absoluteUrl(`/agents/${agent.slug}`)}): ${agent.description}`),
    '',
  ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
