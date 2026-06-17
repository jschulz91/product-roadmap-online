import { memo } from 'react';
import { BaseEdge, getBezierPath, type EdgeProps } from '@xyflow/react';

export const HierarchyEdge = memo(function HierarchyEdge(props: EdgeProps) {
  const { id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition } = props;

  const [edgePath] = getBezierPath({
    sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition,
  });

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      style={{
        stroke: '#D1D5DB',
        strokeWidth: 1.5,
      }}
    />
  );
});
