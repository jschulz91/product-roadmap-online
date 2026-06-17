import type { RoadmapEdge } from '../types/roadmap';

export function wouldCreateCycle(
  edges: RoadmapEdge[],
  newSource: string,
  newTarget: string
): boolean {
  const adjacency = new Map<string, string[]>();
  for (const edge of edges) {
    if (edge.type !== 'dependency') continue;
    const targets = adjacency.get(edge.source) ?? [];
    targets.push(edge.target);
    adjacency.set(edge.source, targets);
  }
  const targets = adjacency.get(newSource) ?? [];
  targets.push(newTarget);
  adjacency.set(newSource, targets);

  const visited = new Set<string>();
  const stack = new Set<string>();

  function dfs(node: string): boolean {
    if (stack.has(node)) return true;
    if (visited.has(node)) return false;
    visited.add(node);
    stack.add(node);
    for (const neighbor of adjacency.get(node) ?? []) {
      if (dfs(neighbor)) return true;
    }
    stack.delete(node);
    return false;
  }

  return dfs(newSource);
}
