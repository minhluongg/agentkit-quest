import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Required, not optional. The FTC requires disclosure of affiliate relationships,
 * and Google's affiliate-content guidance explicitly rewards sites that are
 * upfront about them. It also just builds trust with the developers we want back.
 */
export function AffiliateDisclosure({
  variant = 'block',
  className,
}: {
  variant?: 'block' | 'inline';
  className?: string;
}) {
  const text =
    'AgentKit Quest is an independent resource. Links to AgentKit are affiliate links — if you buy through them we earn a commission at no extra cost to you. It never changes what we write.';

  if (variant === 'inline') {
    return (
      <p className={cn('text-xs leading-relaxed text-muted-foreground', className)}>{text}</p>
    );
  }

  return (
    <aside
      className={cn(
        'flex gap-3 rounded-[var(--radius)] border border-border bg-muted/50 p-4',
        className,
      )}
    >
      <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <p className="text-xs leading-relaxed text-muted-foreground">{text}</p>
    </aside>
  );
}
