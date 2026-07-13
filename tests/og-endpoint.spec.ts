import { test, expect } from '@playwright/test';

/**
 * `/og` is the only endpoint on this site that executes per request. Everything else is a
 * prerendered file on a CDN. That makes it the entire runtime surface — and it shipped
 * uncached and unbounded, so a loop over distinct `?title=` values missed the CDN every
 * time and billed a fresh function invocation per request, each rasterizing a 1200×630 PNG.
 * Denial of wallet.
 *
 * Both guards are easy to remove by accident, and neither failure is visible: the images
 * keep rendering, the bill just grows. So they are asserted here.
 */

const IMMUTABLE = /max-age=31536000/;

test('the OG image is cached', async ({ request }) => {
  const response = await request.get('/og?title=test');

  expect(response.status()).toBe(200);

  // `export const revalidate` does NOT do this. ImageResponse builds its own Response and
  // its header wins over Next's segment config — and the header it picks defaults to
  // `no-cache, no-store` even in a production build. The route sets the header explicitly
  // for exactly that reason; if someone deletes that line, this test is the only thing
  // that notices.
  const cacheControl = response.headers()['cache-control'] ?? '';
  expect(cacheControl).toMatch(IMMUTABLE);
  expect(cacheControl).not.toContain('no-store');
});

test('a hostile title cannot ask for unbounded work', async ({ request }) => {
  const short = await request.get(`/og?title=${'A'.repeat(200)}`);
  const absurd = await request.get(`/og?title=${'A'.repeat(5000)}`);

  expect(short.status()).toBe(200);
  expect(absurd.status()).toBe(200);

  // Both titles are truncated to the same cap, so they rasterize the same pixels. Identical
  // bytes out is the strongest available proof that the 5000-char title did not cost more
  // work than the 200-char one.
  expect(Buffer.from(await absurd.body()).equals(Buffer.from(await short.body()))).toBe(true);
});

test('the image still renders', async ({ request }) => {
  const response = await request.get('/og?title=hello');
  const body = Buffer.from(await response.body());

  expect(response.headers()['content-type']).toContain('image/png');
  // PNG magic number — a guard against a "fix" that caches an error page perfectly.
  expect(body.subarray(1, 4).toString()).toBe('PNG');
});
