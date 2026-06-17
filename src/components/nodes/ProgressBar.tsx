import { memo } from 'react';
import type { ProgressInfo } from '../../lib/progress';

interface ProgressBarProps {
  progress: ProgressInfo;
  accentColor?: string;
}

export const ProgressBar = memo(function ProgressBar({ progress, accentColor }: ProgressBarProps) {
  if (progress.total === 0) return null;

  return (
    <div className="relative h-5 bg-gray-100 dark:bg-gray-700/50 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500 ease-out"
        style={{
          width: `${Math.max(progress.percentage, 8)}%`,
          background: accentColor
            ? progress.percentage === 100 ? '#059669' : accentColor
            : progress.percentage === 100 ? '#059669' : '#3B82F6',
          opacity: progress.percentage === 0 ? 0.3 : 1,
        }}
      />
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-300">
        {progress.completed}/{progress.total}
      </span>
    </div>
  );
});
