'use client';

import { ArrowUpRight, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AffiliateLink } from '@/components/affiliate/affiliate-link';
import { Button, buttonVariants } from '@/components/ui/button';
import { SearchTrigger } from '@/components/search/search-trigger';
import { FOCUSABLE, trapFocus } from '@/lib/focus-trap';
import { siteConfig } from '@/lib/site';
import { cn } from '@/lib/utils';

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // The drawer covered the page and locked its scroll, but never took focus. So Tab walked
  // straight out of it and into the page behind — scroll-locked, visually hidden, and
  // completely invisible to the person tabbing through it. Six presses and you were gone.
  //
  // The command palette in this same codebase already did this correctly. The drawer just
  // never got the same treatment.
  useEffect(() => {
    if (!open) return;
    drawerRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
  }, [open]);

  // Lock scroll while the drawer is open, otherwise the page behind it scrolls.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // The drawer is `md:hidden` but the state was not: opening the menu on a phone
  // and then rotating to tablet width hid the drawer AND its close button while
  // `open` stayed true — leaving body scroll locked with no way to unlock it.
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 768px)');
    function onChange(event: MediaQueryListEvent) {
      if (event.matches) setOpen(false);
    }
    desktop.addEventListener('change', onChange);
    return () => desktop.removeEventListener('change', onChange);
  }, []);

  // Closing must return focus to the button that opened it — otherwise a keyboard user is
  // dropped at the top of the document with no idea where they were.
  //
  // Every path that closes the drawer has to go through here. The Escape handler below
  // originally called `setOpen(false)` directly, which closed the drawer and silently lost
  // focus; the test caught it.
  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') close();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [close]);

  return (
    <>
      <Button
        ref={triggerRef}
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => (open ? close() : setOpen(true))}
      >
        {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
      </Button>

      {open && (
        <div
          ref={drawerRef}
          id="mobile-nav"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          onKeyDown={(event) => trapFocus(event, drawerRef.current)}
          className="fixed inset-x-0 top-16 bottom-0 z-(--z-index-overlay) flex flex-col gap-6 border-t border-border bg-background p-6 md:hidden"
        >
          <SearchTrigger className="max-w-none" />

          <nav aria-label="Mobile" className="flex flex-col gap-1">
            {siteConfig.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="cursor-pointer rounded-[var(--radius)] px-3 py-3 text-base text-foreground transition-colors duration-200 hover:bg-muted"
              >
                {item.title}
              </Link>
            ))}
          </nav>

          {/* The header CTA is hidden below sm, so without this the drawer would be
              the one surface on mobile with no route to the affiliate link. */}
          <AffiliateLink
            campaign="nav"
            className={cn(buttonVariants({ variant: 'primary', size: 'md' }), 'no-underline')}
          >
            Get AgentKit
            <ArrowUpRight aria-hidden="true" />
          </AffiliateLink>
        </div>
      )}
    </>
  );
}
