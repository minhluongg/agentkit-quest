import { test, expect } from '@playwright/test';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * The page must never scroll sideways.
 *
 * Fenced code blocks were given `overflow-x: auto` and tables were not — and a table is the
 * worse case, because it has no soft wrap points, so its columns force a minimum width and
 * the whole document scrolls behind it. At a 360px viewport,
 * `/guides/agentkit-vs-free-alternatives` measured a **478px** body: the reader dragged the
 * entire page to read one row.
 *
 * It shipped that way because nothing measured it. A wide table looks fine on a laptop, and
 * the CSS that would have caught it does not exist — this is only observable in a browser at
 * a phone width. So it is asserted at a phone width.
 *
 * Every guide containing a table is tested, derived from the content rather than listed, so
 * a new guide with a new table is covered the day it lands.
 */

const ROOT = join(import.meta.dirname, '..');
const PHONE = { width: 360, height: 800 };

/** A markdown table row: `| … | … |`. */
const HAS_TABLE = /^\|.*\|\s*$/m;

const guidesWithTables = readdirSync(join(ROOT, 'content/guides'))
  .filter((file) => file.endsWith('.mdx'))
  .filter((file) => HAS_TABLE.test(readFileSync(join(ROOT, 'content/guides', file), 'utf8')))
  .map((file) => file.replace(/\.mdx$/, ''));

test('the guides under test actually contain tables', () => {
  // Otherwise the loop below is empty and every assertion passes by asserting nothing.
  expect(guidesWithTables.length).toBeGreaterThan(0);
});

test.describe('no page scrolls sideways on a phone', () => {
  test.use({ viewport: PHONE });

  for (const slug of guidesWithTables) {
    test(`/guides/${slug}`, async ({ page }) => {
      await page.goto(`/en/guides/${slug}`);

      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);

      // Sub-pixel layout rounding can produce 360.5 → 361. Anything beyond that is a real
      // overflow, not a rounding artifact.
      expect(scrollWidth, `body overflows the viewport by ${scrollWidth - PHONE.width}px`).toBeLessThanOrEqual(
        PHONE.width + 1,
      );
    });
  }

  // The two hubs are the most-linked pages on the site and carry the widest grids.
  for (const path of ['/en', '/en/skills']) {
    test(path, async ({ page }) => {
      await page.goto(path);
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(scrollWidth).toBeLessThanOrEqual(PHONE.width + 1);
    });
  }
});
