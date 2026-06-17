import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Map } from 'lucide-react';
import { usePresentationStore } from '../../store/presentation-store';
import { useRoadmapStore } from '../../store/roadmap-store';

export const ExplorerBreadcrumb = memo(function ExplorerBreadcrumb() {
  const level = usePresentationStore(s => s.level);
  const focusedGoalId = usePresentationStore(s => s.focusedGoalId);
  const focusedFeatureId = usePresentationStore(s => s.focusedFeatureId);
  const goBack = usePresentationStore(s => s.goBack);
  const nodes = useRoadmapStore(s => s.nodes);

  const goalNode = focusedGoalId ? nodes.find(n => n.id === focusedGoalId) : null;
  const featureNode = focusedFeatureId ? nodes.find(n => n.id === focusedFeatureId) : null;

  const resetToOverview = () => {
    if (level === 'feature') {
      goBack();
      setTimeout(() => usePresentationStore.getState().goBack(), 100);
    } else if (level === 'goal') {
      goBack();
    }
  };

  return (
    <div className="absolute top-5 left-1/2 -translate-x-1/2 z-10 pointer-events-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={`${level}-${focusedGoalId}-${focusedFeatureId}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="flex items-center gap-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-full shadow-xl border border-gray-200 dark:border-gray-700 px-4 py-2"
        >
          <Map size={14} className="text-blue-500 shrink-0" />

          <button
            onClick={resetToOverview}
            className={`text-xs font-medium transition-colors ${
              level === 'overview'
                ? 'text-gray-800 dark:text-gray-100'
                : 'text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 cursor-pointer'
            }`}
          >
            Uebersicht
          </button>

          {goalNode && (
            <>
              <ChevronRight size={12} className="text-gray-300 dark:text-gray-600 shrink-0" />
              <button
                onClick={() => { if (level === 'feature') goBack(); }}
                className={`text-xs font-medium truncate max-w-[180px] transition-colors ${
                  level === 'goal'
                    ? 'text-gray-800 dark:text-gray-100'
                    : 'text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 cursor-pointer'
                }`}
              >
                {goalNode.data.title}
              </button>
            </>
          )}

          {featureNode && (
            <>
              <ChevronRight size={12} className="text-gray-300 dark:text-gray-600 shrink-0" />
              <span className="text-xs font-medium text-gray-800 dark:text-gray-100 truncate max-w-[180px]">
                {featureNode.data.title}
              </span>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
});
