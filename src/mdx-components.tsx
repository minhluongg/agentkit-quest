import type { MDXComponents } from 'mdx/types';
import Link from 'next/link';
import type { ComponentProps } from 'react';
import { Callout } from '@/components/mdx/callout';
import { Steps, Step } from '@/components/mdx/steps';
import { LoopDiagram, RenameDiagram, PrimitivesDiagram } from '@/components/mdx/diagrams';
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

/**
 * A markdown table wide enough to overflow scrolls *itself*, not the page.
 *
 * Fenced code blocks already got this right (`.prose-doc pre` has `overflow-x: auto`).
 * Tables were missed, and they are worse: a table has no soft wrap points, so its columns
 * force a minimum width and the whole document scrolls sideways behind it. Measured at a
 * 360px viewport, `/guides/agentkit-vs-free-alternatives` had a 478px body — the reader
 * drags the entire page to read one row.
 *
 * 11 of 14 guides contain a table.
 *
 * `tabIndex={0}` is not decoration: a scroll container holding no focusable child is
 * unreachable by keyboard without it, so the columns off the right edge would be readable
 * with a mouse and invisible without one.
 */
function MdxTable(props: ComponentProps<'table'>) {
  return (
    <div className="my-6 overflow-x-auto" tabIndex={0} role="region" aria-label="Table">
      <table {...props} />
    </div>
  );
}

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    a: MdxLink,
    table: MdxTable,
    Callout,
    Steps,
    Step,
    KitCta,
    LoopDiagram,
    RenameDiagram,
    PrimitivesDiagram,
    ...components,
  };
}
