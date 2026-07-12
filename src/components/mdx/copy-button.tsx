'use client';

import { Check, Copy } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export function CopyButton({ value, className }: { value: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    try {
      // Rejects on insecure origins and when clipboard permission is denied.
      // Unhandled, the button just did nothing and gave no feedback at all.
      await navigator.clipboard.writeText(value);
      setCopied(true);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Nothing useful to recover with — leave the icon unchanged rather than
      // claiming a copy that did not happen.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? 'Copied' : 'Copy to clipboard'}
      className={cn(
        'flex size-8 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] border border-border bg-background text-muted-foreground transition-colors duration-200 hover:text-foreground',
        className,
      )}
    >
      {copied ? (
        <Check className="size-3.5 text-success" aria-hidden="true" />
      ) : (
        <Copy className="size-3.5" aria-hidden="true" />
      )}
    </button>
  );
}
