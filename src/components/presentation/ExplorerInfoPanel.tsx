import { memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Layers, CheckSquare } from 'lucide-react';
import { usePresentationStore } from '../../store/presentation-store';
import { useRoadmapStore } from '../../store/roadmap-store';
import { calculateProgress } from '../../lib/progress';
import { statusConfig } from '../../styles/theme';
import { getAccentColor, getNodeColorStyles } from '../../lib/node-colors';
import { ProgressRing } from './ProgressRing';
import type { NodeStatus } from '../../types/roadmap';
import { useUIStore } from '../../store/ui-store';

export const ExplorerInfoPanel = memo(function ExplorerInfoPanel() {
  const level = usePresentationStore(s => s.level);
  const focusedGoalId = usePresentationStore(s => s.focusedGoalId);
  const focusedFeatureId = usePresentationStore(s => s.focusedFeatureId);
  const nodes = useRoadmapStore(s => s.nodes);
  const projectName = useRoadmapStore(s => s.projectName);

  const goalNode = focusedGoalId ? nodes.find(n => n.id === focusedGoalId) : null;
  const featureNode = focusedFeatureId ? nodes.find(n => n.id === focusedFeatureId) : null;

  const goalNodes = useMemo(() => nodes.filter(n => n.data.level === 'goal'), [nodes]);

  const contentKey = `${level}-${focusedGoalId}-${focusedFeatureId}`;

  return (
    <div className="absolute top-0 left-0 h-full z-10 pointer-events-auto">
      <motion.div
        initial={{ x: -340, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -340, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="h-full w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-r border-gray-200 dark:border-gray-700 shadow-2xl overflow-y-auto"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={contentKey}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 15 }}
            transition={{ duration: 0.25 }}
            className="p-5"
          >
            {level === 'overview' && <OverviewContent projectName={projectName} goalNodes={goalNodes} nodes={nodes} />}
            {level === 'goal' && goalNode && <GoalContent goalNode={goalNode} nodes={nodes} />}
            {level === 'feature' && featureNode && goalNode && (
              <FeatureContent featureNode={featureNode} goalNode={goalNode} nodes={nodes} />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
});

function OverviewContent({ projectName, goalNodes, nodes }: {
  projectName: string;
  goalNodes: typeof nodes;
  nodes: ReturnType<typeof useRoadmapStore.getState>['nodes'];
}) {
  const theme = useUIStore(s => s.theme);
  const allLeafTasks = nodes.filter(n => n.data.level === 'task' || (n.data.childrenIds.length === 0 && n.data.level !== 'goal'));
  const doneCount = allLeafTasks.filter(n => n.data.status === 'done').length;
  const totalCount = allLeafTasks.length;
  const overallPercentage = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  return (
    <>
      <div className="mb-6">
        <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Roadmap</p>
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{projectName}</h2>
      </div>

      <div className="flex justify-center mb-6">
        <ProgressRing
          percentage={overallPercentage}
          completed={doneCount}
          total={totalCount}
          size={100}
          strokeWidth={7}
        />
      </div>

      <div className="mb-4">
        <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">
          {goalNodes.length} {goalNodes.length === 1 ? 'Ziel' : 'Ziele'}
        </p>
      </div>

      <div className="space-y-2">
        {goalNodes.map((goal, idx) => {
          const hex = goal.data.color ?? null;
          const colorStyles = getNodeColorStyles(hex, 'goal', theme === 'dark');
          const progress = calculateProgress(goal.id, nodes);
          return (
            <button
              key={goal.id}
              onClick={() => usePresentationStore.getState().focusGoal(goal.id, idx)}
              className="w-full text-left px-3 py-2.5 rounded-lg border transition-all hover:shadow-md"
              style={colorStyles}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                  {goal.data.title}
                </span>
                <span className="text-[10px] font-bold text-gray-400 ml-2 shrink-0">
                  {progress.completed}/{progress.total}
                </span>
              </div>
              {goal.data.subtitle && (
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                  {goal.data.subtitle}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}

function GoalContent({ goalNode, nodes }: {
  goalNode: ReturnType<typeof useRoadmapStore.getState>['nodes'][0];
  nodes: ReturnType<typeof useRoadmapStore.getState>['nodes'];
}) {
  const accent = getAccentColor(goalNode.data.color ?? null);
  const progress = calculateProgress(goalNode.id, nodes);
  const features = nodes.filter(n => n.data.parentId === goalNode.id && n.data.level === 'feature');

  const statusCounts = features.reduce((acc, f) => {
    acc[f.data.status] = (acc[f.data.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <>
      <div className="mb-1">
        <div className="h-1 w-12 rounded-full mb-4" style={{ backgroundColor: accent }} />
        <div className="flex items-center gap-2 mb-1">
          <Target size={14} className="text-gray-400 shrink-0" />
          <p className="text-[10px] uppercase tracking-widest text-gray-400">Ziel</p>
        </div>
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 leading-tight">
          {goalNode.data.title}
        </h2>
        {goalNode.data.subtitle && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{goalNode.data.subtitle}</p>
        )}
      </div>

      {goalNode.data.description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 leading-relaxed">
          {goalNode.data.description}
        </p>
      )}

      <div className="flex justify-center my-5">
        <ProgressRing
          percentage={progress.percentage}
          completed={progress.completed}
          total={progress.total}
          accentColor={accent}
        />
      </div>

      <div className="grid grid-cols-4 gap-1.5 mb-5">
        {(Object.keys(statusConfig) as NodeStatus[]).map(status => (
          <div key={status} className="text-center px-1 py-1.5 rounded-md bg-gray-50 dark:bg-gray-800">
            <span className={`inline-block w-2 h-2 rounded-full ${statusConfig[status].dotColor} mb-0.5`} />
            <p className="text-[10px] font-bold text-gray-600 dark:text-gray-300">
              {statusCounts[status] || 0}
            </p>
            <p className="text-[8px] text-gray-400">{statusConfig[status].label}</p>
          </div>
        ))}
      </div>

      {features.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">
            {features.length} Features
          </p>
          <div className="space-y-1.5">
            {features.map((feature, idx) => (
              <button
                key={feature.id}
                onClick={() => usePresentationStore.getState().focusFeature(feature.id, idx)}
                className="w-full text-left flex items-center gap-2 px-2.5 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${statusConfig[feature.data.status].dotColor}`} />
                <span className="text-xs text-gray-700 dark:text-gray-300 truncate">
                  {feature.data.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {features.length === 0 && (
        <p className="text-xs text-gray-400 text-center py-4">Keine Features vorhanden</p>
      )}
    </>
  );
}

function FeatureContent({ featureNode, goalNode, nodes }: {
  featureNode: ReturnType<typeof useRoadmapStore.getState>['nodes'][0];
  goalNode: ReturnType<typeof useRoadmapStore.getState>['nodes'][0];
  nodes: ReturnType<typeof useRoadmapStore.getState>['nodes'];
}) {
  const accent = getAccentColor(goalNode.data.color ?? null);
  const progress = calculateProgress(featureNode.id, nodes);
  const tasks = nodes.filter(n => n.data.parentId === featureNode.id && n.data.level === 'task');

  return (
    <>
      <div className="mb-1">
        <div className="h-1 w-8 rounded-full mb-4" style={{ backgroundColor: accent }} />
        <div className="flex items-center gap-2 mb-0.5">
          <Layers size={14} className="text-gray-400 shrink-0" />
          <p className="text-[10px] uppercase tracking-widest text-gray-400">Feature</p>
        </div>
        <p className="text-[10px] text-gray-400 mb-1">{goalNode.data.title}</p>
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 leading-tight">
          {featureNode.data.title}
        </h2>
        {featureNode.data.subtitle && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{featureNode.data.subtitle}</p>
        )}
      </div>

      {featureNode.data.description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 leading-relaxed">
          {featureNode.data.description}
        </p>
      )}

      {tasks.length > 0 && (
        <div className="flex justify-center my-5">
          <ProgressRing
            percentage={progress.percentage}
            completed={progress.completed}
            total={progress.total}
            accentColor={accent}
            size={80}
            strokeWidth={5}
          />
        </div>
      )}

      {tasks.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">
            {tasks.length} Tasks
          </p>
          <div className="space-y-1.5">
            {tasks.map(task => (
              <div
                key={task.id}
                className={`flex items-center gap-2 px-2.5 py-2 rounded-lg bg-gray-50 dark:bg-gray-800
                  ${task.data.status === 'done' ? 'opacity-50' : ''}`}
              >
                <CheckSquare
                  size={13}
                  className={task.data.status === 'done' ? 'text-emerald-500' : 'text-gray-300 dark:text-gray-600'}
                />
                <span className={`text-xs text-gray-700 dark:text-gray-300 truncate
                  ${task.data.status === 'done' ? 'line-through' : ''}`}
                >
                  {task.data.title}
                </span>
                <span className={`ml-auto shrink-0 w-1.5 h-1.5 rounded-full ${statusConfig[task.data.status].dotColor}`} />
              </div>
            ))}
          </div>
        </div>
      )}

      {tasks.length === 0 && (
        <p className="text-xs text-gray-400 text-center py-4">Keine Tasks vorhanden</p>
      )}
    </>
  );
}
