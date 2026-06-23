import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import type { RoadmapNode, RoadmapEdge, RoadmapArea, RoadmapNodeData, NodeLevel, NodeStatus, Viewport, EdgeStyle, EdgeDirection } from '../types/roadmap';
import type { RoadmapProject } from '../types/roadmap';
import { wouldCreateCycle } from '../lib/cycle-detection';
import { applyAutoLayout } from '../lib/layout';
import { DEFAULT_HEX } from '../lib/node-colors';

interface HierarchyEdgeOverride {
  sourceHandle?: string | null;
  targetHandle?: string | null;
  style?: EdgeStyle;
  direction?: EdgeDirection;
}

interface HistoryEntry {
  nodes: RoadmapNode[];
  edges: RoadmapEdge[];
}

interface RoadmapState {
  projectName: string;
  projectDescription: string;
  nodes: RoadmapNode[];
  edges: RoadmapEdge[];
  areas: RoadmapArea[];
  hierarchyEdges: Record<string, HierarchyEdgeOverride>;
  viewport: Viewport;
  autoLayout: boolean;

  history: HistoryEntry[];
  historyIndex: number;
  maxHistory: number;

  setProjectName: (name: string) => void;
  setProjectDescription: (desc: string) => void;

  addNode: (parentId: string | null, level: NodeLevel, title?: string) => string;
  updateNode: (id: string, data: Partial<RoadmapNodeData>) => void;
  deleteNode: (id: string) => void;
  cycleStatus: (id: string) => void;

  addDependencyEdge: (source: string, target: string, style?: EdgeStyle, sourceHandle?: string | null, targetHandle?: string | null) => boolean;
  updateEdge: (id: string, updates: { style?: EdgeStyle; label?: string; direction?: EdgeDirection }) => void;
  reconnectEdge: (oldEdgeId: string, connection: { source: string | null; target: string | null; sourceHandle?: string | null; targetHandle?: string | null }) => boolean;
  removeEdge: (id: string) => void;

  updateHierarchyEdge: (childId: string, updates: HierarchyEdgeOverride) => void;
  reconnectHierarchyEdge: (childId: string, parentId: string, connection: { source: string | null; target: string | null; sourceHandle?: string | null; targetHandle?: string | null }) => boolean;

  reparentNode: (nodeId: string, newParentId: string | null) => boolean;
  toggleCollapse: (nodeId: string) => void;

  updateNodePosition: (id: string, position: { x: number; y: number }) => void;
  updateNodePositions: (updates: Array<{ id: string; position: { x: number; y: number } }>) => void;

  addArea: (position: { x: number; y: number }) => string;
  updateArea: (id: string, updates: Partial<Pick<RoadmapArea, 'name' | 'color'>>) => void;
  updateAreaRect: (id: string, rect: { position?: { x: number; y: number }; width?: number; height?: number }) => void;
  updateAreaPositions: (updates: Array<{ id: string; position: { x: number; y: number } }>) => void;
  removeArea: (id: string) => void;
  runAutoLayout: () => void;
  setViewport: (viewport: Viewport) => void;

  getVisibleNodes: () => RoadmapNode[];
  getAllEdges: () => RoadmapEdge[];
  getGoalColor: (nodeId: string) => string;

  exportProject: () => RoadmapProject;
  importProject: (project: RoadmapProject) => void;

  setCollapsedBatch: (updates: Array<{ id: string; collapsed: boolean }>) => void;

  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  pushHistory: () => void;
}

function now() {
  return new Date().toISOString();
}

function getAllDescendantIds(nodeId: string, nodes: RoadmapNode[]): string[] {
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const ids: string[] = [];
  function collect(id: string) {
    const node = nodeMap.get(id);
    if (!node) return;
    for (const childId of node.data.childrenIds) {
      ids.push(childId);
      collect(childId);
    }
  }
  collect(nodeId);
  return ids;
}

function getCollapsedNodeIds(nodes: RoadmapNode[]): Set<string> {
  const hidden = new Set<string>();
  for (const node of nodes) {
    if (node.data.collapsed) {
      for (const id of getAllDescendantIds(node.id, nodes)) {
        hidden.add(id);
      }
    }
  }
  return hidden;
}

function findGoalAncestor(nodeId: string, nodes: RoadmapNode[]): RoadmapNode | null {
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  let current = nodeMap.get(nodeId);
  while (current) {
    if (current.data.level === 'goal') return current;
    if (!current.data.parentId) return null;
    current = nodeMap.get(current.data.parentId);
  }
  return null;
}

export const useRoadmapStore = create<RoadmapState>()(
  persist(
    (set, get) => ({
      projectName: 'Neue Roadmap',
      projectDescription: '',
      nodes: [],
      edges: [],
      areas: [],
      hierarchyEdges: {},
      viewport: { x: 0, y: 0, zoom: 1 },
      autoLayout: true,

      history: [],
      historyIndex: -1,
      maxHistory: 50,

      setProjectName: (name) => set({ projectName: name }),
      setProjectDescription: (desc) => set({ projectDescription: desc }),

      addNode: (parentId, level, title) => {
        const state = get();
        state.pushHistory();
        const id = nanoid();
        const timestamp = now();

        const parentNode = parentId ? state.nodes.find(n => n.id === parentId) : null;
        const position = parentNode
          ? { x: parentNode.position.x, y: parentNode.position.y + 200 }
          : { x: Math.random() * 400, y: Math.random() * 400 };

        const defaultTitle = level === 'goal' ? 'Neues Ziel' : level === 'feature' ? 'Neues Feature' : 'Neuer Task';
        const newNode: RoadmapNode = {
          id,
          type: level,
          position,
          data: {
            title: title ?? defaultTitle,
            subtitle: '',
            description: '',
            status: 'later',
            level,
            parentId,
            childrenIds: [],
            collapsed: false,
            color: level === 'goal' ? DEFAULT_HEX : null,
            hours: 0,
            createdAt: timestamp,
            updatedAt: timestamp,
          },
        };

        const updatedNodes = [...state.nodes, newNode];

        if (parentId) {
          const parentIdx = updatedNodes.findIndex(n => n.id === parentId);
          if (parentIdx !== -1) {
            updatedNodes[parentIdx] = {
              ...updatedNodes[parentIdx],
              data: {
                ...updatedNodes[parentIdx].data,
                childrenIds: [...updatedNodes[parentIdx].data.childrenIds, id],
                updatedAt: timestamp,
              },
            };
          }
        }

        set({ nodes: updatedNodes });
        return id;
      },

      updateNode: (id, data) => {
        const state = get();
        state.pushHistory();
        set({
          nodes: state.nodes.map(n =>
            n.id === id
              ? { ...n, data: { ...n.data, ...data, updatedAt: now() } }
              : n
          ),
        });
      },

      deleteNode: (id) => {
        const state = get();
        state.pushHistory();
        const descendantIds = getAllDescendantIds(id, state.nodes);
        const idsToRemove = new Set([id, ...descendantIds]);

        const node = state.nodes.find(n => n.id === id);
        let updatedNodes = state.nodes.filter(n => !idsToRemove.has(n.id));

        if (node?.data.parentId) {
          updatedNodes = updatedNodes.map(n =>
            n.id === node.data.parentId
              ? {
                  ...n,
                  data: {
                    ...n.data,
                    childrenIds: n.data.childrenIds.filter(cId => cId !== id),
                    updatedAt: now(),
                  },
                }
              : n
          );
        }

        const updatedEdges = state.edges.filter(
          e => !idsToRemove.has(e.source) && !idsToRemove.has(e.target)
        );

        set({ nodes: updatedNodes, edges: updatedEdges });
      },

      cycleStatus: (id) => {
        const state = get();
        const node = state.nodes.find(n => n.id === id);
        if (!node) return;

        const order: NodeStatus[] = ['later', 'next', 'now', 'done'];
        const currentIndex = order.indexOf(node.data.status);
        const nextStatus = order[(currentIndex + 1) % order.length];

        state.updateNode(id, { status: nextStatus });
      },

      addDependencyEdge: (source, target, style = 'solid', sourceHandle = null, targetHandle = null) => {
        const state = get();
        if (source === target) return false;
        if (state.edges.some(e => e.source === source && e.target === target && e.type === 'dependency')) return false;
        if (wouldCreateCycle(state.edges, source, target)) return false;

        state.pushHistory();
        const edge: RoadmapEdge = {
          id: `dep-${nanoid()}`,
          source,
          target,
          sourceHandle,
          targetHandle,
          type: 'dependency',
          style,
          direction: 'forward',
        };
        set({ edges: [...state.edges, edge] });
        return true;
      },

      updateEdge: (id, updates) => {
        const state = get();
        state.pushHistory();
        set({
          edges: state.edges.map(e =>
            e.id === id ? { ...e, ...updates } : e
          ),
        });
      },

      reconnectEdge: (oldEdgeId, connection) => {
        const state = get();
        const edge = state.edges.find(e => e.id === oldEdgeId);
        // Only stored dependency edges can be reconnected (hierarchy edges are derived).
        if (!edge) return false;

        const { source, target, sourceHandle = null, targetHandle = null } = connection;
        if (!source || !target || source === target) return false;

        const others = state.edges.filter(e => e.id !== oldEdgeId);
        if (others.some(e => e.source === source && e.target === target && e.type === 'dependency')) return false;
        if (wouldCreateCycle(others, source, target)) return false;

        state.pushHistory();
        set({
          edges: state.edges.map(e =>
            e.id === oldEdgeId
              ? { ...e, source, target, sourceHandle, targetHandle }
              : e
          ),
        });
        return true;
      },

      removeEdge: (id) => {
        const state = get();
        state.pushHistory();
        set({ edges: state.edges.filter(e => e.id !== id) });
      },

      updateHierarchyEdge: (childId, updates) => {
        const state = get();
        set({
          hierarchyEdges: {
            ...state.hierarchyEdges,
            [childId]: { ...state.hierarchyEdges[childId], ...updates },
          },
        });
      },

      reconnectHierarchyEdge: (childId, parentId, connection) => {
        const { source, target, sourceHandle = null, targetHandle = null } = connection;
        if (!source || !target || source === target) return false;
        // Keep the tree structure intact: only allow moving the attachment
        // points (handles) between the same parent and child. In loose mode the
        // dragged end can be reported as either source or target, so map the
        // handles back onto parent/child regardless of orientation.
        const involved = new Set([source, target]);
        if (!involved.has(parentId) || !involved.has(childId)) return false;
        const parentHandle = source === parentId ? sourceHandle : targetHandle;
        const childHandle = source === parentId ? targetHandle : sourceHandle;
        get().updateHierarchyEdge(childId, { sourceHandle: parentHandle, targetHandle: childHandle });
        return true;
      },

      reparentNode: (nodeId, newParentId) => {
        const state = get();
        const node = state.nodes.find(n => n.id === nodeId);
        if (!node) return false;

        if (newParentId) {
          const descendants = getAllDescendantIds(nodeId, state.nodes);
          if (descendants.includes(newParentId) || nodeId === newParentId) return false;
        }

        state.pushHistory();
        let updatedNodes = [...state.nodes];

        if (node.data.parentId) {
          updatedNodes = updatedNodes.map(n =>
            n.id === node.data.parentId
              ? {
                  ...n,
                  data: {
                    ...n.data,
                    childrenIds: n.data.childrenIds.filter(id => id !== nodeId),
                    updatedAt: now(),
                  },
                }
              : n
          );
        }

        updatedNodes = updatedNodes.map(n => {
          if (n.id === nodeId) {
            return { ...n, data: { ...n.data, parentId: newParentId, updatedAt: now() } };
          }
          if (n.id === newParentId) {
            return {
              ...n,
              data: {
                ...n.data,
                childrenIds: [...n.data.childrenIds, nodeId],
                updatedAt: now(),
              },
            };
          }
          return n;
        });

        set({ nodes: updatedNodes });
        return true;
      },

      toggleCollapse: (nodeId) => {
        set(state => ({
          nodes: state.nodes.map(n =>
            n.id === nodeId
              ? { ...n, data: { ...n.data, collapsed: !n.data.collapsed } }
              : n
          ),
        }));
      },

      updateNodePosition: (id, position) => {
        set(state => ({
          nodes: state.nodes.map(n =>
            n.id === id ? { ...n, position } : n
          ),
        }));
      },

      updateNodePositions: (updates) => {
        if (updates.length === 0) return;
        const posMap = new Map(updates.map(u => [u.id, u.position]));
        set(state => ({
          nodes: state.nodes.map(n => {
            const pos = posMap.get(n.id);
            return pos ? { ...n, position: pos } : n;
          }),
        }));
      },

      addArea: (position) => {
        const state = get();
        state.pushHistory();
        const id = `area-${nanoid()}`;
        const area: RoadmapArea = {
          id,
          name: 'Neuer Bereich',
          position,
          width: 360,
          height: 240,
          color: DEFAULT_HEX,
        };
        set({ areas: [...state.areas, area] });
        return id;
      },

      updateArea: (id, updates) => {
        const state = get();
        state.pushHistory();
        set({ areas: state.areas.map(a => (a.id === id ? { ...a, ...updates } : a)) });
      },

      updateAreaRect: (id, rect) => {
        set(state => ({
          areas: state.areas.map(a =>
            a.id === id
              ? {
                  ...a,
                  position: rect.position ?? a.position,
                  width: rect.width ?? a.width,
                  height: rect.height ?? a.height,
                }
              : a
          ),
        }));
      },

      updateAreaPositions: (updates) => {
        if (updates.length === 0) return;
        const posMap = new Map(updates.map(u => [u.id, u.position]));
        set(state => ({
          areas: state.areas.map(a => {
            const pos = posMap.get(a.id);
            return pos ? { ...a, position: pos } : a;
          }),
        }));
      },

      removeArea: (id) => {
        const state = get();
        state.pushHistory();
        set({ areas: state.areas.filter(a => a.id !== id) });
      },

      runAutoLayout: () => {
        const state = get();
        const allEdges = state.getAllEdges();
        const visibleNodes = state.getVisibleNodes();
        const layoutedNodes = applyAutoLayout(visibleNodes, allEdges);

        const layoutMap = new Map(layoutedNodes.map(n => [n.id, n.position]));
        set({
          nodes: state.nodes.map(n => {
            const pos = layoutMap.get(n.id);
            return pos ? { ...n, position: pos } : n;
          }),
        });
      },

      setViewport: (viewport) => set({ viewport }),

      getVisibleNodes: () => {
        const state = get();
        const hidden = getCollapsedNodeIds(state.nodes);
        return state.nodes.filter(n => !hidden.has(n.id));
      },

      getAllEdges: () => {
        const state = get();
        const hierarchyEdges: RoadmapEdge[] = state.nodes
          .filter(n => n.data.parentId)
          .map(n => {
            const o = state.hierarchyEdges[n.id] ?? {};
            return {
              id: `hierarchy-${n.data.parentId}-${n.id}`,
              source: n.data.parentId!,
              target: n.id,
              sourceHandle: o.sourceHandle ?? 'bottom',
              targetHandle: o.targetHandle ?? 'top',
              type: 'hierarchy' as const,
              style: o.style ?? ('solid' as const),
              direction: o.direction ?? ('none' as const),
            };
          });
        return [...state.edges, ...hierarchyEdges];
      },

      getGoalColor: (nodeId) => {
        const state = get();
        const goal = findGoalAncestor(nodeId, state.nodes);
        return goal?.data.color ?? DEFAULT_HEX;
      },

      exportProject: () => {
        const state = get();
        const timestamp = now();
        return {
          version: '1.0' as const,
          name: state.projectName,
          description: state.projectDescription,
          createdAt: timestamp,
          updatedAt: timestamp,
          nodes: state.nodes,
          edges: state.edges,
          areas: state.areas,
          viewport: state.viewport,
          settings: {
            theme: (document.documentElement.classList.contains('dark') ? 'dark' : 'light') as 'light' | 'dark',
            autoLayout: state.autoLayout,
          },
        };
      },

      importProject: (project) => {
        set({
          projectName: project.name,
          projectDescription: project.description,
          nodes: project.nodes,
          edges: project.edges,
          areas: project.areas ?? [],
          hierarchyEdges: {},
          viewport: project.viewport,
          autoLayout: project.settings.autoLayout,
          history: [],
          historyIndex: -1,
        });
      },

      setCollapsedBatch: (updates) => {
        const updateMap = new Map(updates.map(u => [u.id, u.collapsed]));
        set(state => ({
          nodes: state.nodes.map(n => {
            const collapsed = updateMap.get(n.id);
            return collapsed !== undefined
              ? { ...n, data: { ...n.data, collapsed } }
              : n;
          }),
        }));
      },

      pushHistory: () => {
        set(state => {
          const entry: HistoryEntry = {
            nodes: JSON.parse(JSON.stringify(state.nodes)),
            edges: JSON.parse(JSON.stringify(state.edges)),
          };
          const newHistory = state.history.slice(0, state.historyIndex + 1);
          newHistory.push(entry);
          if (newHistory.length > state.maxHistory) {
            newHistory.shift();
          }
          return {
            history: newHistory,
            historyIndex: newHistory.length - 1,
          };
        });
      },

      undo: () => {
        const state = get();
        if (state.historyIndex < 0) return;
        const entry = state.history[state.historyIndex];
        set({
          nodes: entry.nodes,
          edges: entry.edges,
          historyIndex: state.historyIndex - 1,
        });
      },

      redo: () => {
        const state = get();
        if (state.historyIndex >= state.history.length - 1) return;
        const entry = state.history[state.historyIndex + 1];
        if (!entry) return;
        set({
          nodes: entry.nodes,
          edges: entry.edges,
          historyIndex: state.historyIndex + 1,
        });
      },

      canUndo: () => get().historyIndex >= 0,
      canRedo: () => get().historyIndex < get().history.length - 1,
    }),
    {
      name: 'roadmap-storage',
      version: 1,
      // v1: collapsed the per-side source/target handles (e.g. "left-target",
      // "right-source") into a single handle per side ("top"/"right"/"bottom"/"left").
      migrate: (persisted: any, version) => {
        if (!persisted || version >= 1) return persisted;
        const normHandle = (h: string | null | undefined) => {
          if (!h) return h;
          if (h.startsWith('left')) return 'left';
          if (h.startsWith('right')) return 'right';
          if (h.startsWith('top')) return 'top';
          if (h.startsWith('bottom')) return 'bottom';
          return h;
        };
        if (Array.isArray(persisted.edges)) {
          persisted.edges = persisted.edges.map((e: any) => ({
            ...e,
            sourceHandle: normHandle(e.sourceHandle),
            targetHandle: normHandle(e.targetHandle),
          }));
        }
        if (persisted.hierarchyEdges && typeof persisted.hierarchyEdges === 'object') {
          const next: Record<string, any> = {};
          for (const [key, o] of Object.entries<any>(persisted.hierarchyEdges)) {
            next[key] = { ...o, sourceHandle: normHandle(o?.sourceHandle), targetHandle: normHandle(o?.targetHandle) };
          }
          persisted.hierarchyEdges = next;
        }
        return persisted;
      },
      partialize: (state) => ({
        projectName: state.projectName,
        projectDescription: state.projectDescription,
        nodes: state.nodes,
        edges: state.edges,
        areas: state.areas,
        hierarchyEdges: state.hierarchyEdges,
        viewport: state.viewport,
        autoLayout: state.autoLayout,
      }),
    }
  )
);
