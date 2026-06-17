import { memo } from 'react';
import { Plus, LayoutGrid, Maximize, Undo2, Redo2, ZoomIn, ZoomOut } from 'lucide-react';
import { useReactFlow } from '@xyflow/react';
import { useRoadmapStore } from '../../store/roadmap-store';
import { useUIStore } from '../../store/ui-store';

export const Toolbar = memo(function Toolbar() {
  const addNode = useRoadmapStore(s => s.addNode);
  const runAutoLayout = useRoadmapStore(s => s.runAutoLayout);
  const undo = useRoadmapStore(s => s.undo);
  const redo = useRoadmapStore(s => s.redo);
  const canUndo = useRoadmapStore(s => s.canUndo);
  const canRedo = useRoadmapStore(s => s.canRedo);
  const selectNode = useUIStore(s => s.selectNode);
  const { fitView, zoomIn, zoomOut } = useReactFlow();

  const handleAddGoal = () => {
    const id = addNode(null, 'goal');
    selectNode(id);
  };

  return (
    <div className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-1">
      <button
        onClick={handleAddGoal}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors"
        title="Neues Ziel"
      >
        <Plus size={14} />
        Ziel
      </button>

      <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />

      <button onClick={() => runAutoLayout()} className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors" title="Auto-Layout (L)">
        <LayoutGrid size={16} />
      </button>
      <button onClick={() => fitView({ padding: 0.2, duration: 500 })} className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors" title="Alles anzeigen (F)">
        <Maximize size={16} />
      </button>

      <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />

      <button onClick={() => zoomIn({ duration: 200 })} className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors" title="Hineinzoomen">
        <ZoomIn size={16} />
      </button>
      <button onClick={() => zoomOut({ duration: 200 })} className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors" title="Herauszoomen">
        <ZoomOut size={16} />
      </button>

      <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />

      <button
        onClick={() => undo()}
        disabled={!canUndo()}
        className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors disabled:opacity-30"
        title="Rueckgaengig (Ctrl+Z)"
      >
        <Undo2 size={16} />
      </button>
      <button
        onClick={() => redo()}
        disabled={!canRedo()}
        className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors disabled:opacity-30"
        title="Wiederholen (Ctrl+Shift+Z)"
      >
        <Redo2 size={16} />
      </button>
    </div>
  );
});
