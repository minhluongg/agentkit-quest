import { LinkCard } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getSkill } from '@/lib/catalog';

/**
 * Renders the `relatedSkills` frontmatter as links into the reference tier.
 * This block is why the generated skill pages are not orphans — every guide
 * feeds them link equity, and they link back.
 */
export function RelatedSkills({ slugs }: { slugs: string[] }) {
  const resolved = slugs.map(getSkill).filter((skill) => skill !== undefined);

  if (resolved.length === 0) return null;

  return (
    <section className="mt-12 flex flex-col gap-5 border-t border-border pt-8">
      <h2 className="font-mono text-lg font-semibold text-foreground">Skills used in this guide</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        {resolved.map((skill) => (
          <LinkCard
            key={skill.slug}
            href={`/skills/${skill.slug}`}
            title={skill.invocation}
            description={skill.description}
            footer={<Badge>{skill.category}</Badge>}
          />
        ))}
      </div>
    </section>
  );
}
