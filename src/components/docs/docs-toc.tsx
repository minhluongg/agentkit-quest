'use client';

import * as Base from 'fumadocs-core/toc';
import type { TableOfContents } from 'fumadocs-core/toc';
import { useRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * Right-hand table of contents. Hidden below 1280px — at that width the article
 * column is already the priority, and a third column would squeeze the prose
 * under the 65ch readability floor.
 */
export function DocsToc({ items }: { items: TableOfContents }) {
  const containerRef = useRef<HTMLElement>(null);

  if (items.length === 0) return null;

  return (
    <Base.AnchorProvider toc={items}>
      <aside ref={containerRef} className="sticky top-24 hidden h-fit w-56 shrink-0 xl:block">
        <p className="mb-3 text-xs font-semibold tracking-wider text-foreground uppercase">
          On this page
        </p>
        <Base.ScrollProvider containerRef={containerRef}>
          <TocList items={items} />
        </Base.ScrollProvider>
      </aside>
    </Base.AnchorProvider>
  );
}

/**
 * Deliberately not fumadocs' <TOCItem>: that component marks EVERY heading
 * currently in the viewport as active, so on a short page all four links light
 * up at once and the highlight stops meaning anything. useActiveAnchor() returns
 * the single closest heading, which is what a reader expects "you are here" to mean.
 */
function TocList({ items }: { items: TableOfContents }) {
  const active = Base.useActiveAnchor();

  return (
    <nav aria-label="Table of contents" className="flex flex-col gap-1 text-sm">
      {items.map((item) => {
        const id = item.url.replace(/^#/, '');
        const isActive = active === id;

        return (
          <a
            key={item.url}
            href={item.url}
            aria-current={isActive ? 'location' : undefined}
            className={cn(
              'cursor-pointer border-l py-1 pr-2 transition-colors duration-200',
              isActive
                ? 'border-primary font-medium text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
            style={{ paddingLeft: `${0.75 + Math.max(0, item.depth - 2) * 0.75}rem` }}
          >
            {item.title}
          </a>
        );
      })}
    </nav>
  );
}
