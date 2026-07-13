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
import { skills, getSkill, getRelatedSkills, getCategory, type Skill } from '@/lib/catalog';
import { getSkillOverride, isPublished } from '@/lib/overrides';
import { source } from '@/lib/source';
import { buildMetadata } from '@/lib/seo';
import { Provenance } from '@/components/docs/provenance';

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
            <StubBody skill={skill} category={category?.label} />
          )}

          <Provenance kitVersion={override?.kitVersion} updated={override?.updated} />

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
 * Rendered for every skill with no hand-written override. Skills only — the agent pages carry
 * their own stub, and it still opens with the apology described below. Extending this there is
 * unfinished work, not an oversight to leave quiet: an agent has `tools` and a `model`, not an
 * `argument-hint` or scripts, so it needs its own shape rather than this one.
 *
 * It used to open by apologising: "a full write-up is still being written." That sentence
 * was doing real damage, because it is not true that the page has nothing. The page has the
 * skill's real invocation, its real argument list read from `SKILL.md`'s `argument-hint`,
 * whether it ships executable scripts or reference docs, its category, and its neighbours.
 * A reader who arrived asking "what is this and how do I call it" was being told to come
 * back later by a page that already had their answer.
 *
 * So it states what it knows, plainly, and is honest about the one thing it does not have:
 * we have not run this skill against a real repository, and the pages that link from here
 * have. That is a specific, checkable claim — not a placeholder.
 *
 * No count here on purpose. Every literal in this file went stale the day a page was added —
 * "71 of 91", "the twenty pages" — and a number in a comment goes wrong silently, because
 * nothing builds it. Read the real figures from `publishedSkillSlugs()` and the build output.
 *
 * It stays `noindex` (see src/lib/overrides.ts). This is the difference between *useful to
 * the person who found it* and *worth asking Google to rank* — and they are not the same
 * bar.
 */
function StubBody({ skill, category }: { skill: Skill; category?: string }) {
  const { references, scripts, whenToUse } = skill;

  // The header already carries the title, the description, the category, the keywords and the
  // invocation. Repeating any of it here is what made this page read as filler — half of it was
  // the same page, twice. So this says only what the header cannot.
  return (
    <div className="prose-doc">
      {whenToUse && (
        <p>
          <strong>When to reach for it:</strong> {whenToUse}
        </p>
      )}

      <h2>How deep does it go?</h2>
      <p>
        Counted from the installed kit — not from a feature list. A vendor&rsquo;s page tells you a
        skill exists; it does not tell you whether it is a paragraph of instructions or a body of
        work you could not write in an afternoon.
      </p>

      <ul>
        <li>
          <strong>
            {references.length > 0 ? `${references.length} reference doc${references.length === 1 ? '' : 's'}` : 'No reference docs'}
          </strong>
          {references.length > 0 ? (
            <>
              , loaded on demand rather than carried in context:{' '}
              {references.slice(0, 8).map((file, i) => (
                <span key={file}>
                  {i > 0 && ', '}
                  <code>{file}</code>
                </span>
              ))}
              {references.length > 8 && `, and ${references.length - 8} more`}.
            </>
          ) : (
            ' — everything it knows is in the skill file itself.'
          )}
        </li>

        <li>
          <strong>
            {scripts.length > 0
              ? `${scripts.length} executable script${scripts.length === 1 ? '' : 's'}`
              : 'No executable scripts'}
          </strong>
          {scripts.length > 0
            ? ' — this one runs code, not just a prompt.'
            : ' — it is instructions, not a program.'}
        </li>
      </ul>

      <h2>What this page does not have</h2>
      <p>
        <strong>We have not run this skill against a real repository.</strong> Some skills on this
        site have a page showing what they actually printed — the bugs they found, the numbers they
        got wrong, the things they invented. This is not one of them.
      </p>
      <p>
        Rather than pad the gap with a rewording of the vendor&rsquo;s description, here is the
        gap. The facts above are checked. The judgement is not here yet.
      </p>
    </div>
  );
}
