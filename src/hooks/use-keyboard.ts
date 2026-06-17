import { useEffect, useState } from 'react';
import { useReactFlow } from '@xyflow/react';
import { useRoadmapStore } from '../store/roadmap-store';
import { useUIStore } from '../store/ui-store';
import { downloadProject } from '../lib/export';

export function useKeyboardShortcuts() {
  const { fitView } = useReactFlow();
  const undo = useRoadmapStore(s => s.undo);
  const redo = useRoadmapStore(s => s.redo);
  const runAutoLayout = useRoadmapStore(s => s.runAutoLayout);
  const deleteNode = useRoadmapStore(s => s.deleteNode);
  const removeEdge = useRoadmapStore(s => s.removeEdge);
  const exportProject = useRoadmapStore(s => s.exportProject);
  const selectedNodeId = useUIStore(s => s.selectedNodeId);
  const selectNode = useUIStore(s => s.selectNode);
  const setPanelOpen = useUIStore(s => s.setPanelOpen);
  const startPresentation = useUIStore(s => s.startPresentation);
  const isPresentationMode = useUIStore(s => s.isPresentationMode);
  const addToast = useUIStore(s => s.addToast);

  const [importOpen, setImportOpen] = useState(false);

  useEffect(() => {
    if (isPresentationMode) return;

    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          undo();
        }
        if (e.key === 'z' && e.shiftKey) {
          e.preventDefault();
          redo();
        }
        if (e.key === 's') {
          e.preventDefault();
          downloadProject(exportProject());
          addToast('Projekt exportiert', 'success');
        }
        if (e.key === 'o') {
          e.preventDefault();
          setImportOpen(true);
        }
        return;
      }

      if (isInput) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNodeId) {
          deleteNode(selectedNodeId);
          selectNode(null);
        }
      }
      if (e.key === 'Escape') {
        selectNode(null);
        setPanelOpen(false);
      }
      if (e.key === 'f') {
        fitView({ padding: 0.2, duration: 500 });
      }
      if (e.key === 'l') {
        runAutoLayout();
      }
      if (e.key === 'p') {
        startPresentation();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isPresentationMode, selectedNodeId, undo, redo, runAutoLayout, deleteNode, removeEdge, selectNode, setPanelOpen, fitView, exportProject, startPresentation, addToast]);

  return { importOpen, setImportOpen };
}
