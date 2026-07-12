import type { ReactNode } from 'react';

// Route group keeps docs chrome independent from the marketing pages: a change
// to the docs container can never reflow the landing page.
export default function DocsLayout({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:py-14">{children}</div>;
}
