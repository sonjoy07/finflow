import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary/10 text-primary',
        secondary: 'border-border bg-secondary text-secondary-foreground',
        outline: 'border-border text-foreground',
        success: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
        warning: 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400',
        destructive: 'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-400',
        purple: 'border-purple-500/20 bg-purple-500/10 text-purple-700 dark:text-purple-400',
        info: 'border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const dotColors: Record<string, string> = {
  default: 'bg-primary',
  secondary: 'bg-muted-foreground',
  outline: 'bg-muted-foreground',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  destructive: 'bg-rose-500',
  purple: 'bg-purple-500',
  info: 'bg-blue-500',
};

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  showDot?: boolean;
}

export function Badge({
  className,
  variant = 'default',
  showDot = false,
  children,
  ...props
}: BadgeProps) {
  const dotColor = dotColors[variant || 'default'] || 'bg-primary';

  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {showDot && (
        <span
          className={cn('h-1.5 w-1.5 rounded-full shrink-0', dotColor)}
          aria-hidden="true"
        />
      )}
      <span>{children}</span>
    </div>
  );
}
