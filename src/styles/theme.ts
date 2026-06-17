import type { NodeStatus, NodeLevel } from '../types/roadmap';

export const statusConfig: Record<NodeStatus, {
  label: string;
  dotColor: string;
  darkDotColor: string;
}> = {
  done:  { label: 'DONE',  dotColor: 'bg-emerald-500', darkDotColor: 'dark:bg-emerald-400' },
  now:   { label: 'NOW',   dotColor: 'bg-blue-500',    darkDotColor: 'dark:bg-blue-400' },
  next:  { label: 'NEXT',  dotColor: 'bg-amber-500',   darkDotColor: 'dark:bg-amber-400' },
  later: { label: 'LATER', dotColor: 'bg-gray-400',    darkDotColor: 'dark:bg-gray-500' },
};

export const levelConfig: Record<NodeLevel, {
  label: string;
  childLevel: NodeLevel | null;
  childLabel: string;
}> = {
  goal:    { label: 'Ziel',    childLevel: 'feature', childLabel: 'Feature hinzufuegen' },
  feature: { label: 'Feature', childLevel: 'task',    childLabel: 'Task hinzufuegen' },
  task:    { label: 'Task',    childLevel: null,       childLabel: '' },
};
