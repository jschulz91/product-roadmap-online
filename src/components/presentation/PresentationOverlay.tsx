import { memo, useEffect, useRef, useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRoadmapStore } from '../../store/roadmap-store';
import { useUIStore } from '../../store/ui-store';
import { usePresentationStore } from '../../store/presentation-store';
import { flyToOverview, flyToGoal, flyToFeature } from '../../lib/camera';
import { ExplorerInfoPanel } from './ExplorerInfoPanel';
import { ExplorerBreadcrumb } from './ExplorerBreadcrumb';
import { ExplorerHUD } from './ExplorerHUD';

export const PresentationOverlay = memo(function PresentationOverlay() {
  const isPresentationMode = useUIStore(s => s.isPresentationMode);

  const level = usePresentationStore(s => s.level);
  const focusedGoalId = usePresentationStore(s => s.focusedGoalId);
  const focusedFeatureId = usePresentationStore(s => s.focusedFeatureId);
  const isTransitioning = usePresentationStore(s => s.isTransitioning);
  const isAutoPlaying = usePresentationStore(s => s.isAutoPlaying);
  const goalIndex = usePresentationStore(s => s.goalIndex);
  const featureIndex = usePresentationStore(s => s.featureIndex);
  const setTransitioning = usePresentationStore(s => s.setTransitioning);
  const enterExplorer = usePresentationStore(s => s.enterExplorer);
  const exitExplorer = usePresentationStore(s => s.exitExplorer);
  const goBack = usePresentationStore(s => s.goBack);
  const navigateSibling = usePresentationStore(s => s.navigateSibling);
  const drillDown = usePresentationStore(s => s.drillDown);

  const nodes = useRoadmapStore(s => s.nodes);
  const rf = useReactFlow();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (isPresentationMode && !initializedRef.current) {
      initializedRef.current = true;
      enterExplorer();
      setTransitioning(true);
      setTimeout(async () => {
        await flyToOverview(rf);
        setTransitioning(false);
      }, 200);
    }
    if (!isPresentationMode && initializedRef.current) {
      initializedRef.current = false;
      exitExplorer();
      setTimeout(() => rf.fitView({ padding: 0.3, duration: 600 }), 50);
    }
  }, [isPresentationMode]);

  useEffect(() => {
    if (!isPresentationMode || !initializedRef.current) return;

    setTransitioning(true);

    const timer = setTimeout(async () => {
      try {
        if (level === 'overview') {
          await flyToOverview(rf);
        } else if (level === 'goal' && focusedGoalId) {
          await new Promise(r => setTimeout(r, 120));
          const goalNode = nodes.find(n => n.id === focusedGoalId);
          const featureNodes = nodes.filter(n => n.data.parentId === focusedGoalId);
          if (goalNode) {
            await flyToGoal(rf, goalNode, featureNodes);
          }
        } else if (level === 'feature' && focusedFeatureId) {
          await new Promise(r => setTimeout(r, 120));
          const featureNode = nodes.find(n => n.id === focusedFeatureId);
          const taskNodes = nodes.filter(n => n.data.parentId === focusedFeatureId);
          if (featureNode) {
            await flyToFeature(rf, featureNode, taskNodes);
          }
        }
      } finally {
        setTransitioning(false);
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [level, focusedGoalId, focusedFeatureId]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isPresentationMode) return;
    const store = usePresentationStore.getState();
    if (store.isTransitioning) return;

    switch (e.key) {
      case 'Escape':
      case 'Backspace':
      case 'ArrowUp':
        e.preventDefault();
        goBack();
        break;
      case 'Enter':
      case ' ':
      case 'ArrowDown':
        e.preventDefault();
        drillDown();
        break;
      case 'ArrowRight':
        e.preventDefault();
        navigateSibling(1);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        navigateSibling(-1);
        break;
      case 'Home':
        e.preventDefault();
        if (store.level !== 'overview') {
          if (store.level === 'feature') {
            store.goBack();
            setTimeout(() => usePresentationStore.getState().goBack(), 150);
          } else {
            store.goBack();
          }
        }
        break;
      default:
        if (/^[1-9]$/.test(e.key)) {
          const idx = parseInt(e.key) - 1;
          const goals = store.getGoalNodes();
          if (idx < goals.length) {
            store.focusGoal(goals[idx].id, idx);
          }
        }
    }
  }, [isPresentationMode, goBack, drillDown, navigateSibling]);

  useEffect(() => {
    if (!isPresentationMode) return;
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPresentationMode, handleKeyDown]);

  // Auto-play
  useEffect(() => {
    if (!isPresentationMode || !isAutoPlaying || isTransitioning) return;

    const timings = { overview: 3000, goal: 4000, feature: 3000 };
    const delay = timings[level];

    const timer = setTimeout(() => {
      const store = usePresentationStore.getState();
      if (store.isTransitioning) return;

      if (store.level === 'overview') {
        store.drillDown();
      } else if (store.level === 'goal') {
        const features = store.getFeaturesOfGoal(store.focusedGoalId!);
        if (features.length > 0) {
          store.drillDown();
        } else {
          const goals = store.getGoalNodes();
          if (store.goalIndex < goals.length - 1) {
            store.navigateSibling(1);
          } else {
            store.goBack();
          }
        }
      } else if (store.level === 'feature') {
        const features = store.getFeaturesOfGoal(store.focusedGoalId!);
        if (store.featureIndex < features.length - 1) {
          store.navigateSibling(1);
        } else {
          const goals = store.getGoalNodes();
          if (store.goalIndex < goals.length - 1) {
            store.goBack();
            setTimeout(() => {
              usePresentationStore.getState().navigateSibling(1);
            }, 900);
          } else {
            store.goBack();
            setTimeout(() => {
              usePresentationStore.getState().goBack();
            }, 900);
          }
        }
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [isPresentationMode, isAutoPlaying, isTransitioning, level, focusedGoalId, focusedFeatureId, goalIndex, featureIndex]);

  return (
    <AnimatePresence>
      {isPresentationMode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-30 pointer-events-none"
        >
          <ExplorerInfoPanel />
          <ExplorerBreadcrumb />
          <ExplorerHUD />
        </motion.div>
      )}
    </AnimatePresence>
  );
});
