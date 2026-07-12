'use client';

import type { ReactNode } from 'react';
import { buildAffiliateUrl, type Campaign } from '@/lib/affiliate';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/utils';

interface AffiliateLinkProps {
  /** Path on agentkit.best, e.g. '/products/engineer'. */
  path?: string;
  campaign: Campaign;
  children: ReactNode;
  className?: string;
}

/**
 * The ONLY way to link to AgentKit.
 *
 * `rel="sponsored"` is required by Google's link-spam policy for affiliate links.
 * Omitting it is a manual-action risk for zero upside.
 */
export function AffiliateLink({
  path = '/',
  campaign,
  children,
  className,
}: AffiliateLinkProps) {
  const href = buildAffiliateUrl(path, campaign);

  return (
    <a
      href={href}
      target="_blank"
      rel="sponsored noopener noreferrer"
      className={cn('cursor-pointer', className)}
      onClick={() => track('affiliate_click', { campaign, path })}
    >
      {children}
    </a>
  );
}
