import { ReactFlowProvider } from '@xyflow/react';
import { Header } from './components/layout/Header';
import { RoadmapCanvas } from './components/canvas/RoadmapCanvas';
import { NodeDetailPanel } from './components/panels/NodeDetailPanel';
import { Toasts } from './components/ui/Toast';
import { useUIStore } from './store/ui-store';

export default function App() {
  const isPresentationMode = useUIStore(s => s.isPresentationMode);

  return (
    <ReactFlowProvider>
      <div className="h-screen w-screen flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-100">
        {!isPresentationMode && <Header />}
        <RoadmapCanvas />
        {!isPresentationMode && <NodeDetailPanel />}
        <Toasts />
      </div>
    </ReactFlowProvider>
  );
}
