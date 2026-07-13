import { test, expect } from '@playwright/test';

/**
 * The mobile drawer must not leak keyboard focus into the page behind it.
 *
 * It covered the page and locked its scroll, but never trapped focus — so six presses of
 * Tab walked out of the drawer and into a document that was scroll-locked and visually
 * hidden. A keyboard user was tabbing through controls they could not see, with no way to
 * tell where they were.
 *
 * The command palette in the same codebase already did this correctly. A pattern solved
 * once and not carried across to its sibling is the shape of most real bugs in a careful
 * codebase — so it is asserted here, for the sibling that was missed.
 */

test.use({ viewport: { width: 390, height: 844 } });

/** Is the focused element inside the drawer? */
const focusIsInDrawer = () => {
  const drawer = document.getElementById('mobile-nav');
  return !!drawer && !!document.activeElement && drawer.contains(document.activeElement);
};

test('Tab cannot escape the open drawer', async ({ page }) => {
  await page.goto('/en');
  await page.getByRole('button', { name: 'Open menu' }).click();

  const drawer = page.getByRole('dialog', { name: 'Menu' });
  await expect(drawer).toBeVisible();

  // Focus must land inside on open — otherwise the first Tab starts from the trigger and
  // the trap has nothing to hold.
  expect(await page.evaluate(focusIsInDrawer)).toBe(true);

  // Twice round the cycle. One lap could pass by luck if the drawer happened to be the last
  // thing in the tab order; two proves it is wrapping.
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab');
    expect(await page.evaluate(focusIsInDrawer), `focus escaped on Tab #${i + 1}`).toBe(true);
  }

  // And backwards — Shift+Tab off the first element must wrap to the last, not step out.
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Shift+Tab');
    expect(await page.evaluate(focusIsInDrawer), `focus escaped on Shift+Tab #${i + 1}`).toBe(true);
  }
});

test('Escape closes the drawer and returns focus to the button that opened it', async ({ page }) => {
  await page.goto('/en');

  const trigger = page.getByRole('button', { name: 'Open menu' });
  await trigger.click();
  await expect(page.getByRole('dialog', { name: 'Menu' })).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Menu' })).toBeHidden();

  // Without this, a keyboard user is dropped at the top of the document with no idea where
  // they were.
  await expect(page.getByRole('button', { name: 'Open menu' })).toBeFocused();
});
