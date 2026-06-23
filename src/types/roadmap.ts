import type { z } from 'zod';
import type {
  nodeStatusSchema,
  nodeLevelSchema,
  edgeTypeSchema,
  edgeStyleSchema,
  edgeDirectionSchema,
  roadmapNodeDataSchema,
  roadmapNodeSchema,
  roadmapEdgeSchema,
  roadmapAreaSchema,
  roadmapProjectSchema,
} from '../schemas/project';

export type NodeStatus = z.infer<typeof nodeStatusSchema>;
export type NodeLevel = z.infer<typeof nodeLevelSchema>;
export type EdgeType = z.infer<typeof edgeTypeSchema>;
export type EdgeStyle = z.infer<typeof edgeStyleSchema>;
export type EdgeDirection = z.infer<typeof edgeDirectionSchema>;
export type RoadmapNodeData = z.infer<typeof roadmapNodeDataSchema>;
export type RoadmapNode = z.infer<typeof roadmapNodeSchema>;
export type RoadmapEdge = z.infer<typeof roadmapEdgeSchema>;
export type RoadmapArea = z.infer<typeof roadmapAreaSchema>;
export type RoadmapProject = z.infer<typeof roadmapProjectSchema>;

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}
