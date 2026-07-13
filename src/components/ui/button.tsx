import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  // cursor-pointer is deliberate: buttons without it read as decoration.
  // Hover changes colour only — never scale, which would shift layout.
  //
  // `active:` is press feedback, and it was missing from the entire codebase — `grep -r
  // 'active:' src/components/` returned nothing. On a touch device there is no hover, so a
  // tap produced no acknowledgement whatsoever until the page changed under it.
  //
  // Scale, not colour, and only on press: it is the one moment a transform is safe, because
  // it is transient and the element returns to its own box. `transition-transform` joins
  // `transition-colors` so the release eases back instead of snapping.
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-[var(--radius)] text-sm font-medium transition-[colors,transform] duration-200 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        outline: 'border border-border bg-transparent hover:bg-muted',
        ghost: 'hover:bg-muted',
        subtle: 'bg-muted text-foreground hover:bg-border',
      },
      size: {
        // 44px min touch target on the default and large sizes.
        sm: 'h-9 px-3',
        md: 'h-11 px-5',
        lg: 'h-12 px-7 text-base',
        icon: 'size-11',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export type ButtonProps = ComponentProps<'button'> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export { buttonVariants };
