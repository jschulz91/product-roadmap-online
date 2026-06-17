import type { ReactFlowInstance } from '@xyflow/react';
import type { RoadmapNode } from '../types/roadmap';

const NODE_DIMS: Record<string, { width: number; height: number }> = {
  goal:    { width: 360, height: 140 },
  feature: { width: 310, height: 120 },
  task:    { width: 260, height: 90 },
};

function getBoundingBox(nodes: RoadmapNode[]): { x: number; y: number; width: number; height: number } {
  if (nodes.length === 0) return { x: 0, y: 0, width: 400, height: 300 };

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  for (const node of nodes) {
    const dims = NODE_DIMS[node.data.level] ?? { width: 300, height: 100 };
    const left = node.position.x;
    const top = node.position.y;
    const right = left + dims.width;
    const bottom = top + dims.height;

    if (left < minX) minX = left;
    if (top < minY) minY = top;
    if (right > maxX) maxX = right;
    if (bottom > maxY) maxY = bottom;
  }

  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

export async function flyToOverview(rf: ReactFlowInstance): Promise<void> {
  await rf.fitView({ padding: 0.4, duration: 1000 });
}

export async function flyToGoal(
  rf: ReactFlowInstance,
  goalNode: RoadmapNode,
  featureNodes: RoadmapNode[]
): Promise<void> {
  const allNodes = [goalNode, ...featureNodes];
  const bounds = getBoundingBox(allNodes);
  await rf.fitBounds(bounds, { padding: 0.3, duration: 800 });
}

export async function flyToFeature(
  rf: ReactFlowInstance,
  featureNode: RoadmapNode,
  taskNodes: RoadmapNode[]
): Promise<void> {
  const allNodes = [featureNode, ...taskNodes];
  const bounds = getBoundingBox(allNodes);
  await rf.fitBounds(bounds, { padding: 0.25, duration: 600 });
}
