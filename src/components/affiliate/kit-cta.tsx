import { ArrowUpRight } from 'lucide-react';
import { AffiliateLink } from '@/components/affiliate/affiliate-link';
import { AffiliateDisclosure } from '@/components/affiliate/affiliate-disclosure';
import { buttonVariants } from '@/components/ui/button';
import { ENGINEER_PATH, type Campaign } from '@/lib/affiliate';
import { skills, agents } from '@/lib/catalog';
import { cn } from '@/lib/utils';

interface KitCtaProps {
  campaign?: Campaign;
  title?: string;
  body?: string;
  action?: string;
  path?: string;
  /** Show the disclosure inline. Use on the first CTA in an article. */
  showDisclosure?: boolean;
  className?: string;
}

/**
 * The in-article affiliate CTA. Also exported to MDX so guides can drop it in.
 * Copy is intentionally plain here — conversion copy is a later plan, and a
 * placeholder that oversells would be worse than one that under-sells.
 */
export function KitCta({
  campaign = 'article-cta',
  title = 'Get AgentKit Engineer',
  // Counts are interpolated, never typed. This default body renders inside every
  // guide on the site, so a hardcoded "88" would go silently wrong on twenty-odd
  // pages at once the day the kit ships skill 89.
  //
  // The referral link gives first-time buyers 20% off — a real reason to use it,
  // stated plainly. Confirmed from the affiliate dashboard (20% commission / 20% buyer discount).
  body = `${skills.length} skills, ${agents.length} agents, and the workflow layer this site documents. $99 one-time — 20% off through this link.`,
  action = 'Get AgentKit — 20% off',
  // Land on the product, not the homepage. The button says "View AgentKit
  // Engineer"; sending that click to agentkit.best/ makes the user find the
  // product again, and every extra click is conversion lost.
  path = ENGINEER_PATH,
  showDisclosure = false,
  className,
}: KitCtaProps) {
  return (
    <div
      className={cn(
        'my-8 flex flex-col gap-4 rounded-[var(--radius-lg)] border border-border bg-surface p-6',
        className,
      )}
    >
      <div className="flex flex-col gap-1.5">
        <h3 className="font-mono text-base font-semibold text-foreground">{title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
      </div>

      <AffiliateLink
        path={path}
        campaign={campaign}
        className={cn(buttonVariants({ variant: 'primary', size: 'md' }), 'self-start no-underline')}
      >
        {action}
        <ArrowUpRight aria-hidden="true" />
      </AffiliateLink>

      {showDisclosure && <AffiliateDisclosure variant="inline" />}
    </div>
  );
}
