/**
 * Generates the skills/agents catalog from the vendored AgentKit Engineer kit.
 *
 * Run manually: `npm run catalog:build`
 *
 * This is an AUTHORING tool, not a build step. The output JSON is committed to
 * git so that production builds never need the vendored (licence-gated) kit on
 * disk. Wiring this into `prebuild` would break Vercel.
 *
 * The kit is produced by:
 *   ak kit init engineer --target claude-code --build-only --out <dir>
 * then copied to ./agentkit-engineer (gitignored — it is not ours to publish).
 *
 * Kit layout changed with the ClaudeKit → AgentKit rename. The old kit exposed a
 * single `guide/SKILLS.yaml` manifest; the AgentKit kit has no manifest at all
 * and carries the same metadata in each skill's own SKILL.md frontmatter. This
 * script reads the tree directly, which is the only source that cannot drift
 * from what actually ships.
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import matter from 'gray-matter';
import { z } from 'zod';

const ROOT = resolve(import.meta.dirname, '..');
const KIT = join(ROOT, 'agentkit-engineer');
const SKILLS_DIR = join(KIT, 'skills');
const AGENTS_DIR = join(KIT, 'agents');
const OUT_DIR = join(ROOT, 'src', 'data');

/**
 * Category labels. The AgentKit kit ships category *ids* on each skill but no
 * label map — that lived in the old SKILLS.yaml, which no longer exists. These
 * are the labels the site already publishes; keeping them stable keeps
 * /skills?category=… deep links working.
 */
const CATEGORY_LABELS: Record<string, string> = {
  'ai-ml': 'AI & Machine Learning',
  frontend: 'Frontend & Design',
  backend: 'Backend Development',
  infrastructure: 'Infrastructure & DevOps',
  database: 'Database & Storage',
  'dev-tools': 'Development Tools',
  multimedia: 'Multimedia & Processing',
  frameworks: 'Frameworks & Platforms',
  security: 'Security & Intelligence',
  utilities: 'Utilities & Helpers',
  other: 'Other',
};

// --- Schemas: fail loudly on upstream drift rather than silently emitting junk.

const skillFrontmatterSchema = z.object({
  name: z.string(),
  description: z.string(),
  // Three skills (common, document-skills, help) ship no category. They are
  // support skills, not user-facing tools — bucket them rather than crashing.
  category: z.string().default('other'),
  keywords: z.array(z.string()).default([]),
  'argument-hint': z.string().optional(),
  // 88 of the 91 skills carry this. It is a curated "should I reach for this?" sentence,
  // distinct from `description`'s "what is it?" — and it is the single most useful field
  // for a reader who has landed on a skill they have never used.
  when_to_use: z.string().optional(),
});

const agentFrontmatterSchema = z.object({
  name: z.string(),
  description: z.string(),
  tools: z.string().optional(),
  model: z.string().optional(),
});

// --- Helpers

/**
 * `ak:plan` → `plan`.
 *
 * Load-bearing. The kit names skills with their invocation prefix (`ak:plan`),
 * but the site's URLs are /skills/plan and have been since launch. Slugging the
 * raw name would rename all 88 published skill URLs to /skills/ak-plan in one
 * commit and throw away every one of them. The prefix is presentation; the bare
 * name is identity.
 */
function toSlug(name: string): string {
  return baseName(name).toLowerCase();
}

/** `ak:plan` → `plan`; `plan` → `plan`. */
function baseName(name: string): string {
  const idx = name.indexOf(':');
  return idx === -1 ? name : name.slice(idx + 1);
}

/**
 * The invocation people type. Canonical prefix is `ak:`; `ck:` is the legacy
 * ClaudeKit form. Both are rendered — the kit's own skill files still reference
 * `ck:` in places, and people who learned `/ck:plan` still search for it.
 */
function toInvocation(name: string, prefix: 'ak' | 'ck'): string {
  return `/${prefix}:${baseName(name)}`;
}

/**
 * Agent descriptions in the kit are prompt-engineering payloads: a real sentence
 * followed by <example> blocks meant for the model, not for a human reader.
 * Keep the human part; drop the rest.
 */
function cleanAgentDescription(raw: string): string {
  const cut = raw.split(/\s*(?:Examples?:|<example>)/i)[0] ?? raw;
  return cut.replace(/\s+/g, ' ').trim();
}

/**
 * Markdown filenames in a directory, without the extension. Empty when the directory does
 * not exist — an absent `references/` is a fact about the skill, not an error.
 */
function filesIn(path: string): string[] {
  if (!existsSync(path)) return [];
  return readdirSync(path, { withFileTypes: true })
    .filter((e) => e.isFile())
    .map((e) => e.name.replace(/\.(md|mdx|ts|js|py|sh|cjs|mjs)$/, ''))
    .sort();
}

function dirsIn(path: string): string[] {
  return readdirSync(path, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);
}

// --- Build

function buildSkills() {
  const skills = dirsIn(SKILLS_DIR)
    .map((dir) => {
      const skillDir = join(SKILLS_DIR, dir);
      const parsed = matter(readFileSync(join(skillDir, 'SKILL.md'), 'utf8'));
      const fm = skillFrontmatterSchema.parse(parsed.data);

      return {
        slug: toSlug(fm.name),
        name: baseName(fm.name),
        invocation: toInvocation(fm.name, 'ak'),
        legacyInvocation: toInvocation(fm.name, 'ck'),
        description: fm.description,
        category: fm.category,
        keywords: fm.keywords,
        argumentHint: fm['argument-hint'] ?? null,

        // `when_to_use` is a distinct, per-skill, hand-curated sentence in every SKILL.md —
        // 88 of the 91 carry one — and it answers the reader's actual first question
        // ("should I reach for this?") in a way `description` ("what is it?") does not.
        // It was being dropped, so 71 stub pages had nothing to say beyond a paraphrase.
        whenToUse: fm.when_to_use ?? null,

        // Counts and names, not a boolean. "has references: yes" tells a reader nothing;
        // "12 reference docs, including backend-authentication.md" tells them how deep this
        // goes and whether it covers their case. These are filesystem facts about the kit
        // they are considering paying for — not a paraphrase of its marketing.
        scripts: filesIn(join(skillDir, 'scripts')),
        references: filesIn(join(skillDir, 'references')),

        hasScripts: existsSync(join(skillDir, 'scripts')),
        hasReferences: existsSync(join(skillDir, 'references')),
        // No sourceUrl: the kit is purchase-gated, so a link would 404 — and it
        // would otherwise ship a private URL in the client bundle.
      };
    })
    .sort((a, b) => a.slug.localeCompare(b.slug));

  const dupes = skills.filter((s, i) => skills.findIndex((o) => o.slug === s.slug) !== i);
  if (dupes.length > 0) {
    throw new Error(`Duplicate skill slugs: ${dupes.map((d) => d.slug).join(', ')}`);
  }

  const unknown = skills.filter((s) => !CATEGORY_LABELS[s.category]);
  if (unknown.length > 0) {
    throw new Error(
      `Skills in categories with no label: ${unknown
        .map((s) => `${s.slug} (${s.category})`)
        .join(', ')}. Add the label to CATEGORY_LABELS.`,
    );
  }

  // Only emit categories that actually hold skills — an empty filter chip on
  // /skills is a dead end the user can click.
  const categories = Object.entries(CATEGORY_LABELS)
    .map(([id, label]) => ({
      id,
      label,
      count: skills.filter((s) => s.category === id).length,
    }))
    .filter((c) => c.count > 0);

  return { skills, categories };
}

function buildAgents() {
  return readdirSync(AGENTS_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((file) => {
      const parsed = matter(readFileSync(join(AGENTS_DIR, file), 'utf8'));
      const fm = agentFrontmatterSchema.parse(parsed.data);

      return {
        slug: file.replace(/\.md$/, '').toLowerCase(),
        name: fm.name,
        description: cleanAgentDescription(fm.description),
        tools: fm.tools ? fm.tools.split(',').map((t) => t.trim()) : [],
        model: fm.model ?? null,
      };
    })
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

// --- Emit

function main() {
  if (!existsSync(KIT)) {
    throw new Error(
      `Kit not found at ${KIT}.\n` +
        `Build it first:\n` +
        `  ak kit init engineer --target claude-code --build-only --out <dir>\n` +
        `then copy <dir>/ak-engineer to ./agentkit-engineer`,
    );
  }

  const { skills, categories } = buildSkills();
  const agents = buildAgents();

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(join(OUT_DIR, 'skills.generated.json'), `${JSON.stringify(skills, null, 2)}\n`);
  writeFileSync(join(OUT_DIR, 'agents.generated.json'), `${JSON.stringify(agents, null, 2)}\n`);
  writeFileSync(
    join(OUT_DIR, 'categories.generated.json'),
    `${JSON.stringify(categories, null, 2)}\n`,
  );

  console.log(`  skills:     ${skills.length}`);
  console.log(`  agents:     ${agents.length}`);
  console.log(`  categories: ${categories.length}`);
}

main();
