import {
  defineDocs,
  defineCollections,
  defineConfig,
  frontmatterSchema,
} from 'fumadocs-mdx/config';
import { z } from 'zod';
import skills from './src/data/skills.generated.json' with { type: 'json' };

const SKILL_SLUGS = new Set(skills.map((skill) => skill.slug));

/**
 * Guide frontmatter.
 *
 * `relatedSkills` is the internal-linking engine: it links a guide into the
 * generated reference tier, and lets skill pages reverse-look-up the guides that
 * mention them. Bidirectional internal linking is the highest-leverage SEO
 * structure on this site, so it lives in the schema rather than in prose.
 */
export const docs = defineDocs({
  dir: 'content/guides',
  docs: {
    schema: frontmatterSchema.extend({
      description: z.string(),
      category: z.string(),
      difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
      readingTime: z.number().optional(),
      // Strict date: sitemap.ts feeds this straight into `new Date()`, so a typo
      // would otherwise surface as an Invalid Date deep in the build.
      updated: z.iso.date(),
      keywords: z.array(z.string()).default([]),
      // Validated against the real catalog. An unknown slug used to be dropped
      // silently by the renderer, so a typo just made the internal link vanish —
      // the one thing on this site that must never fail quietly.
      relatedSkills: z
        .array(
          z.string().refine((slug) => SKILL_SLUGS.has(slug), {
            message: 'Unknown skill slug — check src/data/skills.generated.json',
          }),
        )
        .default([]),
      noindex: z.boolean().default(false),
    }),
  },
});

/**
 * Hand-written overrides for generated reference pages.
 *
 * A skill page with an override here is real content and gets indexed. A skill
 * page without one renders a factual stub and is `noindex`. That gate is the
 * whole defence against shipping 88 thin auto-generated pages, which Google
 * treats as spam — and one such penalty would poison the entire domain.
 *
 * File name must match the generated slug (see skills.generated.json), e.g. the
 * skill invoked as `/ak:plan` has slug `plan` → `content/skills/plan.mdx`.
 */
/** Shared shape for a reference-page override. */
const overrideSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  updated: z.string().optional(),
  // Overrides the vendor's invocation-flavoured keywords. A page that targets the
  // *job* ("claude code code review") must not ship the invocation keyword
  // ("ck:code-review") that nobody searches — see the content-map targeting rule.
  keywords: z.array(z.string()).optional(),
  // Lets a published page be pulled back out of the index without deleting the file
  // (the kill-rule mechanism). Default false: an override exists to be indexed.
  noindex: z.boolean().default(false),
  // The kit version the worked examples were run against. Surfaced on the page so a
  // reader knows how current it is; one `ak:` breaking change dates every example.
  kitVersion: z.string().optional(),
});

export const skillOverrides = defineCollections({
  type: 'doc',
  dir: 'content/skills',
  schema: overrideSchema,
});

export const agentOverrides = defineCollections({
  type: 'doc',
  dir: 'content/agents',
  schema: overrideSchema,
});

export default defineConfig({
  mdxOptions: {
    rehypeCodeOptions: {
      themes: {
        light: 'github-light',
        dark: 'github-dark-default',
      },
    },
  },
});
