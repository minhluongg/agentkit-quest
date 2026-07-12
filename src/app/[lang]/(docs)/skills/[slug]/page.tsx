import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getMDXComponents } from '@/mdx-components';
import { Breadcrumb } from '@/components/docs/breadcrumb';
import { DocsToc } from '@/components/docs/docs-toc';
import { CopyButton } from '@/components/mdx/copy-button';
import { KitCta } from '@/components/affiliate/kit-cta';
import { LinkCard } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { JsonLd, breadcrumbSchema, techArticleSchema } from '@/components/seo/json-ld';
import { skills, getSkill, getRelatedSkills, getCategory } from '@/lib/catalog';
import { getSkillOverride, isPublished } from '@/lib/overrides';
import { source } from '@/lib/source';
import { buildMetadata } from '@/lib/seo';

interface PageProps {
  params: Promise<{ lang: string; slug: string }>;
}

export function generateStaticParams() {
  return skills.map((skill) => ({ slug: skill.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const skill = getSkill(slug);
  if (!skill) notFound();

  const override = getSkillOverride(slug);
  const published = isPublished('skill', slug);

  return buildMetadata({
    title: override?.title ?? `${skill.invocation} — AgentKit skill`,
    description: override?.description ?? skill.description,
    path: `/skills/${slug}`,
    // A stub is never indexed; a published page can still opt back out via `noindex`
    // in its frontmatter (the kill-rule mechanism — no need to delete the file).
    noindex: !published || override?.noindex === true,
    // Prefer the override's job-targeted keywords over the vendor's invocation ones.
    keywords: override?.keywords ?? skill.keywords,
  });
}

export default async function SkillPage({ params }: PageProps) {
  const { slug } = await params;
  const skill = getSkill(slug);
  if (!skill) notFound();

  const override = getSkillOverride(slug);
  const category = getCategory(skill.category);
  const related = getRelatedSkills(slug);

  // Reverse lookup: which guides reference this skill? This is what stops the
  // reference tier from being an orphan island of pages nothing links into.
  const mentionedIn = source
    .getPages()
    .filter((page) => page.data.relatedSkills.includes(slug));

  const MDX = override?.body;

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Skills', path: '/skills' },
            { name: skill.invocation, path: `/skills/${slug}` },
          ]),
          techArticleSchema({
            title: override?.title ?? skill.invocation,
            description: override?.description ?? skill.description,
            path: `/skills/${slug}`,
            keywords: skill.keywords,
          }),
        ]}
      />

      <div className="flex gap-12">
        <article className="min-w-0 flex-1">
          <Breadcrumb
            items={[
              { name: 'Skills', href: '/skills' },
              { name: skill.invocation, href: `/skills/${slug}` },
            ]}
          />

          <header className="mt-4 flex flex-col gap-5 pb-8">
            <h1 className="font-mono text-3xl font-bold tracking-tight text-balance text-foreground sm:text-4xl">
              {override?.title ?? skill.invocation}
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-pretty text-muted-foreground">
              {override?.description ?? skill.description}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              {category && <Badge variant="accent">{category.label}</Badge>}
              {skill.hasScripts && <Badge variant="outline">has scripts</Badge>}
              {skill.hasReferences && <Badge variant="outline">has references</Badge>}
              {skill.keywords.slice(0, 5).map((keyword) => (
                <Badge key={keyword}>{keyword}</Badge>
              ))}
            </div>

            {/* Invocation block — the single most copy-pasted thing on the page.
                The `ak:` prefix is current; `ck:` is shown because people who
                learned the old CLI still type it (and still search for it). */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 rounded-[var(--radius)] border border-border bg-surface p-4">
                <code className="flex-1 font-mono text-sm text-foreground">
                  {skill.invocation}
                  {skill.argumentHint && (
                    <span className="text-muted-foreground"> {skill.argumentHint}</span>
                  )}
                </code>
                <CopyButton value={skill.invocation} />
              </div>
              <p className="text-xs text-muted-foreground">
                Legacy ClaudeKit prefix:{' '}
                <code className="font-mono">{skill.legacyInvocation}</code>
              </p>
            </div>
          </header>

          {MDX ? (
            <div className="prose-doc">
              <MDX components={getMDXComponents()} />
            </div>
          ) : (
            <StubBody skillName={skill.invocation} />
          )}

          {mentionedIn.length > 0 && (
            <section className="mt-12 flex flex-col gap-5 border-t border-border pt-8">
              <h2 className="font-mono text-lg font-semibold text-foreground">
                Guides using this skill
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {mentionedIn.map((page) => (
                  <LinkCard
                    key={page.url}
                    href={page.url}
                    title={page.data.title}
                    description={page.data.description}
                  />
                ))}
              </div>
            </section>
          )}

          {related.length > 0 && (
            <section className="mt-12 flex flex-col gap-5 border-t border-border pt-8">
              <h2 className="font-mono text-lg font-semibold text-foreground">Related skills</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {related.map((item) => (
                  <LinkCard
                    key={item.slug}
                    href={`/skills/${item.slug}`}
                    title={item.invocation}
                    description={item.description}
                    className="[&_h3]:font-mono [&_h3]:text-sm"
                  />
                ))}
              </div>
            </section>
          )}

          {/* Unconditional. It used to be gated on `!MDX`, so the CTA appeared ONLY
              on noindex stubs — i.e. only on the pages that can never receive
              organic traffic — while every published page depended on the author
              remembering to hand-place one. */}
          <KitCta className="mt-12" campaign="skill-page" showDisclosure />

          {/* The kit's source repo is private (purchase-gated), so no public
              "view source" link — it would 404 for every visitor. */}
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

/**
 * Rendered when no hand-written override exists. States facts only, and the page
 * carries `noindex` — see src/lib/overrides.ts for why that matters.
 */
function StubBody({ skillName }: { skillName: string }) {
  return (
    <div className="prose-doc">
      <p>
        This page is a factual reference for <code>{skillName}</code>, generated from the AgentKit
        skill catalog. A full write-up — what it does, when to reach for it, and a worked example
        — is still being written.
      </p>
      <p>
        In the meantime, the source file linked at the bottom of this page is authoritative.
      </p>
    </div>
  );
}
