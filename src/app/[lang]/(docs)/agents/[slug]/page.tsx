import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getMDXComponents } from '@/mdx-components';
import { Breadcrumb } from '@/components/docs/breadcrumb';
import { DocsToc } from '@/components/docs/docs-toc';
import { KitCta } from '@/components/affiliate/kit-cta';
import { Provenance } from '@/components/docs/provenance';
import { LinkCard } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { JsonLd, breadcrumbSchema, techArticleSchema } from '@/components/seo/json-ld';
import { agents, getAgent } from '@/lib/catalog';
import { getAgentOverride, isPublished } from '@/lib/overrides';
import { buildMetadata } from '@/lib/seo';

interface PageProps {
  params: Promise<{ lang: string; slug: string }>;
}

export function generateStaticParams() {
  return agents.map((agent) => ({ slug: agent.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const agent = getAgent(slug);
  if (!agent) notFound();

  const override = getAgentOverride(slug);

  return buildMetadata({
    title: override?.title ?? `${agent.name} — AgentKit agent`,
    description: override?.description ?? agent.description,
    path: `/agents/${slug}`,
    noindex: !isPublished('agent', slug) || override?.noindex === true,
    keywords: override?.keywords,
  });
}

export default async function AgentPage({ params }: PageProps) {
  const { slug } = await params;
  const agent = getAgent(slug);
  if (!agent) notFound();

  const override = getAgentOverride(slug);
  const others = agents.filter((a) => a.slug !== slug).slice(0, 4);
  const MDX = override?.body;

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Agents', path: '/agents' },
            { name: agent.name, path: `/agents/${slug}` },
          ]),
          techArticleSchema({
            title: override?.title ?? agent.name,
            description: override?.description ?? agent.description,
            path: `/agents/${slug}`,
          }),
        ]}
      />

      <div className="flex gap-12">
        <article className="min-w-0 flex-1">
          <Breadcrumb
            items={[
              { name: 'Agents', href: '/agents' },
              { name: agent.name, href: `/agents/${slug}` },
            ]}
          />

          <header className="mt-4 flex flex-col gap-5 pb-8">
            <h1 className="font-mono text-3xl font-bold tracking-tight text-balance text-foreground sm:text-4xl">
              {override?.title ?? agent.name}
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-pretty text-muted-foreground">
              {override?.description ?? agent.description}
            </p>

            <div className="flex flex-col gap-3">
              <h2 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Tool access ({agent.tools.length})
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {agent.tools.map((tool) => (
                  <Badge key={tool} variant="mono">
                    {tool}
                  </Badge>
                ))}
              </div>
            </div>
          </header>

          {MDX ? (
            <div className="prose-doc">
              <MDX components={getMDXComponents()} />
            </div>
          ) : (
            <div className="prose-doc">
              <p>
                This page is a factual reference for the{' '}
                <code>{agent.name}</code> agent, generated from the AgentKit agent definitions. A
                full write-up — where it sits in the workflow and which skills it pairs with — is
                still being written.
              </p>
            </div>
          )}

          <Provenance kitVersion={override?.kitVersion} updated={override?.updated} />

          <section className="mt-12 flex flex-col gap-5 border-t border-border pt-8">
            <h2 className="font-mono text-lg font-semibold text-foreground">Other agents</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {others.map((item) => (
                <LinkCard
                  key={item.slug}
                  href={`/agents/${item.slug}`}
                  title={item.name}
                  description={item.description}
                  className="[&_h3]:font-mono [&_h3]:text-sm"
                />
              ))}
            </div>
          </section>

          <KitCta className="mt-12" campaign="agent-page" showDisclosure />

          {/* Kit repo is private (purchase-gated) — no public source link. */}
          <footer className="mt-12 border-t border-border pt-6">
            <p className="text-sm text-muted-foreground">
              Reference data from the AgentKit Engineer kit (MIT).
            </p>
          </footer>
        </article>

        {override && <DocsToc items={override.toc} />}
      </div>
    </>
  );
}
