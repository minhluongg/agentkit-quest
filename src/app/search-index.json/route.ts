import { buildSearchIndex } from '@/lib/search-index';

export const dynamic = 'force-static';

/**
 * The search index as a static asset.
 *
 * It used to be passed into <CommandPalette> from the root layout, which
 * serialized all 88 skills + 13 agents into the RSC payload of every single page
 * — a fixed ~40KB tax on LCP for a feature most visitors never open. Now it is one
 * cacheable file, fetched the first time someone actually opens the palette.
 */
export function GET() {
  return Response.json(buildSearchIndex());
}
