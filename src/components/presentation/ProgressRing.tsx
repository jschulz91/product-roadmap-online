import { memo } from 'react';
import { motion } from 'framer-motion';

interface ProgressRingProps {
  percentage: number;
  completed: number;
  total: number;
  size?: number;
  strokeWidth?: number;
  accentColor?: string;
}

export const ProgressRing = memo(function ProgressRing({
  percentage,
  completed,
  total,
  size = 90,
  strokeWidth = 6,
  accentColor = '#3B82F6',
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percentage / 100);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200 dark:text-gray-700"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={accentColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-gray-800 dark:text-gray-100">
          {completed}/{total}
        </span>
        <span className="text-[10px] text-gray-400 uppercase tracking-wider">
          erledigt
        </span>
      </div>
    </div>
  );
});
