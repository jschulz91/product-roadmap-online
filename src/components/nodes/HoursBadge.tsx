import { Clock } from 'lucide-react';
import { formatHours } from '../../lib/hours';

export function HoursBadge({ hours }: { hours: number }) {
  if (!hours) return null;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-black/5 dark:bg-white/10 text-gray-600 dark:text-gray-300"
      title="Geplante Stunden (inkl. untergeordneter Elemente)"
    >
      <Clock size={12} />
      {formatHours(hours)}
    </span>
  );
}
