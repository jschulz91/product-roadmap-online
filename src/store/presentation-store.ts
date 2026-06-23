import { create } from 'zustand';
import { useRoadmapStore } from './roadmap-store';
import { useUIStore } from './ui-store';
import type { RoadmapNode } from '../types/roadmap';

export type ExplorerLevel = 'overview' | 'goal' | 'feature';

interface PresentationState {
  level: ExplorerLevel;
  focusedGoalId: string | null;
  focusedFeatureId: string | null;
  goalIndex: number;
  featureIndex: number;
  isAutoPlaying: boolean;
  isTransitioning: boolean;
  preCollapseState: Map<string, boolean>;

  enterExplorer: () => void;
  exitExplorer: () => void;
  focusGoal: (goalId: string, index: number) => void;
  focusFeature: (featureId: string, index: number) => void;
  goBack: () => void;
  navigateSibling: (direction: 1 | -1) => void;
  drillDown: () => void;
  setTransitioning: (v: boolean) => void;
  toggleAutoPlay: () => void;

  getGoalNodes: () => RoadmapNode[];
  getFeaturesOfGoal: (goalId: string) => RoadmapNode[];
  getTasksOfFeature: (featureId: string) => RoadmapNode[];
}

export const usePresentationStore = create<PresentationState>()((set, get) => ({
  level: 'overview',
  focusedGoalId: null,
  focusedFeatureId: null,
  goalIndex: 0,
  featureIndex: 0,
  isAutoPlaying: false,
  isTransitioning: false,
  preCollapseState: new Map(),

  getGoalNodes: () => {
    // Presentation order is controlled via the goal-level `order` index.
    // Array.sort is stable, so equal orders keep their existing order.
    return useRoadmapStore.getState().nodes
      .filter(n => n.data.level === 'goal')
      .sort((a, b) => (a.data.order ?? 0) - (b.data.order ?? 0));
  },

  getFeaturesOfGoal: (goalId: string) => {
    return useRoadmapStore.getState().nodes
      .filter(n => n.data.parentId === goalId && n.data.level === 'feature')
      .sort((a, b) => (a.data.order ?? 0) - (b.data.order ?? 0));
  },

  getTasksOfFeature: (featureId: string) => {
    return useRoadmapStore.getState().nodes.filter(
      n => n.data.parentId === featureId && n.data.level === 'task'
    );
  },

  enterExplorer: () => {
    const roadmap = useRoadmapStore.getState();
    const nodes = roadmap.nodes;
    const goalNodes = nodes.filter(n => n.data.level === 'goal');

    if (goalNodes.length === 0) {
      useUIStore.getState().addToast('Keine Ziele vorhanden', 'info');
      useUIStore.getState().stopPresentation();
      return;
    }

    const collapseState = new Map<string, boolean>();
    nodes.forEach(n => {
      if (n.data.childrenIds.length > 0) {
        collapseState.set(n.id, n.data.collapsed);
      }
    });

    const collapseUpdates = nodes
      .filter(n => n.data.childrenIds.length > 0)
      .map(n => ({ id: n.id, collapsed: true }));

    roadmap.setCollapsedBatch(collapseUpdates);

    set({
      level: 'overview',
      focusedGoalId: null,
      focusedFeatureId: null,
      goalIndex: 0,
      featureIndex: 0,
      isAutoPlaying: false,
      isTransitioning: false,
      preCollapseState: collapseState,
    });
  },

  exitExplorer: () => {
    const state = get();
    const roadmap = useRoadmapStore.getState();

    const restoreUpdates = Array.from(state.preCollapseState.entries()).map(
      ([id, collapsed]) => ({ id, collapsed })
    );
    if (restoreUpdates.length > 0) {
      roadmap.setCollapsedBatch(restoreUpdates);
    }

    set({
      level: 'overview',
      focusedGoalId: null,
      focusedFeatureId: null,
      goalIndex: 0,
      featureIndex: 0,
      isAutoPlaying: false,
      isTransitioning: false,
      preCollapseState: new Map(),
    });
  },

  focusGoal: (goalId, index) => {
    const state = get();
    if (state.isTransitioning) return;

    const roadmap = useRoadmapStore.getState();
    const collapseUpdates: Array<{ id: string; collapsed: boolean }> = [];

    if (state.focusedFeatureId) {
      collapseUpdates.push({ id: state.focusedFeatureId, collapsed: true });
    }
    if (state.focusedGoalId && state.focusedGoalId !== goalId) {
      collapseUpdates.push({ id: state.focusedGoalId, collapsed: true });
    }
    collapseUpdates.push({ id: goalId, collapsed: false });

    roadmap.setCollapsedBatch(collapseUpdates);

    set({
      level: 'goal',
      focusedGoalId: goalId,
      focusedFeatureId: null,
      goalIndex: index,
      featureIndex: 0,
    });
  },

  focusFeature: (featureId, index) => {
    const state = get();
    if (state.isTransitioning) return;

    const roadmap = useRoadmapStore.getState();
    const collapseUpdates: Array<{ id: string; collapsed: boolean }> = [];

    if (state.focusedFeatureId && state.focusedFeatureId !== featureId) {
      collapseUpdates.push({ id: state.focusedFeatureId, collapsed: true });
    }
    collapseUpdates.push({ id: featureId, collapsed: false });

    roadmap.setCollapsedBatch(collapseUpdates);

    set({
      level: 'feature',
      focusedFeatureId: featureId,
      featureIndex: index,
    });
  },

  goBack: () => {
    const state = get();
    if (state.isTransitioning) return;

    const roadmap = useRoadmapStore.getState();

    if (state.level === 'feature' && state.focusedFeatureId) {
      roadmap.setCollapsedBatch([{ id: state.focusedFeatureId, collapsed: true }]);
      set({ level: 'goal', focusedFeatureId: null, featureIndex: 0 });
    } else if (state.level === 'goal' && state.focusedGoalId) {
      roadmap.setCollapsedBatch([{ id: state.focusedGoalId, collapsed: true }]);
      set({ level: 'overview', focusedGoalId: null, focusedFeatureId: null, goalIndex: 0 });
    } else {
      useUIStore.getState().stopPresentation();
    }
  },

  navigateSibling: (direction) => {
    const state = get();
    if (state.isTransitioning) return;

    if (state.level === 'overview' || state.level === 'goal') {
      const goals = get().getGoalNodes();
      const newIndex = state.goalIndex + direction;
      if (newIndex >= 0 && newIndex < goals.length) {
        get().focusGoal(goals[newIndex].id, newIndex);
      }
    } else if (state.level === 'feature' && state.focusedGoalId) {
      const features = get().getFeaturesOfGoal(state.focusedGoalId);
      const newIndex = state.featureIndex + direction;
      if (newIndex >= 0 && newIndex < features.length) {
        get().focusFeature(features[newIndex].id, newIndex);
      }
    }
  },

  drillDown: () => {
    const state = get();
    if (state.isTransitioning) return;

    if (state.level === 'overview') {
      const goals = get().getGoalNodes();
      if (goals.length > 0) {
        get().focusGoal(goals[state.goalIndex]?.id ?? goals[0].id, state.goalIndex);
      }
    } else if (state.level === 'goal' && state.focusedGoalId) {
      const features = get().getFeaturesOfGoal(state.focusedGoalId);
      if (features.length > 0) {
        get().focusFeature(features[0].id, 0);
      }
    }
  },

  setTransitioning: (v) => set({ isTransitioning: v }),
  toggleAutoPlay: () => set(s => ({ isAutoPlaying: !s.isAutoPlaying })),
}));
