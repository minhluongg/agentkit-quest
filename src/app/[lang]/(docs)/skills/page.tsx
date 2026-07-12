import type { Metadata } from 'next';
import { PageHeader } from '@/components/common/page-header';
import { SkillsExplorer } from '@/components/skills/skills-explorer';
import { JsonLd, breadcrumbSchema, itemListSchema } from '@/components/seo/json-ld';
import { skills, categories } from '@/lib/catalog';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: `All ${skills.length} AgentKit Skills`,
  description: `The complete AgentKit skills catalog — ${skills.length} skills across ${categories.length} categories, searchable and filterable. What each one does and when to reach for it.`,
  path: '/skills',
  keywords: ['agentkit skills', 'claude code skills', 'agentkit skill list'],
});

/**
 * Fully static, and the prerendered HTML contains all 88 skill links.
 *
 * Neither this page nor SkillsExplorer may read `searchParams` / `useSearchParams()`:
 * both opt the route out of static rendering, which previously left the crawler
 * with an empty hub and no path into the reference tier.
 */
export default function SkillsPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Skills', path: '/skills' },
          ]),
          itemListSchema(skills.map((s) => ({ name: s.invocation, path: `/skills/${s.slug}` }))),
        ]}
      />

      <PageHeader
        title="Skills"
        description={`Every skill AgentKit ships — ${skills.length} of them, across ${categories.length} categories.`}
      />

      <SkillsExplorer skills={skills} categories={categories} />
    </>
  );
}
