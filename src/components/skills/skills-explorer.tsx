'use client';

import { Search, X } from 'lucide-react';
import { useMemo, useState, useSyncExternalStore } from 'react';
import { LinkCard } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Skill, Category } from '@/lib/catalog';
import { scoreEntry, tokenize } from '@/lib/search-match';
import { cn } from '@/lib/utils';

interface SkillsExplorerProps {
  skills: Skill[];
  categories: Category[];
}

function subscribeToUrl(onChange: () => void): () => void {
  window.addEventListener('popstate', onChange);
  return () => window.removeEventListener('popstate', onChange);
}

function getUrlSearch(): string {
  return window.location.search;
}

/**
 * Filters ~88 records in memory. No API route, no loading state.
 *
 * Deliberately does NOT call `useSearchParams()`. That hook forces Next to bail
 * out of static rendering for everything up to the nearest Suspense boundary, so
 * the prerendered /skills page contained a fallback div and ZERO links to the 88
 * skill pages — the crawler saw an empty hub, and the whole reference tier lost
 * its main entry point.
 *
 * Instead the full list renders on the server, and the URL is read from
 * `window.location` after mount purely to seed the filter UI.
 */
export function SkillsExplorer({ skills, categories }: SkillsExplorerProps) {
  // The URL is an external store, so read it with the primitive designed for that.
  // On the server the snapshot is empty (renders the full, crawlable list); on
  // hydration React swaps in the real one without a mismatch warning. Seeding the
  // same values from a useEffect + setState would fire a cascading render instead.
  const urlSearch = useSyncExternalStore(subscribeToUrl, getUrlSearch, () => '');

  const seed = useMemo(() => {
    const params = new URLSearchParams(urlSearch);
    return {
      // ?category= from the homepage grid, ?q= from the JSON-LD SearchAction.
      category: params.get('category') ?? undefined,
      query: params.get('q') ?? '',
    };
  }, [urlSearch]);

  // Once the user touches a control their choice wins over the URL seed.
  const [chosen, setChosen] = useState<{ category?: string; query: string } | null>(null);
  const { category, query } = chosen ?? seed;

  function apply(next: { category?: string; query: string }) {
    setChosen(next);
    syncUrl(next);
  }

  function syncUrl(next: { category?: string; query: string }) {
    const params = new URLSearchParams();
    if (next.category) params.set('category', next.category);
    if (next.query.trim()) params.set('q', next.query.trim());

    const qs = params.toString();
    // history.replaceState, not router.replace: this is UI state, not navigation.
    // It keeps filtered views linkable without re-running the RSC request.
    window.history.replaceState(null, '', qs ? `/skills?${qs}` : '/skills');
  }

  function selectCategory(next: string | undefined) {
    apply({ category: next, query });
  }

  function updateQuery(next: string) {
    apply({ category, query: next });
  }

  // Cards showed the raw category id ('dev-tools') while the filter chips showed
  // the label ('Development Tools') — the same thing under two names.
  const labelOf = useMemo(() => new Map(categories.map((c) => [c.id, c.label])), [categories]);

  const filtered = useMemo(() => {
    const tokens = tokenize(query);

    const byCategory = category ? skills.filter((s) => s.category === category) : skills;
    if (tokens.length === 0) return byCategory;

    return byCategory
      .map((skill) => ({
        skill,
        score: scoreEntry(
          {
            title: `${skill.invocation} ${skill.legacyInvocation}`,
            description: skill.description,
            terms: [skill.category, ...skill.keywords].join(' '),
          },
          tokens,
        ),
      }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((r) => r.skill);
  }, [skills, query, category]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex h-11 items-center gap-3 rounded-[var(--radius)] border border-border bg-surface px-3 focus-within:border-primary">
        <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <input
          type="text"
          value={query}
          onChange={(event) => updateQuery(event.target.value)}
          placeholder={`Filter ${skills.length} skills…`}
          aria-label="Filter skills"
          className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
        {query && (
          <button
            type="button"
            onClick={() => updateQuery('')}
            aria-label="Clear filter"
            className="cursor-pointer text-muted-foreground transition-colors duration-200 hover:text-foreground"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        <FilterChip active={!category} onClick={() => selectCategory(undefined)}>
          All <span>{skills.length}</span>
        </FilterChip>

        {categories.map((item) => (
          <FilterChip
            key={item.id}
            active={category === item.id}
            onClick={() => selectCategory(category === item.id ? undefined : item.id)}
          >
            {item.label} <span>{item.count}</span>
          </FilterChip>
        ))}
      </div>

      <p className="text-sm text-muted-foreground" aria-live="polite">
        {filtered.length} of {skills.length} skills
      </p>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-[var(--radius-lg)] border border-dashed border-border py-16 text-center">
          <p className="font-medium text-foreground">No skills match that filter.</p>
          <p className="text-sm text-muted-foreground">Try a different keyword or category.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((skill) => (
            <LinkCard
              key={skill.slug}
              href={`/skills/${skill.slug}`}
              title={skill.invocation}
              description={skill.description}
              className="[&_h3]:font-mono [&_h3]:text-sm"
              footer={
                <>
                  <Badge>{labelOf.get(skill.category) ?? skill.category}</Badge>
                  {skill.hasScripts && <Badge variant="outline">scripts</Badge>}
                </>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        // `min-h-11` = 44px. The chips were 30px — above the WCAG 2.2 AA floor of 24px, but
        // below the 44px touch target every mobile guideline asks for, and these are the
        // primary control on the page.
        //
        // `active:` is press feedback. There was none anywhere in the codebase, and on touch
        // there is no hover either — so a tap produced no acknowledgement at all until the
        // filter result changed.
        'flex min-h-11 cursor-pointer items-center gap-1.5 rounded-[var(--radius-sm)] border px-3 py-1.5 text-xs font-medium transition-colors duration-200 active:scale-[0.97]',
        // The chip owns the count's colour, in both states.
        //
        // It used to be `text-muted-foreground` hardcoded at the call site, with the active
        // chip overriding it to `text-primary-foreground/70` — a 70% opacity that composited
        // to 3.19:1, failing WCAG AA on 12px text that carries real information.
        //
        // Removing the override made it worse, not better: the span fell back to
        // `text-muted-foreground` — slate-400 on a blue fill — and measured **1.43:1**. The
        // fix was not to delete the override but to own the colour on both sides. Measured,
        // not reasoned about: the first attempt was a regression.
        active
          ? 'border-primary bg-primary text-primary-foreground [&_span]:text-primary-foreground'
          : 'border-border bg-surface text-foreground [&_span]:text-muted-foreground hover:border-primary',
      )}
    >
      {children}
    </button>
  );
}
