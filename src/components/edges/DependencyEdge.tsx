import { memo } from 'react';
import { BaseEdge, getBezierPath, EdgeLabelRenderer, type EdgeProps } from '@xyflow/react';
import { X, Minus, GripHorizontal } from 'lucide-react';
import { useRoadmapStore } from '../../store/roadmap-store';
import type { EdgeStyle } from '../../types/roadmap';

export const DependencyEdge = memo(function DependencyEdge(props: EdgeProps) {
  const { id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, selected, data } = props;
  const removeEdge = useRoadmapStore(s => s.removeEdge);
  const updateEdge = useRoadmapStore(s => s.updateEdge);

  const edgeStyle: EdgeStyle = (data as any)?.style ?? 'solid';

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: selected ? '#3B82F6' : '#94A3B8',
          strokeWidth: selected ? 2.5 : 1.5,
          strokeDasharray: edgeStyle === 'dashed' ? '8 4' : undefined,
        }}
        markerEnd="url(#dependency-arrow)"
      />
      {selected && (
        <EdgeLabelRenderer>
          <div
            className="absolute flex items-center gap-1 pointer-events-auto"
            style={{ transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)` }}
          >
            <button
              className={`flex items-center gap-1 rounded-full px-2 py-1 shadow-md border transition-colors text-[10px] font-medium
                ${edgeStyle === 'solid'
                  ? 'bg-blue-50 dark:bg-blue-950 border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              title="Durchgezogen"
              onClick={() => updateEdge(id, { style: 'solid' })}
            >
              <Minus size={12} />
            </button>
            <button
              className={`flex items-center gap-1 rounded-full px-2 py-1 shadow-md border transition-colors text-[10px] font-medium
                ${edgeStyle === 'dashed'
                  ? 'bg-blue-50 dark:bg-blue-950 border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              title="Gestrichelt"
              onClick={() => updateEdge(id, { style: 'dashed' })}
            >
              <GripHorizontal size={12} />
            </button>
            <button
              className="bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
              title="Kante entfernen"
              onClick={() => removeEdge(id)}
            >
              <X size={12} />
            </button>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});
