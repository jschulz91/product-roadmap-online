import { memo } from 'react';
import { BaseEdge, getBezierPath, type EdgeProps } from '@xyflow/react';
import { useRoadmapStore } from '../../store/roadmap-store';
import { useUIStore } from '../../store/ui-store';
import { EdgeOptionsMenu } from './EdgeOptionsMenu';
import type { EdgeStyle, EdgeDirection } from '../../types/roadmap';

export const HierarchyEdge = memo(function HierarchyEdge(props: EdgeProps) {
  const { id, target, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, selected, data } = props;
  const updateHierarchyEdge = useRoadmapStore(s => s.updateHierarchyEdge);
  const menuEdgeId = useUIStore(s => s.menuEdgeId);

  const edgeStyle: EdgeStyle = (data as any)?.style ?? 'solid';
  const direction: EdgeDirection = (data as any)?.direction ?? 'none';
  const active = selected || menuEdgeId === id;

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition,
  });

  const showEnd = direction === 'forward' || direction === 'both';
  const showStart = direction === 'backward' || direction === 'both';

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: active ? '#3B82F6' : '#D1D5DB',
          strokeWidth: active ? 2.5 : 1.5,
          strokeDasharray: edgeStyle === 'dashed' ? '8 4' : undefined,
        }}
        markerStart={showStart ? 'url(#dependency-arrow)' : undefined}
        markerEnd={showEnd ? 'url(#dependency-arrow)' : undefined}
      />
      <EdgeOptionsMenu
        edgeId={id}
        labelX={labelX}
        labelY={labelY}
        selected={!!selected}
        style={edgeStyle}
        direction={direction}
        onStyle={(style) => updateHierarchyEdge(target, { style })}
        onDirection={(dir) => updateHierarchyEdge(target, { direction: dir })}
      />
    </>
  );
});
