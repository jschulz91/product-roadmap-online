import { z } from 'zod';

export const nodeStatusSchema = z.enum(['done', 'now', 'next', 'later']);
export const nodeLevelSchema = z.enum(['goal', 'feature', 'task']);
export const edgeTypeSchema = z.enum(['dependency', 'hierarchy']);
export const edgeStyleSchema = z.enum(['solid', 'dashed']);

export const roadmapNodeDataSchema = z.object({
  title: z.string().min(1).max(200),
  subtitle: z.string().max(200).default(''),
  description: z.string().max(2000).default(''),
  status: nodeStatusSchema,
  level: nodeLevelSchema,
  parentId: z.string().nullable().default(null),
  childrenIds: z.array(z.string()).default([]),
  collapsed: z.boolean().default(false),
  color: z.string().nullable().default(null),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const roadmapNodeSchema = z.object({
  id: z.string(),
  type: nodeLevelSchema,
  position: z.object({ x: z.number(), y: z.number() }),
  data: roadmapNodeDataSchema,
});

export const roadmapEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  type: edgeTypeSchema,
  style: edgeStyleSchema.default('solid'),
  animated: z.boolean().optional(),
  label: z.string().max(100).optional(),
});

export const viewportSchema = z.object({
  x: z.number(),
  y: z.number(),
  zoom: z.number().min(0.1).max(4),
});

export const roadmapProjectSchema = z.object({
  version: z.literal('1.0'),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).default(''),
  createdAt: z.string(),
  updatedAt: z.string(),
  nodes: z.array(roadmapNodeSchema),
  edges: z.array(roadmapEdgeSchema),
  viewport: viewportSchema,
  settings: z.object({
    theme: z.enum(['light', 'dark']),
    autoLayout: z.boolean(),
  }),
});
