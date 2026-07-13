/**
 * Keeping Tab inside an open overlay.
 *
 * This lived inside the command palette, correctly implemented, while the mobile drawer —
 * the other thing on this site that covers the page — had nothing. Opening the drawer and
 * pressing Tab six times put focus on the page behind it: scroll-locked, visually covered,
 * and completely invisible to the person tabbing through it.
 *
 * A pattern solved once and not carried across to its sibling is the shape of most of the
 * real bugs in a careful codebase, so it now lives in one place that both import.
 */

/**
 * Deliberately excludes `[tabindex="-1"]`: an element made programmatically focusable is
 * not part of the tab order, and cycling to it would strand the user somewhere they cannot
 * Tab out of.
 */
export const FOCUSABLE =
  'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])';

/**
 * Wrap Tab and Shift+Tab at the container's edges.
 *
 * Call from the container's `onKeyDown`. Does nothing for other keys, and nothing when the
 * container holds no focusable child — in that case there is no trap to enforce, and
 * swallowing Tab would lock the user in place instead of merely containing them.
 */
export function trapFocus(event: React.KeyboardEvent, container: HTMLElement | null) {
  if (event.key !== 'Tab' || !container) return;

  const focusable = container.querySelectorAll<HTMLElement>(FOCUSABLE);
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (!first || !last) return;

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}
