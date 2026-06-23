import { useCallback, useMemo, useState, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  ConnectionMode,
  MiniMap,
  type OnConnect,
  type OnReconnect,
  type OnNodeDrag,
  type OnNodesChange,
  type SelectionDragHandler,
  type NodeMouseHandler,
  type EdgeMouseHandler,
  useReactFlow,
  type Edge,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { GoalNode } from '../nodes/GoalNode';
import { FeatureNode } from '../nodes/FeatureNode';
import { TaskNode } from '../nodes/TaskNode';
import { AreaNode } from '../nodes/AreaNode';
import { DependencyEdge } from '../edges/DependencyEdge';
import { HierarchyEdge } from '../edges/HierarchyEdge';
import { Toolbar } from '../layout/Toolbar';
import { NodeContextMenu } from '../context-menu/NodeContextMenu';
import { CanvasContextMenu } from '../context-menu/CanvasContextMenu';
import { PresentationOverlay } from '../presentation/PresentationOverlay';
import { useRoadmapStore } from '../../store/roadmap-store';
import { useUIStore } from '../../store/ui-store';
import { usePresentationStore } from '../../store/presentation-store';
import { useKeyboardShortcuts } from '../../hooks/use-keyboard';
import { ImportDialog } from '../dialogs/ImportDialog';
import { demoNodes, demoEdges } from '../../lib/demo-data';
import type { RoadmapNode } from '../../types/roadmap';

const nodeTypes = {
  goal: GoalNode,
  feature: FeatureNode,
  task: TaskNode,
  area: AreaNode,
};

const edgeTypes = {
  dependency: DependencyEdge,
  hierarchy: HierarchyEdge,
};

function findGoalAncestorId(nodeId: string, nodeMap: Map<string, RoadmapNode>): string | null {
  let current = nodeMap.get(nodeId);
  while (current) {
    if (current.data.level === 'goal') return current.id;
    if (!current.data.parentId) return null;
    current = nodeMap.get(current.data.parentId);
  }
  return null;
}

export function RoadmapCanvas() {
  const nodes = useRoadmapStore(s => s.nodes);
  const edges = useRoadmapStore(s => s.edges);
  const areas = useRoadmapStore(s => s.areas);
  const hierarchyEdges = useRoadmapStore(s => s.hierarchyEdges);
  const viewport = useRoadmapStore(s => s.viewport);
  const getVisibleNodes = useRoadmapStore(s => s.getVisibleNodes);
  const getAllEdges = useRoadmapStore(s => s.getAllEdges);
  const moveNodesWithDescendants = useRoadmapStore(s => s.moveNodesWithDescendants);
  const updateAreaPositions = useRoadmapStore(s => s.updateAreaPositions);
  const updateAreaRect = useRoadmapStore(s => s.updateAreaRect);
  const addDependencyEdge = useRoadmapStore(s => s.addDependencyEdge);
  const reconnectEdge = useRoadmapStore(s => s.reconnectEdge);
  const reconnectHierarchyEdge = useRoadmapStore(s => s.reconnectHierarchyEdge);
  const setViewport = useRoadmapStore(s => s.setViewport);
  const runAutoLayout = useRoadmapStore(s => s.runAutoLayout);

  const selectNode = useUIStore(s => s.selectNode);
  const openEdgeMenu = useUIStore(s => s.openEdgeMenu);
  const closeEdgeMenu = useUIStore(s => s.closeEdgeMenu);
  const theme = useUIStore(s => s.theme);
  const addToast = useUIStore(s => s.addToast);
  const isPresentationMode = useUIStore(s => s.isPresentationMode);

  const explorerLevel = usePresentationStore(s => s.level);
  const focusedGoalId = usePresentationStore(s => s.focusedGoalId);
  const focusedFeatureId = usePresentationStore(s => s.focusedFeatureId);

  const { importOpen, setImportOpen } = useKeyboardShortcuts();
  const { fitView } = useReactFlow();

  const [contextMenu, setContextMenu] = useState<{
    type: 'node' | 'canvas';
    x: number;
    y: number;
    node?: RoadmapNode;
  } | null>(null);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (nodes.length === 0) {
      const storedData = localStorage.getItem('roadmap-storage');
      if (!storedData || JSON.parse(storedData).state?.nodes?.length === 0) {
        useRoadmapStore.setState({
          nodes: demoNodes,
          edges: demoEdges,
          projectName: 'Demo Roadmap',
        });
        setTimeout(() => {
          runAutoLayout();
          setTimeout(() => fitView({ padding: 0.3, duration: 500 }), 100);
        }, 100);
      }
    }
  }, []);

  const nodeMap = useMemo(() => new Map(nodes.map(n => [n.id, n])), [nodes]);

  const visibleNodes = useMemo(() => {
    const visible = getVisibleNodes();

    if (!isPresentationMode || explorerLevel === 'overview') {
      return visible.map(n => ({
        ...n,
        selected: selectedIds.has(n.id),
        className: isPresentationMode ? 'explorer-focused' : undefined,
      })) as Node[];
    }

    return visible.map(n => {
      const goalAncestorId = findGoalAncestorId(n.id, nodeMap);
      let dimClass: string;

      if (goalAncestorId !== focusedGoalId) {
        dimClass = 'explorer-dimmed';
      } else if (
        explorerLevel === 'feature' &&
        n.data.level === 'feature' &&
        n.id !== focusedFeatureId
      ) {
        dimClass = 'explorer-semi-dimmed';
      } else {
        dimClass = 'explorer-focused';
      }

      return { ...n, className: dimClass } as Node;
    });
  }, [nodes, getVisibleNodes, isPresentationMode, explorerLevel, focusedGoalId, focusedFeatureId, nodeMap, selectedIds]);

  const allEdges = useMemo(() => {
    const all = getAllEdges();
    const visibleIds = new Set(visibleNodes.map(n => n.id));

    return all
      .filter(e => visibleIds.has(e.source) && visibleIds.has(e.target))
      .map(({ style: edgeStyle, ...rest }) => {
        let edgeClassName: string | undefined;
        if (isPresentationMode && explorerLevel !== 'overview' && focusedGoalId) {
          const sourceGoal = findGoalAncestorId(rest.source, nodeMap);
          const targetGoal = findGoalAncestorId(rest.target, nodeMap);
          if (sourceGoal !== focusedGoalId && targetGoal !== focusedGoalId) {
            edgeClassName = 'explorer-edge-dimmed';
          } else {
            edgeClassName = 'explorer-edge-focused';
          }
        }
        return {
          ...rest,
          data: { style: edgeStyle ?? 'solid', direction: (rest as any).direction ?? 'forward' },
          className: edgeClassName,
          reconnectable: !isPresentationMode,
        };
      }) as Edge[];
  }, [nodes, edges, hierarchyEdges, getAllEdges, visibleNodes, isPresentationMode, explorerLevel, focusedGoalId, nodeMap]);

  const allNodes = useMemo(() => {
    const areaNodes = areas.map(a => ({
      id: a.id,
      type: 'area',
      position: a.position,
      width: a.width,
      height: a.height,
      data: { name: a.name, color: a.color },
      selected: selectedIds.has(a.id),
      draggable: !isPresentationMode,
      selectable: !isPresentationMode,
      connectable: false,
      zIndex: -1,
      style: { width: a.width, height: a.height },
    })) as Node[];
    return [...areaNodes, ...visibleNodes];
  }, [areas, visibleNodes, selectedIds, isPresentationMode]);

  const onConnect: OnConnect = useCallback(({ source, target, sourceHandle, targetHandle }) => {
    if (isPresentationMode) return;
    if (source && target) {
      const success = addDependencyEdge(source, target, undefined, sourceHandle, targetHandle);
      if (!success) {
        addToast('Kante konnte nicht erstellt werden (Duplikat oder Zyklus)', 'error');
      }
    }
  }, [addDependencyEdge, addToast, isPresentationMode]);

  const onReconnect: OnReconnect = useCallback((oldEdge, newConnection) => {
    if (isPresentationMode) return;
    if (oldEdge.type === 'hierarchy') {
      const success = reconnectHierarchyEdge(oldEdge.target, oldEdge.source, newConnection);
      if (!success) {
        addToast('Hierarchie-Linien koennen nur am selben Element verschoben werden', 'error');
      }
      return;
    }
    const success = reconnectEdge(oldEdge.id, newConnection);
    if (!success) {
      addToast('Kante konnte nicht umgehaengt werden (Duplikat oder Zyklus)', 'error');
    }
  }, [reconnectEdge, reconnectHierarchyEdge, addToast, isPresentationMode]);

  const areaIdSet = useMemo(() => new Set(areas.map(a => a.id)), [areas]);

  const onNodesChange: OnNodesChange = useCallback((changes) => {
    if (isPresentationMode) return;
    setSelectedIds(prev => {
      let next: Set<string> | null = null;
      for (const c of changes) {
        if (c.type === 'select') {
          if (!next) next = new Set(prev);
          if (c.selected) next.add(c.id);
          else next.delete(c.id);
        }
      }
      return next ?? prev;
    });
    // Areas are controlled, so apply their live resize/move changes to the store.
    for (const c of changes) {
      if (c.type === 'dimensions' && c.dimensions && areaIdSet.has(c.id)) {
        updateAreaRect(c.id, { width: c.dimensions.width, height: c.dimensions.height });
      } else if (c.type === 'position' && c.position && areaIdSet.has(c.id)) {
        updateAreaRect(c.id, { position: c.position });
      }
    }
  }, [isPresentationMode, areaIdSet, updateAreaRect]);

  const commitMoves = useCallback((moved: Node[]) => {
    const areaUpdates = moved.filter(n => n.type === 'area').map(n => ({ id: n.id, position: n.position }));
    const nodeUpdates = moved.filter(n => n.type !== 'area').map(n => ({ id: n.id, position: n.position }));
    if (areaUpdates.length) updateAreaPositions(areaUpdates);
    if (nodeUpdates.length) moveNodesWithDescendants(nodeUpdates);
  }, [updateAreaPositions, moveNodesWithDescendants]);

  const onNodeDragStop: OnNodeDrag = useCallback((_event, node, draggedNodes) => {
    if (isPresentationMode) return;
    commitMoves(draggedNodes && draggedNodes.length > 0 ? draggedNodes : [node]);
  }, [commitMoves, isPresentationMode]);

  const onSelectionDragStop: SelectionDragHandler<Node> = useCallback((_event, draggedNodes) => {
    if (isPresentationMode) return;
    commitMoves(draggedNodes);
  }, [commitMoves, isPresentationMode]);

  const onNodeClick: NodeMouseHandler = useCallback((event, node) => {
    if (isPresentationMode) {
      const roadmapNode = nodes.find(n => n.id === node.id);
      if (!roadmapNode) return;

      const store = usePresentationStore.getState();
      if (store.isTransitioning) return;

      if (roadmapNode.data.level === 'goal') {
        const goalNodes = store.getGoalNodes();
        const idx = goalNodes.findIndex(g => g.id === node.id);
        store.focusGoal(node.id, idx >= 0 ? idx : 0);
      } else if (roadmapNode.data.level === 'feature') {
        const goalId = findGoalAncestorId(node.id, nodeMap);
        if (goalId === store.focusedGoalId) {
          const features = nodes.filter(n => n.data.parentId === goalId && n.data.level === 'feature');
          const idx = features.findIndex(f => f.id === node.id);
          store.focusFeature(node.id, idx >= 0 ? idx : 0);
        }
      }
      return;
    }
    // Areas are edited inline on the canvas, not via the detail panel.
    if (node.type === 'area') return;
    // During a multi-selection (Shift/Ctrl/Cmd) keep the detail panel as-is.
    if (event.shiftKey || event.metaKey || event.ctrlKey) return;
    selectNode(node.id);
  }, [isPresentationMode, selectNode, nodes, nodeMap]);

  const onPaneClick = useCallback(() => {
    if (isPresentationMode) return;
    selectNode(null);
    closeEdgeMenu();
    setContextMenu(null);
  }, [selectNode, closeEdgeMenu, isPresentationMode]);

  const onEdgeDoubleClick: EdgeMouseHandler = useCallback((event, edge) => {
    if (isPresentationMode) return;
    event.stopPropagation();
    openEdgeMenu(edge.id);
  }, [openEdgeMenu, isPresentationMode]);

  const onNodeContextMenu: NodeMouseHandler = useCallback((event, node) => {
    if (isPresentationMode) return;
    event.preventDefault();
    const roadmapNode = nodes.find(n => n.id === node.id);
    if (roadmapNode) {
      setContextMenu({ type: 'node', x: event.clientX, y: event.clientY, node: roadmapNode });
    }
  }, [nodes, isPresentationMode]);

  const onPaneContextMenu = useCallback((event: MouseEvent | React.MouseEvent) => {
    if (isPresentationMode) return;
    event.preventDefault();
    setContextMenu({ type: 'canvas', x: (event as React.MouseEvent).clientX, y: (event as React.MouseEvent).clientY });
  }, [isPresentationMode]);

  return (
    <div className="flex-1 relative">
      <ReactFlow
        nodes={allNodes}
        edges={allEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        onConnect={onConnect}
        onReconnect={onReconnect}
        onNodesChange={onNodesChange}
        onNodeDragStop={onNodeDragStop}
        onSelectionDragStop={onSelectionDragStop}
        onNodeClick={onNodeClick}
        onEdgeDoubleClick={onEdgeDoubleClick}
        onPaneClick={onPaneClick}
        onNodeContextMenu={onNodeContextMenu}
        onPaneContextMenu={onPaneContextMenu}
        onMoveEnd={(_event, vp) => setViewport(vp)}
        defaultViewport={viewport}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        connectionLineStyle={{ stroke: '#94A3B8', strokeWidth: 2, strokeDasharray: '6 3' }}
        deleteKeyCode={null}
        nodesDraggable={!isPresentationMode}
        nodesConnectable={!isPresentationMode}
        proOptions={{ hideAttribution: true }}
        className={`bg-gray-50 dark:bg-gray-950 ${isPresentationMode ? 'explorer-mode' : ''}`}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color={theme === 'dark' ? '#374151' : '#D1D5DB'}
        />
        {!isPresentationMode && (
          <MiniMap
            nodeColor={(node) => {
              const status = (node.data as any)?.status;
              if (status === 'done') return '#059669';
              if (status === 'now') return '#2563EB';
              if (status === 'next') return '#F59E0B';
              return '#9CA3AF';
            }}
            maskColor={theme === 'dark' ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)'}
            className="!bg-white dark:!bg-gray-800 !border !border-gray-200 dark:!border-gray-700"
            pannable
            zoomable
          />
        )}
        {!isPresentationMode && <Toolbar />}
        <PresentationOverlay />

        <svg>
          <defs>
            <marker
              id="dependency-arrow"
              viewBox="0 0 12 12"
              refX="10"
              refY="6"
              markerWidth="8"
              markerHeight="8"
              orient="auto-start-reverse"
            >
              <path d="M 2 2 L 10 6 L 2 10 z" fill="#94A3B8" />
            </marker>
          </defs>
        </svg>
      </ReactFlow>

      {!isPresentationMode && contextMenu?.type === 'node' && contextMenu.node && (
        <NodeContextMenu
          node={contextMenu.node}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
        />
      )}
      {!isPresentationMode && contextMenu?.type === 'canvas' && (
        <CanvasContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
        />
      )}

      <ImportDialog open={importOpen} onOpenChange={setImportOpen} />
    </div>
  );
}
