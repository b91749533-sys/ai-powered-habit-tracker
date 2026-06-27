import React, { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, helperText, type = 'text', ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {label}
          </label>
        )}
        <input
          type={type}
          className={`flex h-11 w-full rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground shadow-sm ring-offset-background transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 ${
            error ? 'border-destructive focus-visible:ring-destructive/20 focus-visible:border-destructive' : ''
          } ${className}`}
          ref={ref}
          {...props}
        />
        {error && (
          <span className="text-xs text-destructive font-medium animate-fade-in">
            {error}
          </span>
        )}
        {!error && helperText && (
          <span className="text-xs text-muted-foreground">
            {helperText}
          </span>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
