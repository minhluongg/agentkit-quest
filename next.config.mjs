import { createMDX } from 'fumadocs-mdx/next';

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  // Preview deployments must never be indexed — otherwise *.vercel.app URLs
  // compete with the production domain and split ranking signals.
  //
  // Gated on a POSITIVE preview signal, not on "is this Vercel production?".
  // The inverted form (`!== 'production'` → noindex) fails closed: any deploy
  // outside Vercel, or a change to Vercel's env naming, would silently apply
  // `noindex` to the entire site — with a green build and no warning — on a site
  // whose only traffic source is organic search.
  async headers() {
    const isPreview =
      process.env.VERCEL_ENV === 'preview' || process.env.VERCEL_ENV === 'development';
    if (!isPreview) return [];

    return [
      {
        source: '/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ];
  },
};

const withMDX = createMDX();

export default withMDX(config);
