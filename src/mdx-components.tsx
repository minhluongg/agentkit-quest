import type { MDXComponents } from 'mdx/types';
import Link from 'next/link';
import type { ComponentProps } from 'react';
import { Callout } from '@/components/mdx/callout';
import { Steps, Step } from '@/components/mdx/steps';
import { KitCta } from '@/components/affiliate/kit-cta';
import { AffiliateLink } from '@/components/affiliate/affiliate-link';
import { isAgentKitUrl, pathOf } from '@/lib/affiliate';

/**
 * Guide authors write plain markdown links. A raw `[buy](https://agentkit.best/...)`
 * would ship with no `ref` param (unpaid commission) and no `rel="sponsored"`
 * (an undisclosed affiliate link — a manual-action risk). The ESLint rule that
 * guards this only covers `src/**`, never `content/**`.
 *
 * So the renderer itself catches them: any link to AgentKit is rewritten through
 * buildAffiliateUrl, whatever the author typed.
 */
function MdxLink({ href = '', children, ...props }: ComponentProps<'a'>) {
  if (isAgentKitUrl(href)) {
    return (
      <AffiliateLink path={pathOf(href)} campaign="article-cta">
        {children}
      </AffiliateLink>
    );
  }

  const isInternal = href.startsWith('/') || href.startsWith('#');
  if (isInternal) {
    return (
      <Link href={href} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  );
}

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    a: MdxLink,
    Callout,
    Steps,
    Step,
    KitCta,
    ...components,
  };
}
