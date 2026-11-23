import React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressBarProps {
  progress: number; // 0 - 100
  label?: string;
  showPercentage?: boolean;
  className?: string;
}

export function ProgressBar({ progress, label, showPercentage = true, className }: ProgressBarProps) {
  const normalized = Math.min(100, Math.max(0, progress));

  return (
    <div className={cn('w-full space-y-1.5', className)}>
      {(label || showPercentage) && (
        <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-gray-700">
          <span>{label}</span>
          {showPercentage && <span className="text-forest-800">{Math.round(normalized)}%</span>}
        </div>
      )}
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full bg-forest-800 transition-all duration-500 ease-out"
          style={{ width: `${normalized}%` }}
        />
      </div>
    </div>
  );
}
