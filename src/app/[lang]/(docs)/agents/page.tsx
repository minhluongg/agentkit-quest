import type { Metadata } from 'next';
import { PageHeader } from '@/components/common/page-header';
import { LinkCard } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { JsonLd, breadcrumbSchema, itemListSchema } from '@/components/seo/json-ld';
import { agents } from '@/lib/catalog';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: `The ${agents.length} AgentKit Agents`,
  description: `AgentKit ships ${agents.length} specialized agents — planner, researcher, code reviewer, debugger, tester, and more. What each one does and how they hand work to each other.`,
  path: '/agents',
  keywords: ['agentkit agents', 'claude code subagents', 'agent orchestration'],
});

export default function AgentsPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Agents', path: '/agents' },
          ]),
          itemListSchema(agents.map((a) => ({ name: a.name, path: `/agents/${a.slug}` }))),
        ]}
      />

      <PageHeader
        title="Agents"
        description={`${agents.length} specialized agents that plan, research, build, review, and ship — each with its own tool access and its own place in the workflow.`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => (
          <LinkCard
            key={agent.slug}
            href={`/agents/${agent.slug}`}
            title={agent.name}
            description={agent.description}
            className="[&_h3]:font-mono"
            footer={<Badge variant="outline">{agent.tools.length} tools</Badge>}
          />
        ))}
      </div>
    </>
  );
}
