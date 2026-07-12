import { Info, TriangleAlert, Lightbulb, OctagonAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type CalloutType = 'info' | 'warn' | 'tip' | 'danger';

const STYLES: Record<CalloutType, { icon: typeof Info; className: string; label: string }> = {
  info: { icon: Info, className: 'border-primary/40 bg-primary/5', label: 'Note' },
  tip: { icon: Lightbulb, className: 'border-success/40 bg-success/5', label: 'Tip' },
  warn: { icon: TriangleAlert, className: 'border-warning/40 bg-warning/5', label: 'Warning' },
  danger: {
    icon: OctagonAlert,
    className: 'border-destructive/40 bg-destructive/5',
    label: 'Caution',
  },
};

export function Callout({
  type = 'info',
  title,
  children,
}: {
  type?: CalloutType;
  title?: string;
  children: ReactNode;
}) {
  const { icon: Icon, className, label } = STYLES[type];

  return (
    <div className={cn('my-6 flex gap-3 rounded-[var(--radius)] border p-4', className)}>
      <Icon className="mt-0.5 size-5 shrink-0 text-foreground" aria-hidden="true" />
      <div className="min-w-0 flex-1 text-sm leading-relaxed [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
        <p className="mb-1 font-medium text-foreground">{title ?? label}</p>
        {children}
      </div>
    </div>
  );
}
