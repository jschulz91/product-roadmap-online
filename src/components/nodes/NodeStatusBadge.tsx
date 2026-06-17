import { memo } from 'react';
import type { NodeStatus } from '../../types/roadmap';
import { statusConfig } from '../../styles/theme';

interface NodeStatusBadgeProps {
  status: NodeStatus;
  onClick?: () => void;
}

export const NodeStatusBadge = memo(function NodeStatusBadge({ status, onClick }: NodeStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className="inline-flex items-center gap-1.5 cursor-pointer group"
    >
      <span className={`w-2 h-2 rounded-full ${config.dotColor} ${config.darkDotColor} group-hover:scale-125 transition-transform`} />
      <span className="text-[10px] font-bold tracking-widest text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
        {config.label}
      </span>
    </button>
  );
});
