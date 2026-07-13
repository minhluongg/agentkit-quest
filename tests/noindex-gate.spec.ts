import { test, expect } from '@playwright/test';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import skills from '../src/data/skills.generated.json' with { type: 'json' };

/**
 * The publish gate, asserted against the shipped HTML.
 *
 * This is the invariant the whole site rests on: a reference page is indexable only once
 * someone has written real content for it. Without it we would ship ~90 auto-generated
 * pages whose only content is a paraphrase of upstream metadata — the pattern Google
 * treats as scaled content abuse, where the penalty lands on the whole domain rather than
 * on the thin pages that earned it.
 *
 * `scripts/verify-build.ts` already checks the build output. These tests check what a
 * crawler actually receives, which is a different claim: they load the page over HTTP and
 * read the tag.
 *
 * Nothing here is hardcoded. The expected sets are derived from the catalog and from
 * `content/skills/`, so the day the kit ships skill 92 the test still describes reality —
 * a literal count would go quietly wrong instead.
 */

const ROOT = join(import.meta.dirname, '..');

const written = new Set(
  readdirSync(join(ROOT, 'content/skills'))
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => file.replace(/\.mdx$/, '')),
);

const publishedSlugs = skills.map((s) => s.slug).filter((slug) => written.has(slug));
const stubSlugs = skills.map((s) => s.slug).filter((slug) => !written.has(slug));

test('the catalog splits into published pages and stubs', () => {
  // If either side is empty the tests below would pass vacuously, asserting nothing.
  expect(publishedSlugs.length).toBeGreaterThan(0);
  expect(stubSlugs.length).toBeGreaterThan(0);
});

test.describe('a page with hand-written content is indexable', () => {
  for (const slug of publishedSlugs) {
    test(`/skills/${slug}`, async ({ page }) => {
      await page.goto(`/en/skills/${slug}`);

      const robots = page.locator('meta[name="robots"]');
      await expect(robots).toHaveAttribute('content', /(?<!no)index/);

      // A canonical is what stops the /en/ and /skills/ variants competing with each other.
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        'href',
        new RegExp(`/skills/${slug}$`),
      );
    });
  }
});

test.describe('a page without hand-written content is noindex', () => {
  for (const slug of stubSlugs) {
    test(`/skills/${slug}`, async ({ page }) => {
      await page.goto(`/en/skills/${slug}`);

      // `follow`, deliberately — not `nofollow`. A stub still passes link equity on to the
      // pages it points at; it just does not ask to be indexed itself.
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
        'content',
        /noindex/,
      );
    });
  }
});

test('the sitemap lists every published page and no stub', async ({ request }) => {
  const sitemap = await (await request.get('/sitemap.xml')).text();

  for (const slug of publishedSlugs) {
    expect(sitemap, `sitemap is missing published page /skills/${slug}`).toContain(
      `/skills/${slug}<`,
    );
  }

  for (const slug of stubSlugs) {
    expect(sitemap, `sitemap advertises noindex stub /skills/${slug}`).not.toContain(
      `/skills/${slug}<`,
    );
  }
});
