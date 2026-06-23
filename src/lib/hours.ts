import type { RoadmapNode } from '../types/roadmap';

export interface HoursInfo {
  /** The node's own hours: task hours, or the extra value on a feature/goal. */
  own: number;
  /** Sum of all descendant totals (cascaded up from children). */
  rolledUp: number;
  /** own + rolledUp. */
  total: number;
}

/**
 * Total hours for a node = its own hours plus the recursive total of every child.
 * Tasks contribute their own hours; features and goals add an extra value on top
 * of what cascades up from their children.
 */
export function calculateHours(nodeId: string, nodes: RoadmapNode[]): HoursInfo {
  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  function totalOf(id: string): number {
    const node = nodeMap.get(id);
    if (!node) return 0;
    let sum = node.data.hours ?? 0;
    for (const childId of node.data.childrenIds) {
      sum += totalOf(childId);
    }
    return sum;
  }

  const root = nodeMap.get(nodeId);
  if (!root) return { own: 0, rolledUp: 0, total: 0 };

  const own = root.data.hours ?? 0;
  let rolledUp = 0;
  for (const childId of root.data.childrenIds) {
    rolledUp += totalOf(childId);
  }
  return { own, rolledUp, total: own + rolledUp };
}

export function formatHours(hours: number): string {
  const rounded = Math.round(hours * 100) / 100;
  return `${rounded} h`;
}
