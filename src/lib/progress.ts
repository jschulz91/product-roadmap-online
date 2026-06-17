import type { RoadmapNode } from '../types/roadmap';

export interface ProgressInfo {
  total: number;
  completed: number;
  inProgress: number;
  planned: number;
  percentage: number;
}

export function calculateProgress(
  nodeId: string,
  nodes: RoadmapNode[]
): ProgressInfo {
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const leaves: RoadmapNode[] = [];

  function collectLeaves(id: string) {
    const node = nodeMap.get(id);
    if (!node) return;
    if (node.data.childrenIds.length === 0) {
      leaves.push(node);
    } else {
      for (const childId of node.data.childrenIds) {
        collectLeaves(childId);
      }
    }
  }

  const root = nodeMap.get(nodeId);
  if (!root) return { total: 0, completed: 0, inProgress: 0, planned: 0, percentage: 0 };

  for (const childId of root.data.childrenIds) {
    collectLeaves(childId);
  }

  const total = leaves.length;
  const completed = leaves.filter(n => n.data.status === 'done').length;
  const inProgress = leaves.filter(n => n.data.status === 'now').length;
  const planned = leaves.filter(n => n.data.status === 'next' || n.data.status === 'later').length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { total, completed, inProgress, planned, percentage };
}
