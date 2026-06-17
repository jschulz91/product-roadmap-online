import Dagre from '@dagrejs/dagre';
import type { RoadmapNode, RoadmapEdge } from '../types/roadmap';

const NODE_DIMENSIONS = {
  goal:    { width: 360, height: 140 },
  feature: { width: 310, height: 120 },
  task:    { width: 260, height: 90 },
} as const;

export function applyAutoLayout(
  nodes: RoadmapNode[],
  edges: RoadmapEdge[]
): RoadmapNode[] {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: 'TB',
    nodesep: 100,
    ranksep: 140,
    marginx: 50,
    marginy: 50,
  });

  const visibleNodes = nodes.filter(n => !(n as any).hidden);

  for (const node of visibleNodes) {
    const dim = NODE_DIMENSIONS[node.type as keyof typeof NODE_DIMENSIONS] ?? NODE_DIMENSIONS.task;
    g.setNode(node.id, { width: dim.width, height: dim.height });
  }

  const visibleIds = new Set(visibleNodes.map(n => n.id));
  for (const edge of edges) {
    if (visibleIds.has(edge.source) && visibleIds.has(edge.target)) {
      g.setEdge(edge.source, edge.target);
    }
  }

  Dagre.layout(g);

  return nodes.map(node => {
    const pos = g.node(node.id);
    if (!pos) return node;
    const dim = NODE_DIMENSIONS[node.type as keyof typeof NODE_DIMENSIONS] ?? NODE_DIMENSIONS.task;
    return {
      ...node,
      position: {
        x: pos.x - dim.width / 2,
        y: pos.y - dim.height / 2,
      },
    };
  });
}
