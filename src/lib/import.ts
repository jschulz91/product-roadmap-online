import { roadmapProjectSchema } from '../schemas/project';
import type { RoadmapProject } from '../types/roadmap';

export interface ImportResult {
  success: boolean;
  data?: RoadmapProject;
  errors?: string[];
}

export function parseAndValidateProject(jsonString: string): ImportResult {
  let raw: unknown;
  try {
    raw = JSON.parse(jsonString);
  } catch {
    return { success: false, errors: ['Ungueltige JSON-Datei'] };
  }

  const result = roadmapProjectSchema.safeParse(raw);
  if (!result.success) {
    const errors = result.error.issues.map(
      i => `${i.path.join('.')}: ${i.message}`
    );
    return { success: false, errors };
  }

  const semanticErrors = validateSemantics(result.data);
  if (semanticErrors.length > 0) {
    return { success: false, errors: semanticErrors };
  }

  return { success: true, data: result.data };
}

function validateSemantics(project: RoadmapProject): string[] {
  const errors: string[] = [];
  const nodeIds = new Set(project.nodes.map(n => n.id));

  for (const node of project.nodes) {
    if (node.data.parentId && !nodeIds.has(node.data.parentId)) {
      errors.push(`Knoten "${node.data.title}": Elternknoten ${node.data.parentId} nicht gefunden`);
    }
    for (const childId of node.data.childrenIds) {
      if (!nodeIds.has(childId)) {
        errors.push(`Knoten "${node.data.title}": Kind-Knoten ${childId} nicht gefunden`);
      }
    }
  }

  for (const edge of project.edges) {
    if (!nodeIds.has(edge.source)) {
      errors.push(`Kante ${edge.id}: Quell-Knoten ${edge.source} nicht gefunden`);
    }
    if (!nodeIds.has(edge.target)) {
      errors.push(`Kante ${edge.id}: Ziel-Knoten ${edge.target} nicht gefunden`);
    }
  }

  return errors;
}
