import skillsData from '@/data/skills.generated.json';
import agentsData from '@/data/agents.generated.json';
import categoriesData from '@/data/categories.generated.json';

export type Skill = (typeof skillsData)[number];
export type Agent = (typeof agentsData)[number];
export type Category = (typeof categoriesData)[number];

export const skills: Skill[] = skillsData;
export const agents: Agent[] = agentsData;
export const categories: Category[] = categoriesData;

export function getSkill(slug: string): Skill | undefined {
  return skills.find((s) => s.slug === slug);
}

export function getAgent(slug: string): Agent | undefined {
  return agents.find((a) => a.slug === slug);
}

export function getCategory(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}

export function getSkillsByCategory(id: string): Skill[] {
  return skills.filter((s) => s.category === id);
}

/** Stable, evenly-spread pseudo-random weight derived from a pair of slugs. */
function tieBreak(a: string, b: string): number {
  let hash = 2166136261;
  for (const char of `${a}:${b}`) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 0xffffffff;
}

/**
 * Related skills, ranked by shared category first, then keyword overlap.
 *
 * Most pairs in a category share no keywords, so they all score identically. With
 * a plain stable sort that tie resolved to array order — and the array is sorted
 * alphabetically — so the first four skills of each category absorbed every
 * inbound link on the site while 18 skills received none. The hash tie-break
 * spreads those links deterministically instead.
 */
export function getRelatedSkills(slug: string, limit = 4): Skill[] {
  const skill = getSkill(slug);
  if (!skill) return [];

  const keywords = new Set(skill.keywords);

  return skills
    .filter((s) => s.slug !== slug)
    .map((s) => {
      const overlap = s.keywords.filter((k) => keywords.has(k)).length;
      const sameCategory = s.category === skill.category ? 1 : 0;
      return { skill: s, score: sameCategory * 2 + overlap + tieBreak(slug, s.slug) };
    })
    .filter((r) => r.score >= 1)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.skill);
}
