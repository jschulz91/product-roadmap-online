import { memo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowDown, ArrowUp, X, Play, Pause } from 'lucide-react';
import { usePresentationStore } from '../../store/presentation-store';
import { useUIStore } from '../../store/ui-store';

export const ExplorerHUD = memo(function ExplorerHUD() {
  const level = usePresentationStore(s => s.level);
  const goalIndex = usePresentationStore(s => s.goalIndex);
  const featureIndex = usePresentationStore(s => s.featureIndex);
  const focusedGoalId = usePresentationStore(s => s.focusedGoalId);
  const isAutoPlaying = usePresentationStore(s => s.isAutoPlaying);
  const isTransitioning = usePresentationStore(s => s.isTransitioning);
  const navigateSibling = usePresentationStore(s => s.navigateSibling);
  const drillDown = usePresentationStore(s => s.drillDown);
  const goBack = usePresentationStore(s => s.goBack);
  const toggleAutoPlay = usePresentationStore(s => s.toggleAutoPlay);
  const stopPresentation = useUIStore(s => s.stopPresentation);

  const goalNodes = usePresentationStore(s => s.getGoalNodes)();
  const features = focusedGoalId
    ? usePresentationStore.getState().getFeaturesOfGoal(focusedGoalId)
    : [];

  const totalGoals = goalNodes.length;
  const totalFeatures = features.length;

  const btnClass = "p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-25 disabled:cursor-not-allowed";
  const kbdClass = "text-[9px] px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-400 font-mono";

  return (
    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 pointer-events-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-full shadow-xl border border-gray-200 dark:border-gray-700 px-3 py-2"
      >
        {level === 'overview' && (
          <>
            <span className="text-xs text-gray-500 dark:text-gray-400 px-2">
              {totalGoals} {totalGoals === 1 ? 'Ziel' : 'Ziele'}
            </span>
            <div className="w-px h-5 bg-gray-200 dark:bg-gray-700" />
            <button
              onClick={drillDown}
              disabled={isTransitioning || totalGoals === 0}
              className={`${btnClass} flex items-center gap-1`}
            >
              <ArrowDown size={14} className="text-blue-500" />
              <span className="text-xs text-gray-600 dark:text-gray-300">Erkunden</span>
            </button>
            <span className={kbdClass}>Enter</span>
          </>
        )}

        {level === 'goal' && (
          <>
            <button
              onClick={goBack}
              disabled={isTransitioning}
              className={btnClass}
              title="Zurueck"
            >
              <ArrowUp size={14} className="text-gray-500" />
            </button>
            <div className="w-px h-5 bg-gray-200 dark:bg-gray-700" />
            <button
              onClick={() => navigateSibling(-1)}
              disabled={isTransitioning || goalIndex <= 0}
              className={btnClass}
            >
              <ChevronLeft size={16} className="text-gray-600 dark:text-gray-300" />
            </button>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300 min-w-[70px] text-center">
              Ziel {goalIndex + 1} / {totalGoals}
            </span>
            <button
              onClick={() => navigateSibling(1)}
              disabled={isTransitioning || goalIndex >= totalGoals - 1}
              className={btnClass}
            >
              <ChevronRight size={16} className="text-gray-600 dark:text-gray-300" />
            </button>
            <div className="w-px h-5 bg-gray-200 dark:bg-gray-700" />
            {totalFeatures > 0 && (
              <>
                <button
                  onClick={drillDown}
                  disabled={isTransitioning}
                  className={`${btnClass} flex items-center gap-1`}
                >
                  <ArrowDown size={14} className="text-blue-500" />
                  <span className="text-xs text-gray-600 dark:text-gray-300">Features</span>
                </button>
                <span className={kbdClass}>Enter</span>
              </>
            )}
            {totalFeatures === 0 && (
              <span className="text-xs text-gray-400 px-1">Keine Features</span>
            )}
          </>
        )}

        {level === 'feature' && (
          <>
            <button
              onClick={goBack}
              disabled={isTransitioning}
              className={btnClass}
              title="Zurueck zum Ziel"
            >
              <ArrowUp size={14} className="text-gray-500" />
            </button>
            <div className="w-px h-5 bg-gray-200 dark:bg-gray-700" />
            <button
              onClick={() => navigateSibling(-1)}
              disabled={isTransitioning || featureIndex <= 0}
              className={btnClass}
            >
              <ChevronLeft size={16} className="text-gray-600 dark:text-gray-300" />
            </button>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300 min-w-[90px] text-center">
              Feature {featureIndex + 1} / {totalFeatures}
            </span>
            <button
              onClick={() => navigateSibling(1)}
              disabled={isTransitioning || featureIndex >= totalFeatures - 1}
              className={btnClass}
            >
              <ChevronRight size={16} className="text-gray-600 dark:text-gray-300" />
            </button>
          </>
        )}

        <div className="w-px h-5 bg-gray-200 dark:bg-gray-700" />

        <button
          onClick={toggleAutoPlay}
          className={`${btnClass} ${isAutoPlaying ? 'text-blue-500' : 'text-gray-400'}`}
          title={isAutoPlaying ? 'Auto-Play stoppen' : 'Auto-Play starten'}
        >
          {isAutoPlaying ? <Pause size={14} /> : <Play size={14} />}
        </button>

        <button
          onClick={stopPresentation}
          className={btnClass}
          title="Praesentation beenden"
        >
          <X size={14} className="text-gray-400" />
        </button>
        <span className={kbdClass}>Esc</span>
      </motion.div>
    </div>
  );
});
