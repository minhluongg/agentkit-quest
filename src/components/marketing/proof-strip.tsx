import { skills, agents, categories } from '@/lib/catalog';
import { publishedSkillSlugs, publishedAgentSlugs } from '@/lib/overrides';
import { siteConfig } from '@/lib/site';
import { source } from '@/lib/source';

/**
 * The five numbers this site is allowed to claim.
 *
 * Every figure is read from the catalog at build time, never typed. A literal here
 * would be wrong the day the kit ships skill 89 — silently, and above the fold.
 *
 * The counted kit version is stated on purpose. It is the cheapest proof of
 * independence available to us: a vendor's affiliate would not know which build
 * they were looking at, because a vendor's affiliate never counted anything. The
 * vendor's own site advertises "60+ skills" and "17 agents"; we publish what is in
 * the kit we installed.
 *
 * The stub count is volunteered rather than hidden. A reader who clicks into
 * /skills and hits a reference stub they were not warned about stops believing the
 * other four numbers too. A reader who was warned finds the site exactly as
 * described — which is the only durable asset this project has.
 */

interface Stat {
  value: number;
  label: string;
  sublabel?: string;
}

export function ProofStrip() {
  const writtenSkills = publishedSkillSlugs().length;
  const writtenAgents = publishedAgentSlugs().length;
  const guides = source.getPages().length;
  const stubs = skills.length - writtenSkills;

  // The agent sublabel is derived, not asserted. It used to read "all documented"
  // — true at 13 of 13, false the moment the kit shipped three more agents. A
  // claim that silently rots into a lie is worse than no claim.
  const stats: Stat[] = [
    { value: skills.length, label: 'skills', sublabel: 'catalogued' },
    { value: agents.length, label: 'agents', sublabel: `${writtenAgents} documented` },
    { value: categories.length, label: 'categories' },
    { value: writtenSkills, label: 'skills', sublabel: 'written in depth' },
    { value: guides, label: 'guides' },
  ];

  return (
    <section className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-12 sm:px-6">
        {/* A bare data row, not a pricing table. Dressing numbers in cards and
            borders makes them look like marketing; leaving them plain makes them
            look like facts — which is what they are. */}
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
          {stats.map((stat) => (
            <div key={`${stat.value}-${stat.label}-${stat.sublabel ?? ''}`} className="flex flex-col gap-1">
              <span className="font-mono text-3xl font-bold text-foreground sm:text-4xl">
                {stat.value}
              </span>
              <span className="text-sm font-medium text-foreground">{stat.label}</span>
              {stat.sublabel && (
                <span className="text-sm text-muted-foreground">{stat.sublabel}</span>
              )}
            </div>
          ))}
        </div>

        <p className="max-w-3xl text-xs leading-relaxed text-muted-foreground">
          Counted from the AgentKit Engineer kit itself ({siteConfig.upstream.kitVersion},{' '}
          {siteConfig.upstream.kitCountedAt}) — not from a marketing page. {stubs} of the{' '}
          {skills.length} skills are reference stubs with upstream metadata only; we would rather
          tell you that here than have you find out on the third click.
        </p>
      </div>
    </section>
  );
}
