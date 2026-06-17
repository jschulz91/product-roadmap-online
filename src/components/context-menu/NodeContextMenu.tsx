import { memo, useCallback } from 'react';
import { Plus, Trash2, FoldVertical, UnfoldVertical, ArrowRightLeft } from 'lucide-react';
import { useRoadmapStore } from '../../store/roadmap-store';
import { useUIStore } from '../../store/ui-store';
import { levelConfig } from '../../styles/theme';
import type { RoadmapNode } from '../../types/roadmap';

interface NodeContextMenuProps {
  node: RoadmapNode;
  x: number;
  y: number;
  onClose: () => void;
}

export const NodeContextMenu = memo(function NodeContextMenu({ node, x, y, onClose }: NodeContextMenuProps) {
  const addNode = useRoadmapStore(s => s.addNode);
  const deleteNode = useRoadmapStore(s => s.deleteNode);
  const toggleCollapse = useRoadmapStore(s => s.toggleCollapse);
  const selectNode = useUIStore(s => s.selectNode);

  const childLevel = levelConfig[node.data.level].childLevel;
  const hasChildren = node.data.childrenIds.length > 0;

  const handleAddChild = useCallback(() => {
    if (!childLevel) return;
    const newId = addNode(node.id, childLevel);
    selectNode(newId);
    onClose();
  }, [addNode, childLevel, node.id, selectNode, onClose]);

  const handleDelete = useCallback(() => {
    deleteNode(node.id);
    onClose();
  }, [deleteNode, node.id, onClose]);

  const handleToggleCollapse = useCallback(() => {
    toggleCollapse(node.id);
    onClose();
  }, [toggleCollapse, node.id, onClose]);

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="fixed z-50 min-w-[180px] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 text-xs"
        style={{ left: x, top: y }}
      >
        {childLevel && (
          <button onClick={handleAddChild} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
            <Plus size={14} />
            {levelConfig[node.data.level].childLabel}
          </button>
        )}
        {hasChildren && (
          <button onClick={handleToggleCollapse} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
            {node.data.collapsed ? <UnfoldVertical size={14} /> : <FoldVertical size={14} />}
            {node.data.collapsed ? 'Aufklappen' : 'Einklappen'}
          </button>
        )}
        <button onClick={() => { selectNode(node.id); onClose(); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
          <ArrowRightLeft size={14} />
          Bearbeiten
        </button>
        <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
        <button onClick={handleDelete} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-50 dark:hover:bg-red-950 text-red-600">
          <Trash2 size={14} />
          Loeschen
        </button>
      </div>
    </>
  );
});
