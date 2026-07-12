import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { AffiliateLink } from '@/components/affiliate/affiliate-link';
import { SearchTrigger } from '@/components/search/search-trigger';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { MobileNav } from '@/components/layout/mobile-nav';
import { buttonVariants } from '@/components/ui/button';
import { siteConfig } from '@/lib/site';
import { cn } from '@/lib/utils';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-(--z-index-sticky) border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex shrink-0 cursor-pointer items-center gap-2 font-mono text-sm font-semibold text-foreground transition-colors duration-200 hover:text-primary"
        >
          <span className="text-primary">/</span>
          <span>agentkit.quest</span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="cursor-pointer rounded-[var(--radius-sm)] px-3 py-2 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              {item.title}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden lg:block">
            <SearchTrigger />
          </div>

          <ThemeToggle />

          <AffiliateLink
            campaign="nav"
            className={cn(
              buttonVariants({ variant: 'primary', size: 'sm' }),
              'hidden no-underline sm:inline-flex',
            )}
          >
            Get AgentKit
            <ArrowUpRight aria-hidden="true" />
          </AffiliateLink>

          <MobileNav />
        </div>
      </div>
    </header>
  );
}
