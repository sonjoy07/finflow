import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  isError?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', startIcon, endIcon, isError, disabled, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {startIcon && (
          <div className="absolute left-3 flex items-center pointer-events-none text-muted-foreground">
            {startIcon}
          </div>
        )}
        <input
          type={type}
          disabled={disabled}
          ref={ref}
          aria-invalid={isError}
          className={cn(
            'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-sm transition-colors',
            'file:border-0 file:bg-transparent file:text-sm file:font-medium',
            'placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ring-offset-background',
            'disabled:cursor-not-allowed disabled:opacity-50',
            startIcon && 'pl-9',
            endIcon && 'pr-9',
            isError && 'border-destructive focus-visible:ring-destructive',
            className
          )}
          {...props}
        />
        {endIcon && (
          <div className="absolute right-3 flex items-center text-muted-foreground">
            {endIcon}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
