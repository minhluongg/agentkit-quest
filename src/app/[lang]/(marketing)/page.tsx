import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Bot, Terminal } from 'lucide-react';
import type { Metadata } from 'next';
import { AffiliateLink } from '@/components/affiliate/affiliate-link';
import { KitCta } from '@/components/affiliate/kit-cta';
import { ProofStrip } from '@/components/marketing/proof-strip';
import { SearchTrigger } from '@/components/search/search-trigger';
import { LinkCard } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { JsonLd, websiteSchema, organizationSchema } from '@/components/seo/json-ld';
import { skills, agents, categories } from '@/lib/catalog';
import { publishedSkillSlugs } from '@/lib/overrides';
import { source } from '@/lib/source';
import { siteConfig } from '@/lib/site';
import { buildMetadata } from '@/lib/seo';
import { cn } from '@/lib/utils';

export const metadata: Metadata = buildMetadata({
  title: `${siteConfig.name} — The independent AgentKit knowledge base`,
  description: siteConfig.description,
  path: '/',
});

/** Shared by the two inline "read the guide" links below the prose sections. */
const inlineLink =
  'inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-primary transition-colors duration-200 hover:text-accent-foreground';

/**
 * The landing page.
 *
 * Section order is the argument, and it is load-bearing: sections 1–8 are 100% of
 * the value and 0% of the ask. The price and the discount appear exactly once, in
 * the closing CTA, after the reader has been given a reason to trust the page.
 * Moving the ask upward would buy a few clicks and cost the only thing this site
 * actually sells, which is being believed.
 */
export default function HomePage() {
  const featured = source.getPages().slice(0, 6);
  const writtenSkills = publishedSkillSlugs().length;

  return (
    <>
      <JsonLd data={[websiteSchema(), organizationSchema()]} />

      {/* 1. Hero — the search box IS the pitch. It demonstrates the depth of the
             knowledge base in 200ms instead of asserting it in an adjective. */}
      <section className="border-b border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 py-20 text-center sm:px-6 lg:py-28">
          <Badge variant="outline" className="gap-1.5 py-1">
            <span className="size-1.5 rounded-full bg-success" aria-hidden="true" />
            ClaudeKit is now AgentKit
          </Badge>

          {/* max-w-4xl + 5xl (not 6xl) at desktop: this headline is two sentences,
              and at 6xl/3xl it wrapped to four lines of mono — which shoved the
              search box, the element that actually does the persuading, below the
              fold. The headline serves the search box here, not the reverse. */}
          <div className="flex max-w-4xl flex-col gap-5">
            <h1 className="font-mono text-3xl leading-tight font-bold tracking-tight text-balance text-foreground sm:text-4xl lg:text-5xl">
              Every AgentKit skill, catalogued. The ones that matter, documented properly.
            </h1>
            <p className="text-lg leading-relaxed text-pretty text-muted-foreground">
              {skills.length} skills and {agents.length} agents, indexed from AgentKit Engineer{' '}
              {siteConfig.upstream.kitVersion}. {writtenSkills} of them written up in depth —
              against a real install, not a marketing page.
            </p>
          </div>

          <div className="w-full max-w-xl">
            <SearchTrigger size="lg" className="max-w-none" />
          </div>

          {/* The affiliate link is deliberately the quietest control here: no price,
              no discount, no urgency. It exists for the reader who arrived already
              sold — not to persuade the rest. That happens at the bottom, or not at all. */}
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

      {/* 2. Proof — the real numbers, version-pinned, stubs volunteered. */}
      <ProofStrip />

      {/* 3. The rename. A live search query, and the reason a large share of cold
             organic traffic lands here at all. Answer it completely, immediately,
             and before asking for anything. */}
      <section className="border-b border-border">
        <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-16 sm:px-6">
          <h2 className="font-mono text-2xl font-semibold text-foreground">
            ClaudeKit is now AgentKit
          </h2>

          <p className="leading-relaxed text-muted-foreground">
            Same kit, new name. The rename landed in 2026 and broke a lot of muscle memory, so
            here is the whole of it:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border border-border bg-muted px-3 py-2 text-left font-semibold" />
                  <th className="border border-border bg-muted px-3 py-2 text-left font-semibold">
                    Before
                  </th>
                  <th className="border border-border bg-muted px-3 py-2 text-left font-semibold">
                    Now
                  </th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr>
                  <td className="border border-border px-3 py-2 font-medium text-foreground">
                    Name
                  </td>
                  <td className="border border-border px-3 py-2">ClaudeKit</td>
                  <td className="border border-border px-3 py-2">AgentKit</td>
                </tr>
                <tr>
                  <td className="border border-border px-3 py-2 font-medium text-foreground">
                    Site
                  </td>
                  <td className="border border-border px-3 py-2">claudekit.cc</td>
                  <td className="border border-border px-3 py-2">agentkit.best</td>
                </tr>
                <tr>
                  <td className="border border-border px-3 py-2 font-medium text-foreground">
                    Command prefix
                  </td>
                  <td className="border border-border px-3 py-2">
                    <code className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs">
                      ck:
                    </code>
                  </td>
                  <td className="border border-border px-3 py-2">
                    <code className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs">
                      ak:
                    </code>
                  </td>
                </tr>
                <tr>
                  <td className="border border-border px-3 py-2 font-medium text-foreground">
                    Skills, agents, hooks
                  </td>
                  <td className="border border-border px-3 py-2">—</td>
                  <td className="border border-border px-3 py-2">unchanged</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="leading-relaxed text-muted-foreground">
            Nothing else moved. Your existing workflows still work; the prefix is the one thing
            you have to retrain.
          </p>

          <Link href="/guides/claudekit-to-agentkit" className={cn(inlineLink, 'self-start')}>
            Read the migration guide
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* 4. What it actually is. Honest to the point of undercutting the product we
             earn commission on — which is exactly why the rest of the page is
             believable. No CTA here: a buy button inside the paragraph that admits
             the features are free would defeat the paragraph. */}
      <section className="border-b border-border">
        <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-16 sm:px-6">
          <h2 className="font-mono text-2xl font-semibold text-foreground">
            What AgentKit actually is
          </h2>

          <div className="flex flex-col gap-4 leading-relaxed text-muted-foreground">
            <p>
              AgentKit is a paid toolkit for Claude Code: {skills.length} skills, {agents.length}{' '}
              specialised subagents, hooks, and the orchestration layer that wires them into a
              plan → build → review → ship loop.
            </p>
            <p>
              It does not unlock anything Claude Code withholds. Skills, subagents, and hooks are
              all{' '}
              <strong className="font-semibold text-foreground">free, first-party features</strong>{' '}
              — you could write all of them yourself. What $99 buys is the{' '}
              <strong className="font-semibold text-foreground">curation and the wiring</strong>: a
              large set of parts that already fit together, so you are not authoring and tuning
              dozens of config files on your own time.
            </p>
            <p>
              Whether that trade is worth it depends on how much your time costs. We wrote a guide
              that walks through it honestly, including the cases where the answer is no.
            </p>
          </div>

          <Link href="/guides/which-agentkit-kit-to-buy" className={cn(inlineLink, 'self-start')}>
            Which kit should you buy?
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* 5. Category grid — communicates depth by showing it. */}
      <section className="border-b border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-16 sm:px-6">
          <div className="flex flex-col gap-2">
            <h2 className="font-mono text-2xl font-semibold text-foreground">Skills by category</h2>
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

          <Link href="/skills" className={cn(inlineLink, 'self-start')}>
            View the full catalog
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* 6. Featured guides */}
      <section className="border-b border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-16 sm:px-6">
          <div className="flex flex-col gap-2">
            <h2 className="font-mono text-2xl font-semibold text-foreground">Start here</h2>
            <p className="text-muted-foreground">
              The guides people actually arrive looking for.
            </p>
          </div>

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

      {/* 7. Agents. "Every one documented" is true here — 13/13 — and it lands
             harder because the proof strip already admitted the skills are 20/88.
             Honesty compounds; that is the entire mechanism of this page. */}
      <section className="border-b border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-16 sm:px-6">
          <div className="flex flex-col gap-2">
            <h2 className="font-mono text-2xl font-semibold text-foreground">The agent team</h2>
            <p className="text-muted-foreground">
              {agents.length} subagents that plan, build, review, and ship. Every one of them
              documented.
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

          <Link href="/agents" className={cn(inlineLink, 'self-start')}>
            All {agents.length} agents
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* 8. The thesis. It converts because it does not try to. Placed immediately
             before the ask on purpose: earn it, then ask. No trust badges, no
             checkmark icons — a trust section decorated with trust iconography
             reads as compensation for not having any. */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-16 sm:px-6">
          <h2 className="font-mono text-2xl font-semibold text-foreground">Why trust this site</h2>

          <div className="flex flex-col gap-4 leading-relaxed text-muted-foreground">
            <p>
              We are not AgentKit, and we are not affiliated with it. We bought the kit, installed
              it, counted the files, and wrote the documentation the vendor didn&apos;t.
            </p>
            <p>
              That independence has a shape you can check. Our skill pages teach the free way to
              do the job first, then tell you whether the kit is actually worth it for that job —
              and for some of them, we say it isn&apos;t. Every number on this page names the file
              it came from. When the kit changes, we recount.
            </p>
            <p>
              If you decide AgentKit is worth $99, buying through our link gets you 20% off and
              pays us a commission. The guides were here first, and they do not change based on
              what we earn.
            </p>
          </div>
        </div>
      </section>

      {/* 9. The ask — the only place on the page with a price on it. */}
      <section>
        <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-20 sm:px-6">
          <KitCta
            campaign="home-cta"
            title="Get AgentKit Engineer"
            body={`${skills.length} skills, ${agents.length} agents, and the workflow layer this site documents. $99 one-time — and 20% off your first purchase through this link.`}
            action="Get AgentKit — 20% off"
            showDisclosure
            className="my-0"
          />

          <div className="flex flex-wrap gap-3">
            <Link href="/skills" className={cn(buttonVariants({ variant: 'outline', size: 'md' }))}>
              <Terminal aria-hidden="true" />
              Explore skills
            </Link>
            <Link href="/agents" className={cn(buttonVariants({ variant: 'outline', size: 'md' }))}>
              <Bot aria-hidden="true" />
              Explore agents
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
