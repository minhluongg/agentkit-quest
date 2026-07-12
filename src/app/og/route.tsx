import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';
import { siteConfig } from '@/lib/site';

export const contentType = 'image/png';

/**
 * Dynamic OG images. A dev-tools site gets its first traffic from X, Reddit, HN,
 * and Discord — channels where the social card IS the click-through rate. A
 * generic static image throws that away.
 */
export function GET(request: NextRequest) {
  const title = request.nextUrl.searchParams.get('title') ?? siteConfig.name;

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
    { width: 1200, height: 630 },
  );
}
