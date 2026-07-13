import { test, expect } from '@playwright/test';

/**
 * The active filter chip's count must be readable.
 *
 * It shipped as `text-primary-foreground/70` on `bg-primary` — a 70% opacity that composited
 * to **3.19:1** in dark and **3.34:1** in light, against a 4.5:1 requirement. Twelve-pixel
 * text carrying real information (how many skills are in the category) was failing WCAG AA
 * while looking, to the person who wrote it, merely subdued.
 *
 * Contrast is not a thing to eyeball. It is a number, so it is measured — composited from
 * the real rendered colours, in the real browser, with the real opacity applied.
 */

const AA_NORMAL_TEXT = 4.5;

/** WCAG 2.x relative luminance. */
function luminance([r, g, b]: number[]): number {
  const channel = (v: number) => {
    const c = (v ?? 0) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r!) + 0.7152 * channel(g!) + 0.0722 * channel(b!);
}

function contrast(fg: number[], bg: number[]): number {
  const [light, dark] = [luminance(fg), luminance(bg)].sort((a, b) => b - a) as [number, number];
  return (light + 0.05) / (dark + 0.05);
}

/** `rgb(15 23 42 / 0.7)` or `rgb(15, 23, 42)` → [r, g, b, a]. */
function parse(color: string): number[] {
  const parts = color.match(/[\d.]+/g)?.map(Number) ?? [];
  return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0, parts[3] ?? 1];
}

/** Alpha-composite the text colour over its background — the ratio the eye actually sees. */
function composite(fg: number[], bg: number[]): number[] {
  const a = fg[3] ?? 1;
  return [0, 1, 2].map((i) => (fg[i] ?? 0) * a + (bg[i] ?? 0) * (1 - a));
}

for (const theme of ['light', 'dark'] as const) {
  test(`the active chip's count passes WCAG AA in ${theme}`, async ({ page }) => {
    // next-themes is configured `attribute="class"` with `defaultTheme="dark"`, so it reads
    // localStorage and stamps a class — it does not follow `prefers-color-scheme`. An
    // earlier version of this test used `emulateMedia({ colorScheme })` and measured the
    // dark theme twice while reporting one of the runs as "light".
    await page.addInitScript((value) => {
      window.localStorage.setItem('theme', value);
    }, theme);

    await page.goto('/en/skills');
    await expect(page.locator('html')).toHaveClass(new RegExp(theme));

    // The "All" chip is active on load.
    const count = page.locator('button[aria-pressed="true"] span').first();
    await expect(count).toBeVisible();

    const { fg, bg } = await count.evaluate((el) => ({
      fg: getComputedStyle(el).color,
      bg: getComputedStyle(el.closest('button')!).backgroundColor,
    }));

    const background = parse(bg);
    const ratio = contrast(composite(parse(fg), background), background);

    expect(
      ratio,
      `count is ${ratio.toFixed(2)}:1 against the chip fill — WCAG AA needs ${AA_NORMAL_TEXT}:1`,
    ).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
  });
}

test('filter chips are a real touch target', async ({ page }) => {
  await page.goto('/en/skills');

  const chip = page.locator('button[aria-pressed]').first();
  const box = await chip.boundingBox();

  // 44px is the mobile-guideline floor, and these are the primary control on the page.
  // They shipped at 30px.
  expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
});
