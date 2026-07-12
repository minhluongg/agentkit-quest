import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Clock, Calendar } from 'lucide-react';
import type { Metadata } from 'next';
import { findNeighbour } from 'fumadocs-core/page-tree';
import { getMDXComponents } from '@/mdx-components';
import { DocsToc } from '@/components/docs/docs-toc';
import { Breadcrumb } from '@/components/docs/breadcrumb';
import { RelatedSkills } from '@/components/docs/related-skills';
import { Badge } from '@/components/ui/badge';
import { JsonLd, breadcrumbSchema, techArticleSchema } from '@/components/seo/json-ld';
import { source } from '@/lib/source';
import { buildMetadata } from '@/lib/seo';

interface PageProps {
  params: Promise<{ lang: string; slug: string[] }>;
}

export function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) notFound();

  return buildMetadata({
    title: page.data.title,
    description: page.data.description,
    path: page.url,
    noindex: page.data.noindex,
    modifiedTime: page.data.updated,
    keywords: page.data.keywords,
  });
}

export default async function GuidePage({ params }: PageProps) {
  const { lang, slug } = await params;
  const page = source.getPage(slug);
  if (!page) notFound();

  const MDX = page.data.body;
  // With i18n enabled the source keeps one page tree per language.
  const neighbours = findNeighbour(source.getPageTree(lang), page.url);

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Guides', path: '/guides' },
            { name: page.data.title, path: page.url },
          ]),
          techArticleSchema({
            title: page.data.title,
            description: page.data.description,
            path: page.url,
            modified: page.data.updated,
            keywords: page.data.keywords,
          }),
        ]}
      />

      <div className="flex gap-12">
        <article className="min-w-0 flex-1">
          <Breadcrumb
            items={[
              { name: 'Guides', href: '/guides' },
              { name: page.data.title, href: page.url },
            ]}
          />

          <header className="mt-4 flex flex-col gap-4 pb-8">
            <h1 className="font-mono text-3xl font-bold tracking-tight text-balance text-foreground sm:text-4xl">
              {page.data.title}
            </h1>
            <p className="text-lg leading-relaxed text-pretty text-muted-foreground">
              {page.data.description}
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <Badge variant="outline">{page.data.difficulty}</Badge>
              {page.data.readingTime && (
                <span className="flex items-center gap-1.5">
                  <Clock className="size-3.5" aria-hidden="true" />
                  {page.data.readingTime} min read
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar className="size-3.5" aria-hidden="true" />
                Updated {page.data.updated}
              </span>
            </div>
          </header>

          <div className="prose-doc">
            <MDX components={getMDXComponents()} />
          </div>

          {page.data.relatedSkills.length > 0 && (
            <RelatedSkills slugs={page.data.relatedSkills} />
          )}

          <nav
            aria-label="Guide navigation"
            className="mt-12 grid gap-4 border-t border-border pt-8 sm:grid-cols-2"
          >
            {neighbours.previous ? (
              <Link
                href={neighbours.previous.url}
                className="group flex cursor-pointer flex-col gap-1 rounded-[var(--radius)] border border-border p-4 transition-colors duration-200 hover:border-primary"
              >
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ArrowLeft className="size-3.5" aria-hidden="true" />
                  Previous
                </span>
                <span className="text-sm font-medium text-foreground transition-colors duration-200 group-hover:text-primary">
                  {neighbours.previous.name}
                </span>
              </Link>
            ) : (
              <span />
            )}

            {neighbours.next && (
              <Link
                href={neighbours.next.url}
                className="group flex cursor-pointer flex-col items-end gap-1 rounded-[var(--radius)] border border-border p-4 text-right transition-colors duration-200 hover:border-primary sm:col-start-2"
              >
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  Next
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </span>
                <span className="text-sm font-medium text-foreground transition-colors duration-200 group-hover:text-primary">
                  {neighbours.next.name}
                </span>
              </Link>
            )}
          </nav>
        </article>

        <DocsToc items={page.data.toc} />
      </div>
    </>
  );
}
