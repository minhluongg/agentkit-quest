'use client';

import { ArrowUpRight, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AffiliateLink } from '@/components/affiliate/affiliate-link';
import { Button, buttonVariants } from '@/components/ui/button';
import { SearchTrigger } from '@/components/search/search-trigger';
import { siteConfig } from '@/lib/site';
import { cn } from '@/lib/utils';

export function MobileNav() {
  const [open, setOpen] = useState(false);

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

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => setOpen((prev) => !prev)}
      >
        {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
      </Button>

      {open && (
        <div
          id="mobile-nav"
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
