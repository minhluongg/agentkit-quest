/**
 * The single source of truth for every outbound link to AgentKit.
 *
 * Nothing in this codebase may link to agentkit.best directly — a hand-written
 * href silently drops the `ref` param, and a dropped `ref` is unpaid commission
 * that nobody notices. An ESLint rule enforces this; see eslint.config.mjs.
 */

const AGENTKIT_BASE = 'https://agentkit.best';

/**
 * Where the click came from. One campaign per distinct placement — if two
 * different surfaces share a tag, the attribution data cannot tell them apart and
 * the "which placement earns?" question becomes unanswerable.
 */
export type Campaign =
  | 'nav' // header button + mobile drawer
  | 'hero' // homepage hero, next to the search box
  | 'home-cta' // homepage closing section
  | 'article-cta' // <KitCta> inside a guide body
  | 'skill-page' // skill reference page
  | 'agent-page' // agent reference page
  | 'footer'; // site footer, every page

/** The product we actually send people to. */
export const ENGINEER_PATH = '/products/engineer';

export function buildAffiliateUrl(path: string, campaign: Campaign): string {
  const url = new URL(path, AGENTKIT_BASE);

  // Unset ref is a valid state — the site works before the code is issued.
  const ref = process.env.NEXT_PUBLIC_AFFILIATE_REF;
  if (ref) url.searchParams.set('ref', ref);

  url.searchParams.set('utm_source', 'agentkit.quest');
  url.searchParams.set('utm_medium', 'affiliate');
  url.searchParams.set('utm_campaign', campaign);

  return url.toString();
}

/**
 * Detects a link that should have gone through buildAffiliateUrl(). Used by the
 * MDX link component, because guide authors write plain markdown links and would
 * otherwise ship un-tagged, un-disclosed affiliate links.
 */
export function isAgentKitUrl(href: string): boolean {
  try {
    return new URL(href).hostname.replace(/^www\./, '') === 'agentkit.best';
  } catch {
    return false;
  }
}

export function pathOf(href: string): string {
  try {
    const url = new URL(href);
    return `${url.pathname}${url.search}`;
  } catch {
    return '/';
  }
}
