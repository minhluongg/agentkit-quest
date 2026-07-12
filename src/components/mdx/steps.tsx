import type { ReactNode } from 'react';

/**
 * Numbered walkthrough. The counter lives in CSS so steps renumber themselves
 * when one is inserted — a hand-numbered list always drifts.
 */
export function Steps({ children }: { children: ReactNode }) {
  return (
    <div className="my-6 flex flex-col [counter-reset:step]">{children}</div>
  );
}

export function Step({ children }: { children: ReactNode }) {
  return (
    <div className="relative border-l border-border pt-1 pb-6 pl-8 last:border-l-transparent last:pb-0 [counter-increment:step]">
      <span
        aria-hidden="true"
        className="absolute top-0 -left-[15px] flex size-[30px] items-center justify-center rounded-full border border-border bg-muted font-mono text-xs font-semibold text-foreground before:content-[counter(step)]"
      />
      <div className="[&>*:first-child]:mt-0 [&>h3]:text-base [&>h3]:font-medium">{children}</div>
    </div>
  );
}
