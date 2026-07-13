import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';
import { siteConfig } from '@/lib/site';

export const contentType = 'image/png';

/**
 * This is the only endpoint on the site that executes per request.
 *
 * Everything else is a prerendered file on a CDN — the other two route handlers
 * both export `force-static`. That makes this route the entire runtime attack
 * surface, and it was left uncached and unbounded: every distinct `?title=` was a
 * CDN miss, so a loop over random titles bypassed the cache completely and billed
 * a fresh function invocation per request, each one rasterizing a 1200×630 PNG
 * through satori. Denial of wallet, not a breach — but it is the owner's bill.
 *
 * Two mitigations, and only one of them is where you would first look for it.
 *
 * The length cap bounds the work a single request can ask for. That one is easy.
 *
 * The cache header is not: `export const revalidate` does nothing here. `ImageResponse`
 * constructs its own `Response`, and the header it writes wins over Next's segment
 * config. Worse, the header it picks is chosen by a `NODE_ENV === 'development'` check
 * inside the bundled `@vercel/og` that does not evaluate the way you would expect in a
 * built app: a production `next build && next start` still answers
 * `cache-control: no-cache, no-store` — measured, not assumed.
 *
 * `no-store` tells every CDN in the path not to keep the image. So the only reliable fix
 * is to write the header ourselves and stop negotiating.
 */

/** One year. A given title's card is a pure function of that title; it never changes. */
const CACHE_CONTROL = 'public, immutable, no-transform, max-age=31536000';

/**
 * Long enough for any real page title on this site (the longest is ~70 chars), short
 * enough that no request can ask satori to lay out a novel.
 */
const MAX_TITLE = 120;

/**
 * Dynamic OG images. A dev-tools site gets its first traffic from X, Reddit, HN,
 * and Discord — channels where the social card IS the click-through rate. A
 * generic static image throws that away.
 */
export function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get('title') ?? siteConfig.name;
  const title = raw.length > MAX_TITLE ? `${raw.slice(0, MAX_TITLE - 1)}…` : raw;

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#0f172a',
          padding: 72,
          fontFamily: 'monospace',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: '#3b82f6', fontSize: 28 }}>/</span>
          <span style={{ color: '#94a3b8', fontSize: 28 }}>agentkit.quest</span>
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: title.length > 60 ? 56 : 68,
            fontWeight: 700,
            color: '#f1f5f9',
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 56, height: 4, backgroundColor: '#3b82f6' }} />
          <span style={{ color: '#94a3b8', fontSize: 24 }}>
            The independent AgentKit knowledge base
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: { 'cache-control': CACHE_CONTROL },
    },
  );
}
