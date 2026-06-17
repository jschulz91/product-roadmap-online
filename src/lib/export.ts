import type { RoadmapProject } from '../types/roadmap';

export function downloadProject(project: RoadmapProject) {
  const json = JSON.stringify(project, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${project.name.replace(/[^a-zA-Z0-9-_äöüÄÖÜß ]/g, '').replace(/\s+/g, '-')}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
