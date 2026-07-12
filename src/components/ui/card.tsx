import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-lg)] border border-border bg-card p-5 text-card-foreground',
        className,
      )}
      {...props}
    />
  );
}

interface LinkCardProps {
  href: string;
  title: string;
  description?: string;
  /** Rendered under the description — badges, meta rows, etc. */
  footer?: ReactNode;
  className?: string;
}

/**
 * The workhorse card. Hover feedback is border + background only: a scale
 * transform here would shift the whole grid on every mouse move.
 */
export function LinkCard({ href, title, description, footer, className }: LinkCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        'group flex cursor-pointer flex-col gap-2 rounded-[var(--radius-lg)] border border-border bg-card p-5',
        'transition-colors duration-200 hover:border-primary hover:bg-muted',
        className,
      )}
    >
      <h3 className="font-medium text-card-foreground transition-colors duration-200 group-hover:text-primary">
        {title}
      </h3>
      {description && (
        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
      )}
      {footer && <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">{footer}</div>}
    </Link>
  );
}
