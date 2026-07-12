'use client';

import { Search } from 'lucide-react';
import { useRef } from 'react';
import { openSearch } from '@/components/search/command-palette';
import { cn } from '@/lib/utils';

export function SearchTrigger({
  className,
  size = 'sm',
}: {
  className?: string;
  size?: 'sm' | 'lg';
}) {
  const ref = useRef<HTMLButtonElement>(null);

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => openSearch(ref.current)}
      aria-label="Search guides, skills, and agents"
      className={cn(
        'flex cursor-pointer items-center gap-3 rounded-[var(--radius)] border border-border bg-surface text-muted-foreground transition-colors duration-200 hover:border-primary hover:text-foreground',
        size === 'sm' ? 'h-11 w-full max-w-64 px-3 text-sm' : 'h-14 w-full px-5 text-base',
        className,
      )}
    >
      <Search className={cn('shrink-0', size === 'sm' ? 'size-4' : 'size-5')} aria-hidden="true" />
      {/* truncate + nowrap: the header variant is narrow and this label wrapped
          to two lines, which broke the 44px control height. */}
      <span className="flex-1 truncate text-left whitespace-nowrap">
        {size === 'sm' ? 'Search…' : 'Search guides, skills, agents…'}
      </span>
      <kbd className="hidden shrink-0 rounded border border-border px-1.5 py-0.5 font-mono text-[10px] sm:block">
        ⌘K
      </kbd>
    </button>
  );
}
