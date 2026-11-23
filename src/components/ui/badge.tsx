import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'forest' | 'burgundy' | 'gold' | 'gray' | 'success' | 'danger' | 'warning';
  size?: 'sm' | 'md';
}

export function Badge({ className, variant = 'forest', size = 'md', children, ...props }: BadgeProps) {
  const variants = {
    forest: 'bg-forest-50 text-forest-800 border-forest-200',
    burgundy: 'bg-burgundy-50 text-burgundy-700 border-burgundy-200',
    gold: 'bg-amber-50 text-amber-800 border-amber-300',
    gray: 'bg-gray-100 text-gray-800 border-gray-200',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    danger: 'bg-red-50 text-red-800 border-red-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border tracking-wide uppercase',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
