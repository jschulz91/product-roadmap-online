import { memo, useMemo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { RoadmapNodeData } from '../../types/roadmap';
import { NodeStatusBadge } from './NodeStatusBadge';
import { ProgressBar } from './ProgressBar';
import { calculateProgress } from '../../lib/progress';
import { useRoadmapStore } from '../../store/roadmap-store';
import { useUIStore } from '../../store/ui-store';
import { getNodeColorStyles } from '../../lib/node-colors';

const handleClass = "!w-2.5 !h-2.5 !bg-gray-300 dark:!bg-gray-600 !border-2 !border-white dark:!border-gray-800";

type FeatureNodeProps = NodeProps & { data: RoadmapNodeData };

export const FeatureNode = memo(function FeatureNode({ id, data, selected }: FeatureNodeProps) {
  const nodes = useRoadmapStore(s => s.nodes);
  const getGoalColor = useRoadmapStore(s => s.getGoalColor);
  const toggleCollapse = useRoadmapStore(s => s.toggleCollapse);
  const cycleStatus = useRoadmapStore(s => s.cycleStatus);
  const theme = useUIStore(s => s.theme);
  const isPresentationMode = useUIStore(s => s.isPresentationMode);
  const hasChildren = data.childrenIds.length > 0;

  const hex = getGoalColor(id);
  const colorStyles = getNodeColorStyles(hex, 'feature', theme === 'dark');

  const progress = useMemo(
    () => calculateProgress(id, nodes),
    [id, nodes]
  );

  const parentNode = data.parentId ? nodes.find(n => n.id === data.parentId) : null;
  const childIndex = parentNode ? parentNode.data.childrenIds.indexOf(id) : 0;

  return (
    <motion.div
      initial={isPresentationMode ? { opacity: 0, scale: 0.85, y: 25 } : false}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={isPresentationMode
        ? { duration: 0.45, delay: childIndex * 0.12, ease: [0.25, 0.46, 0.45, 0.94] }
        : { duration: 0 }
      }
    >
    <div
      className={`
        min-w-[300px] max-w-[360px] rounded-xl shadow-md border-2 overflow-hidden
        transition-all duration-200
        ${selected ? 'ring-2 ring-offset-2 ring-blue-400 dark:ring-offset-gray-900' : ''}
      `}
      style={colorStyles}
    >
      <Handle type="target" position={Position.Top} className={handleClass} />
      <Handle type="source" position={Position.Top} id="top-source" className={handleClass} />
      <Handle type="target" position={Position.Left} id="left-target" className={handleClass} />
      <Handle type="source" position={Position.Left} id="left-source" className={handleClass} />
      <Handle type="source" position={Position.Right} id="right-source" className={handleClass} />
      <Handle type="target" position={Position.Right} id="right-target" className={handleClass} />

      <div style={{ padding: '16px 20px' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '10px' }}>
          <NodeStatusBadge status={data.status} onClick={() => cycleStatus(id)} />
          {hasChildren && (
            <button
              onClick={(e) => { e.stopPropagation(); toggleCollapse(id); }}
              className="p-0.5 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              {data.collapsed
                ? <ChevronRight size={16} className="text-gray-400" />
                : <ChevronDown size={16} className="text-gray-400" />}
            </button>
          )}
        </div>

        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-snug">
          {data.title}
        </h3>
        {data.subtitle && (
          <p className="text-xs text-gray-500 dark:text-gray-400" style={{ marginTop: '4px' }}>{data.subtitle}</p>
        )}

        {hasChildren && (
          <div style={{ marginTop: '12px' }}>
            <ProgressBar progress={progress} />
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className={handleClass} />
      <Handle type="target" position={Position.Bottom} id="bottom-target" className={handleClass} />
    </div>
    </motion.div>
  );
});
