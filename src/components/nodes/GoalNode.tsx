import { memo, useMemo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { RoadmapNodeData } from '../../types/roadmap';
import { NodeStatusBadge } from './NodeStatusBadge';
import { ProgressBar } from './ProgressBar';
import { calculateProgress } from '../../lib/progress';
import { useRoadmapStore } from '../../store/roadmap-store';
import { useUIStore } from '../../store/ui-store';
import { getNodeColorStyles, getAccentColor } from '../../lib/node-colors';

const handleClass = "!w-3 !h-3 !bg-gray-300 dark:!bg-gray-600 !border-2 !border-white dark:!border-gray-800";

type GoalNodeProps = NodeProps & { data: RoadmapNodeData };

export const GoalNode = memo(function GoalNode({ id, data, selected }: GoalNodeProps) {
  const nodes = useRoadmapStore(s => s.nodes);
  const toggleCollapse = useRoadmapStore(s => s.toggleCollapse);
  const cycleStatus = useRoadmapStore(s => s.cycleStatus);
  const theme = useUIStore(s => s.theme);
  const hasChildren = data.childrenIds.length > 0;

  const hex = data.color ?? null;
  const colorStyles = getNodeColorStyles(hex, 'goal', theme === 'dark');
  const accent = getAccentColor(hex);

  const progress = useMemo(
    () => calculateProgress(id, nodes),
    [id, nodes]
  );

  return (
    <div
      className={`
        min-w-[360px] max-w-[420px] rounded-2xl shadow-lg border-2 overflow-hidden
        transition-all duration-200
        ${selected ? 'ring-2 ring-offset-2 ring-blue-400 dark:ring-offset-gray-900' : ''}
      `}
      style={colorStyles}
    >
      <Handle type="target" position={Position.Top} className={handleClass} />
      <Handle type="target" position={Position.Left} id="left-target" className={handleClass} />
      <Handle type="source" position={Position.Right} id="right-source" className={handleClass} />

      <div className="px-10 pt-8 pb-8">
        <div className="flex items-center justify-between mb-6">
          <NodeStatusBadge status={data.status} onClick={() => cycleStatus(id)} />
          {hasChildren && (
            <button
              onClick={(e) => { e.stopPropagation(); toggleCollapse(id); }}
              className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              {data.collapsed
                ? <ChevronRight size={18} className="text-gray-400" />
                : <ChevronDown size={18} className="text-gray-400" />}
            </button>
          )}
        </div>

        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 leading-tight">
          {data.title}
        </h3>
        {data.subtitle && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{data.subtitle}</p>
        )}

        {hasChildren && (
          <div className="mt-6">
            <ProgressBar progress={progress} accentColor={accent} />
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className={handleClass} />
      <Handle type="source" position={Position.Left} id="left-source" className={handleClass} />
      <Handle type="target" position={Position.Right} id="right-target" className={handleClass} />
    </div>
  );
});
