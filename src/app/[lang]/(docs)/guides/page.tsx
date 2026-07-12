import type { Metadata } from 'next';
import { PageHeader } from '@/components/common/page-header';
import { LinkCard } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { JsonLd, breadcrumbSchema, itemListSchema } from '@/components/seo/json-ld';
import { source } from '@/lib/source';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'AgentKit Guides',
  description:
    'Practical, tested guides for AgentKit — installation, core commands, agent orchestration, and the workflows that actually ship code.',
  path: '/guides',
});

export default function GuidesPage() {
  const pages = source.getPages();

  // Group by frontmatter category. A flat link list is what competitors ship;
  // grouped cards with real metadata is what gets clicked.
  const grouped = new Map<string, typeof pages>();
  for (const page of pages) {
    const key = page.data.category;
    grouped.set(key, [...(grouped.get(key) ?? []), page]);
  }

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Guides', path: '/guides' },
          ]),
          itemListSchema(pages.map((p) => ({ name: p.data.title, path: p.url }))),
        ]}
      />

      <PageHeader
        title="Guides"
        description="Written against a real AgentKit install, with real output. Start at the top."
      />

      <div className="flex flex-col gap-12">
        {[...grouped.entries()].map(([category, items]) => (
          <section key={category} className="flex flex-col gap-5">
            <h2 className="font-mono text-lg font-semibold text-foreground">{category}</h2>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((page) => (
                <LinkCard
                  key={page.url}
                  href={page.url}
                  title={page.data.title}
                  description={page.data.description}
                  footer={<Badge variant="outline">{page.data.difficulty}</Badge>}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
