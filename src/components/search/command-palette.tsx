'use client';

import { FileText, Bot, Terminal, Search, CornerDownLeft, LoaderCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { SearchEntry, SearchEntryType } from '@/lib/search-index';
import { scoreEntry, tokenize } from '@/lib/search-match';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/utils';

const TYPE_ICON: Record<SearchEntryType, typeof FileText> = {
  guide: FileText,
  skill: Terminal,
  agent: Bot,
};

const MAX_RESULTS = 12;
const LISTBOX_ID = 'search-results';

/** Focusable elements inside the dialog, for the focus trap. */
const FOCUSABLE = 'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])';

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [index, setIndex] = useState<SearchEntry[] | null>(null);

  const triggerRef = useRef<HTMLElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const results = useMemo(() => {
    if (!index) return [];
    const tokens = tokenize(query);
    if (tokens.length === 0) return [];

    return index
      .map((entry) => ({
        entry,
        score: scoreEntry(
          { title: entry.title, description: entry.description, terms: entry.terms },
          tokens,
        ),
      }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_RESULTS)
      .map((r) => r.entry);
  }, [index, query]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    setActive(0);
    // Return focus to whatever opened the palette. document.body is not focusable,
    // so fall back to the document — otherwise focus is silently lost.
    triggerRef.current?.focus?.();
  }, []);

  const openPalette = useCallback((trigger?: HTMLElement | null) => {
    const el = trigger ?? (document.activeElement as HTMLElement | null);
    triggerRef.current = el && el !== document.body ? el : null;
    setOpen(true);
    track('search_open', {});
  }, []);

  const select = useCallback(
    (entry: SearchEntry) => {
      track('search_select', { href: entry.href, type: entry.type });
      close();
      router.push(entry.href);
    },
    [close, router],
  );

  // ⌘K / Ctrl+K. Only counts as an "open" event when it actually opens.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((prev) => {
          if (prev) return false;
          triggerRef.current = document.activeElement as HTMLElement | null;
          track('search_open', {});
          return true;
        });
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    function onOpen(event: Event) {
      openPalette((event as CustomEvent<HTMLElement | null>).detail);
    }
    window.addEventListener('agentkit:open-search', onOpen);
    return () => window.removeEventListener('agentkit:open-search', onOpen);
  }, [openPalette]);

  // Fetch the index once, on first open.
  useEffect(() => {
    if (!open || index) return;

    let cancelled = false;
    fetch('/search-index.json')
      .then((res) => res.json())
      .then((data: SearchEntry[]) => {
        if (!cancelled) setIndex(data);
      })
      .catch(() => {
        if (!cancelled) setIndex([]);
      });

    return () => {
      cancelled = true;
    };
  }, [open, index]);

  // Lock background scroll while open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Keep the highlighted option in view — with 12 results in a scrolling list,
  // arrowing past the fold otherwise moves the selection off screen.
  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  if (!open) return null;

  /** Focus trap: Tab must not escape the dialog into the page behind it. */
  function trapFocus(event: React.KeyboardEvent) {
    if (event.key !== 'Tab') return;

    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
    if (!focusable || focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) return;

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function onKeyDown(event: React.KeyboardEvent) {
    trapFocus(event);

    if (event.key === 'Escape') {
      event.preventDefault();
      close();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((i) => (results.length === 0 ? 0 : (i + 1) % results.length));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((i) => (results.length === 0 ? 0 : (i - 1 + results.length) % results.length));
    } else if (event.key === 'Enter') {
      const entry = results[active];
      if (entry) {
        event.preventDefault();
        select(entry);
      }
    }
  }

  const activeId = results[active] ? `search-option-${active}` : undefined;

  return (
    <div
      className="fixed inset-0 z-(--z-index-modal) flex items-start justify-center bg-black/60 p-4 pt-[10vh] backdrop-blur-sm"
      role="presentation"
      onClick={close}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Search AgentKit Quest"
        className="flex w-full max-w-xl flex-col overflow-hidden rounded-[var(--radius-lg)] border border-border bg-popover shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              // Reset the highlight here rather than in an effect — an effect
              // would fire a second render pass on every keystroke.
              setActive(0);
            }}
            placeholder="Search guides, skills, agents…"
            aria-label="Search"
            // Combobox semantics: without aria-activedescendant a screen reader
            // announces nothing as the user arrows through results, because focus
            // stays on the input.
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls={LISTBOX_ID}
            aria-activedescendant={activeId}
            aria-autocomplete="list"
            autoComplete="off"
            className="h-14 w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden shrink-0 rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:block">
            ESC
          </kbd>
        </div>

        <ul
          ref={listRef}
          id={LISTBOX_ID}
          role="listbox"
          aria-label="Search results"
          className="max-h-[50vh] overflow-y-auto p-2"
        >
          {index === null && (
            <li role="presentation" className="flex justify-center px-3 py-8">
              <LoaderCircle
                className="size-5 animate-spin text-muted-foreground"
                aria-label="Loading search index"
              />
            </li>
          )}

          {index !== null && query.trim().length === 0 && (
            <li role="presentation" className="px-3 py-8 text-center text-sm text-muted-foreground">
              Search {index.length} guides, skills, and agents.
            </li>
          )}

          {index !== null && query.trim().length > 0 && results.length === 0 && (
            <li role="presentation" className="px-3 py-8 text-center text-sm text-muted-foreground">
              No results for “{query}”.
            </li>
          )}

          {results.map((entry, i) => {
            const Icon = TYPE_ICON[entry.type];
            const isActive = i === active;

            return (
              // role="presentation" on the <li>: a listitem is not a valid child
              // of a listbox, and the option role belongs on the interactive node.
              <li key={entry.id} role="presentation">
                <button
                  type="button"
                  id={`search-option-${i}`}
                  role="option"
                  data-index={i}
                  aria-selected={isActive}
                  tabIndex={-1}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => select(entry)}
                  className={cn(
                    'flex w-full cursor-pointer items-start gap-3 rounded-[var(--radius)] px-3 py-2.5 text-left transition-colors duration-200',
                    isActive ? 'bg-muted' : 'bg-transparent',
                  )}
                >
                  <Icon
                    className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-foreground">
                      {entry.title}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {entry.description}
                    </span>
                  </span>
                  {isActive && (
                    <CornerDownLeft
                      className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/** Fires the event the palette listens for. Used by the header and the hero. */
export function openSearch(trigger?: HTMLElement | null) {
  window.dispatchEvent(new CustomEvent('agentkit:open-search', { detail: trigger ?? null }));
}
