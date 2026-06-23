import { memo, useCallback } from 'react';
import { Plus, LayoutGrid, Square, ChevronsDownUp, ChevronsUpDown } from 'lucide-react';
import { useReactFlow } from '@xyflow/react';
import { useRoadmapStore } from '../../store/roadmap-store';
import { useUIStore } from '../../store/ui-store';

interface CanvasContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
}

export const CanvasContextMenu = memo(function CanvasContextMenu({ x, y, onClose }: CanvasContextMenuProps) {
  const addNode = useRoadmapStore(s => s.addNode);
  const addArea = useRoadmapStore(s => s.addArea);
  const runAutoLayout = useRoadmapStore(s => s.runAutoLayout);
  const collapseAll = useRoadmapStore(s => s.collapseAll);
  const expandAll = useRoadmapStore(s => s.expandAll);
  const selectNode = useUIStore(s => s.selectNode);
  const { screenToFlowPosition } = useReactFlow();

  const handleCollapseAll = useCallback(() => { collapseAll(); onClose(); }, [collapseAll, onClose]);
  const handleExpandAll = useCallback(() => { expandAll(); onClose(); }, [expandAll, onClose]);

  const handleAddGoal = useCallback(() => {
    const id = addNode(null, 'goal');
    selectNode(id);
    onClose();
  }, [addNode, selectNode, onClose]);

  const handleAddArea = useCallback(() => {
    const pos = screenToFlowPosition({ x, y });
    addArea(pos);
    onClose();
  }, [addArea, screenToFlowPosition, x, y, onClose]);

  const handleAutoLayout = useCallback(() => {
    runAutoLayout();
    onClose();
  }, [runAutoLayout, onClose]);

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="fixed z-50 min-w-[180px] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 text-xs"
        style={{ left: x, top: y }}
      >
        <button onClick={handleAddGoal} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
          <Plus size={14} />
          Neues Ziel erstellen
        </button>
        <button onClick={handleAddArea} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
          <Square size={14} />
          Bereich hinzufügen
        </button>
        <button onClick={handleAutoLayout} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
          <LayoutGrid size={14} />
          Auto-Layout
        </button>
        <button onClick={handleCollapseAll} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
          <ChevronsDownUp size={14} />
          Alle einklappen
        </button>
        <button onClick={handleExpandAll} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
          <ChevronsUpDown size={14} />
          Alle ausklappen
        </button>
      </div>
    </>
  );
});
