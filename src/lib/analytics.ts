/**
 * Thin event wrapper. Vercel Analytics is wired in later (Phase 06); until then
 * this is a no-op in production and a console trace in development.
 *
 * The point of having it now is that every affiliate CTA already reports its
 * campaign — so when the sink is connected there is no code to go back and add,
 * and no lost history of which placements earn.
 */
type EventName = 'affiliate_click' | 'search_open' | 'search_select';

export function track(event: EventName, payload: Record<string, unknown> = {}): void {
  if (typeof window === 'undefined') return;

  if (process.env.NODE_ENV === 'development') {
    console.debug(`[track] ${event}`, payload);
    return;
  }

  const w = window as typeof window & {
    va?: (event: 'event', props: { name: string } & Record<string, unknown>) => void;
  };
  w.va?.('event', { name: event, ...payload });
}
