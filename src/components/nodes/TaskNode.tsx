import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { motion } from 'framer-motion';
import type { RoadmapNodeData } from '../../types/roadmap';
import { NodeStatusBadge } from './NodeStatusBadge';
import { useRoadmapStore } from '../../store/roadmap-store';
import { useUIStore } from '../../store/ui-store';
import { getNodeColorStyles } from '../../lib/node-colors';

const handleClass = "!w-2 !h-2 !bg-gray-300 dark:!bg-gray-600 !border-2 !border-white dark:!border-gray-800";

type TaskNodeProps = NodeProps & { data: RoadmapNodeData };

export const TaskNode = memo(function TaskNode({ id, data, selected }: TaskNodeProps) {
  const nodes = useRoadmapStore(s => s.nodes);
  const cycleStatus = useRoadmapStore(s => s.cycleStatus);
  const getGoalColor = useRoadmapStore(s => s.getGoalColor);
  const theme = useUIStore(s => s.theme);
  const isPresentationMode = useUIStore(s => s.isPresentationMode);

  const hex = getGoalColor(id);
  const colorStyles = getNodeColorStyles(hex, 'task', theme === 'dark');

  const parentNode = data.parentId ? nodes.find(n => n.id === data.parentId) : null;
  const childIndex = parentNode ? parentNode.data.childrenIds.indexOf(id) : 0;

  return (
    <motion.div
      initial={isPresentationMode ? { opacity: 0, scale: 0.85, y: 20 } : false}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={isPresentationMode
        ? { duration: 0.4, delay: childIndex * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }
        : { duration: 0 }
      }
    >
    <div
      className={`
        min-w-[250px] max-w-[320px] rounded-lg shadow-sm border overflow-hidden
        transition-all duration-200
        ${selected ? 'ring-2 ring-offset-2 ring-blue-400 dark:ring-offset-gray-900' : ''}
        ${data.status === 'done' ? 'opacity-60' : ''}
      `}
      style={colorStyles}
    >
      <Handle type="target" position={Position.Top} className={handleClass} />
      <Handle type="target" position={Position.Left} id="left-target" className={handleClass} />
      <Handle type="source" position={Position.Right} id="right-source" className={handleClass} />

      <div className="px-6 py-5">
        <div className="mb-3">
          <NodeStatusBadge status={data.status} onClick={() => cycleStatus(id)} />
        </div>
        <h3
          className={`text-sm font-medium text-gray-800 dark:text-gray-100 leading-snug
            ${data.status === 'done' ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}
        >
          {data.title}
        </h3>
        {data.subtitle && (
          <p className={`text-xs text-gray-500 dark:text-gray-400 mt-1
            ${data.status === 'done' ? 'line-through' : ''}`}
          >
            {data.subtitle}
          </p>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className={handleClass} />
      <Handle type="source" position={Position.Left} id="left-source" className={handleClass} />
      <Handle type="target" position={Position.Right} id="right-target" className={handleClass} />
    </div>
    </motion.div>
  );
});
