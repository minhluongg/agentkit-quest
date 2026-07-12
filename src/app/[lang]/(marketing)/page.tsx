import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Bot, Terminal } from 'lucide-react';
import type { Metadata } from 'next';
import { AffiliateLink } from '@/components/affiliate/affiliate-link';
import { SearchTrigger } from '@/components/search/search-trigger';
import { LinkCard } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { JsonLd, websiteSchema, organizationSchema } from '@/components/seo/json-ld';
import { skills, agents, categories } from '@/lib/catalog';
import { source } from '@/lib/source';
import { siteConfig } from '@/lib/site';
import { buildMetadata } from '@/lib/seo';
import { ENGINEER_PATH } from '@/lib/affiliate';
import { cn } from '@/lib/utils';

export const metadata: Metadata = buildMetadata({
  title: `${siteConfig.name} — The independent AgentKit knowledge base`,
  description: siteConfig.description,
  path: '/',
});

export default function HomePage() {
  const featured = source.getPages().slice(0, 6);

  return (
    <>
      <JsonLd data={[websiteSchema(), organizationSchema()]} />

      {/* Hero — search-led. The search box IS the pitch: it demonstrates the
          depth of the knowledge base instead of promising it. */}
      <section className="border-b border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 py-20 text-center sm:px-6 lg:py-28">
          <Badge variant="outline" className="gap-1.5 py-1">
            <span className="size-1.5 rounded-full bg-success" aria-hidden="true" />
            ClaudeKit is now AgentKit
          </Badge>

          <div className="flex max-w-3xl flex-col gap-5">
            <h1 className="font-mono text-4xl leading-tight font-bold tracking-tight text-balance text-foreground sm:text-5xl lg:text-6xl">
              Every AgentKit skill, agent, and workflow — documented.
            </h1>
            <p className="text-lg leading-relaxed text-pretty text-muted-foreground">
              {skills.length} skills. {agents.length} agents. Real guides written against a real
              install. Search it all.
            </p>
          </div>

          <div className="w-full max-w-xl">
            <SearchTrigger size="lg" className="max-w-none" />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/guides" className={cn(buttonVariants({ variant: 'primary', size: 'md' }))}>
              Browse guides
              <ArrowRight aria-hidden="true" />
            </Link>
            <AffiliateLink
              campaign="hero"
              className={cn(buttonVariants({ variant: 'outline', size: 'md' }), 'no-underline')}
            >
              Get AgentKit
              <ArrowUpRight aria-hidden="true" />
            </AffiliateLink>
          </div>
        </div>
      </section>

      {/* Category grid — communicates depth immediately. */}
      <section className="border-b border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-16 sm:px-6">
          <div className="flex flex-col gap-2">
            <h2 className="font-mono text-2xl font-semibold text-foreground">
              Skills by category
            </h2>
            <p className="text-muted-foreground">
              {skills.length} skills across {categories.length} categories.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((category) => (
              <LinkCard
                key={category.id}
                href={`/skills?category=${category.id}`}
                title={category.label}
                footer={
                  <Badge variant="mono">
                    {category.count} skill{category.count === 1 ? '' : 's'}
                  </Badge>
                }
              />
            ))}
          </div>

          <Link
            href="/skills"
            className="flex cursor-pointer items-center gap-1.5 self-start text-sm font-medium text-primary transition-colors duration-200 hover:text-accent-foreground"
          >
            View the full catalog
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* Featured guides */}
      <section className="border-b border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-16 sm:px-6">
          <h2 className="font-mono text-2xl font-semibold text-foreground">Start here</h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((page) => (
              <LinkCard
                key={page.url}
                href={page.url}
                title={page.data.title}
                description={page.data.description}
                footer={
                  <>
                    <Badge>{page.data.category}</Badge>
                    <Badge variant="outline">{page.data.difficulty}</Badge>
                  </>
                }
              />
            ))}
          </div>
        </div>
      </section>

      {/* Agents strip */}
      <section className="border-b border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-16 sm:px-6">
          <div className="flex flex-col gap-2">
            <h2 className="font-mono text-2xl font-semibold text-foreground">The agent team</h2>
            <p className="text-muted-foreground">
              {agents.length} specialized agents that plan, build, review, and ship.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {agents.slice(0, 8).map((agent) => (
              <LinkCard
                key={agent.slug}
                href={`/agents/${agent.slug}`}
                title={agent.name}
                description={agent.description}
              />
            ))}
          </div>

          <Link
            href="/agents"
            className="flex cursor-pointer items-center gap-1.5 self-start text-sm font-medium text-primary transition-colors duration-200 hover:text-accent-foreground"
          >
            All {agents.length} agents
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* What AgentKit is — the rename is itself a search query. */}
      <section>
        <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-20 sm:px-6">
          <h2 className="font-mono text-2xl font-semibold text-foreground">What is AgentKit?</h2>

          <div className="flex flex-col gap-4 leading-relaxed text-muted-foreground">
            <p>
              AgentKit is a toolkit for Claude Code: a library of {skills.length} skills,{' '}
              {agents.length} specialized agents, hooks, and an orchestration layer that turns a
              general coding assistant into a structured development workflow.
            </p>
            <p>
              It was previously called <strong className="text-foreground">ClaudeKit</strong>.
              The old domain now redirects to agentkit.best, and the CLI moved from{' '}
              <code className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-sm">
                ck
              </code>{' '}
              to{' '}
              <code className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-sm">
                ak
              </code>
              .
            </p>
            <p>
              This site is an independent knowledge base for it. We do not sell AgentKit — we
              document it, and we earn a commission if you buy through our links.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <AffiliateLink
              campaign="home-cta"
              path={ENGINEER_PATH}
              className={cn(buttonVariants({ variant: 'primary', size: 'md' }), 'no-underline')}
            >
              Get AgentKit
              <ArrowUpRight aria-hidden="true" />
            </AffiliateLink>
            <Link
              href="/skills"
              className={cn(buttonVariants({ variant: 'outline', size: 'md' }))}
            >
              <Terminal aria-hidden="true" />
              Explore skills
            </Link>
            <Link
              href="/agents"
              className={cn(buttonVariants({ variant: 'outline', size: 'md' }))}
            >
              <Bot aria-hidden="true" />
              Explore agents
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
