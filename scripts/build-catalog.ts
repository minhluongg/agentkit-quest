/**
 * Generates the skills/agents catalog from the vendored AgentKit Engineer kit.
 *
 * Run manually: `npm run catalog:build`
 *
 * This is an AUTHORING tool, not a build step. The output JSON is committed to
 * git so that production builds never need the vendored (private) kit on disk.
 * Wiring this into `prebuild` would break Vercel.
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import yaml from 'js-yaml';
import matter from 'gray-matter';
import { z } from 'zod';

const ROOT = resolve(import.meta.dirname, '..');
const KIT = join(ROOT, 'claudekit-engineer');
const SKILLS_YAML = join(KIT, 'guide', 'SKILLS.yaml');
const AGENTS_DIR = join(KIT, 'claude', 'agents');
const OUT_DIR = join(ROOT, 'src', 'data');

const REPO_URL = 'https://github.com/claudekit/claudekit-engineer';

// --- Schemas: fail loudly on upstream drift rather than silently emitting junk.

const rawSkillSchema = z.object({
  name: z.string(),
  path: z.string(),
  description: z.string(),
  category: z.string(),
  has_scripts: z.boolean().default(false),
  has_references: z.boolean().default(false),
  argument_hint: z.string().optional(),
  keywords: z.array(z.string()).default([]),
});

const rawYamlSchema = z.object({
  metadata: z.object({
    total_skills: z.number(),
    last_updated: z.union([z.string(), z.date()]).optional(),
  }),
  categories: z.record(z.string(), z.string()),
  skills: z.record(z.string(), z.array(rawSkillSchema)),
});

const agentFrontmatterSchema = z.object({
  name: z.string(),
  description: z.string(),
  tools: z.string().optional(),
  model: z.string().optional(),
});

// --- Helpers

/** `ck:plan` → `ck-plan`, `ckm:design` → `ckm-design`. Colons are not URL-safe. */
function toSlug(name: string): string {
  return name.replace(/:/g, '-').toLowerCase();
}

/**
 * Current invocation prefix is `ak:` — agentkit.best/docs states plainly that
 * `ak` is "the successor to the legacy ClaudeKit ck CLI", and that skills are
 * invoked with the `ak:` slash prefix.
 *
 * The vendored kit (v2.20.0, June 2026) still ships `ck:` names internally; it is
 * stale relative to the rename. We render the current prefix, and keep the legacy
 * one visible — people who learned `/ck:plan` still search for it.
 */
function toInvocation(name: string, prefix: 'ak' | 'ck'): string {
  if (!name.includes(':')) return `/${prefix}:${name}`;

  // Marketing-kit skills carry their own namespace (`ckm:design` → `akm:design`).
  const [namespace, rest] = name.split(':');
  const migrated = namespace === 'ck' || namespace === 'ckm'
    ? namespace.replace(/^ck/, prefix)
    : namespace;

  return `/${migrated}:${rest}`;
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

// --- Build

function buildSkills() {
  const parsed = rawYamlSchema.parse(yaml.load(readFileSync(SKILLS_YAML, 'utf8')));

  const skills = Object.values(parsed.skills)
    .flat()
    .map((s) => ({
      slug: toSlug(s.name),
      name: s.name,
      invocation: toInvocation(s.name, 'ak'),
      legacyInvocation: toInvocation(s.name, 'ck'),
      description: s.description,
      category: s.category,
      keywords: s.keywords,
      argumentHint: s.argument_hint ?? null,
      hasScripts: s.has_scripts,
      hasReferences: s.has_references,
      sourceUrl: `${REPO_URL}/blob/main/claude/skills/${s.path}`,
    }))
    .sort((a, b) => a.slug.localeCompare(b.slug));

  const dupes = skills.filter((s, i) => skills.findIndex((o) => o.slug === s.slug) !== i);
  if (dupes.length > 0) {
    throw new Error(`Duplicate skill slugs: ${dupes.map((d) => d.slug).join(', ')}`);
  }

  // The YAML's declared count has drifted from the actual array before. Trust the
  // array, but surface the discrepancy — silent drift is how a catalog rots.
  if (parsed.metadata.total_skills !== skills.length) {
    console.warn(
      `  ! SKILLS.yaml declares total_skills=${parsed.metadata.total_skills} but contains ${skills.length}. Using ${skills.length}.`,
    );
  }

  const categories = Object.entries(parsed.categories).map(([id, label]) => ({
    id,
    label,
    count: skills.filter((s) => s.category === id).length,
  }));

  const orphans = skills.filter((s) => !parsed.categories[s.category]);
  if (orphans.length > 0) {
    throw new Error(`Skills with unknown category: ${orphans.map((s) => s.slug).join(', ')}`);
  }

  return { skills, categories };
}

function buildAgents() {
  const files = readdirSync(AGENTS_DIR).filter((f) => f.endsWith('.md'));

  return files
    .map((file) => {
      const { data } = matter(readFileSync(join(AGENTS_DIR, file), 'utf8'));
      const fm = agentFrontmatterSchema.parse(data);

      return {
        slug: toSlug(fm.name),
        name: fm.name,
        description: cleanAgentDescription(fm.description),
        tools: fm.tools ? fm.tools.split(',').map((t) => t.trim()) : [],
        model: fm.model ?? null,
        sourceUrl: `${REPO_URL}/blob/main/claude/agents/${file}`,
      };
    })
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

function main() {
  if (!existsSync(KIT)) {
    console.error(`Vendored kit not found at ${KIT}`);
    console.error('This script needs the AgentKit Engineer checkout. Skipping is safe:');
    console.error('the committed JSON in src/data/ is what the build actually uses.');
    process.exit(1);
  }

  const { skills, categories } = buildSkills();
  const agents = buildAgents();

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(join(OUT_DIR, 'skills.generated.json'), JSON.stringify(skills, null, 2) + '\n');
  writeFileSync(join(OUT_DIR, 'agents.generated.json'), JSON.stringify(agents, null, 2) + '\n');
  writeFileSync(
    join(OUT_DIR, 'categories.generated.json'),
    JSON.stringify(categories, null, 2) + '\n',
  );

  console.log(`✓ ${skills.length} skills`);
  console.log(`✓ ${agents.length} agents`);
  console.log(`✓ ${categories.length} categories`);
  console.log(`  → ${OUT_DIR}`);
}

main();
