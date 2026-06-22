import { memo, type ReactNode } from 'react';
import { BaseEdge, getBezierPath, EdgeLabelRenderer, type EdgeProps } from '@xyflow/react';
import {
  X, Minus, GripHorizontal, MoreVertical,
  ArrowRight, ArrowLeft, ArrowLeftRight, Slash,
} from 'lucide-react';
import { useRoadmapStore } from '../../store/roadmap-store';
import { useUIStore } from '../../store/ui-store';
import type { EdgeStyle, EdgeDirection } from '../../types/roadmap';

function MenuButton({ active, title, onClick, children }: {
  active: boolean;
  title: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      title={title}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`flex-1 flex items-center justify-center rounded-lg py-1.5 border transition-colors
        ${active
          ? 'bg-blue-50 dark:bg-blue-950 border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400'
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
        }`}
    >
      {children}
    </button>
  );
}

export const DependencyEdge = memo(function DependencyEdge(props: EdgeProps) {
  const { id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, selected, data } = props;
  const removeEdge = useRoadmapStore(s => s.removeEdge);
  const updateEdge = useRoadmapStore(s => s.updateEdge);
  const menuEdgeId = useUIStore(s => s.menuEdgeId);
  const openEdgeMenu = useUIStore(s => s.openEdgeMenu);
  const closeEdgeMenu = useUIStore(s => s.closeEdgeMenu);

  const edgeStyle: EdgeStyle = (data as any)?.style ?? 'solid';
  const direction: EdgeDirection = (data as any)?.direction ?? 'forward';
  const menuOpen = menuEdgeId === id;

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition,
  });

  const showEnd = direction === 'forward' || direction === 'both';
  const showStart = direction === 'backward' || direction === 'both';

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: selected || menuOpen ? '#3B82F6' : '#94A3B8',
          strokeWidth: selected || menuOpen ? 2.5 : 1.5,
          strokeDasharray: edgeStyle === 'dashed' ? '8 4' : undefined,
        }}
        markerStart={showStart ? 'url(#dependency-arrow)' : undefined}
        markerEnd={showEnd ? 'url(#dependency-arrow)' : undefined}
      />

      {(selected || menuOpen) && (
        <EdgeLabelRenderer>
          {menuOpen ? (
            <div
              className="nodrag nopan absolute pointer-events-auto rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl p-2 w-48"
              style={{ transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)` }}
              onClick={(e) => e.stopPropagation()}
              onDoubleClick={(e) => e.stopPropagation()}
            >
              <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 px-0.5 mb-1">
                Linientyp
              </div>
              <div className="flex gap-1 mb-2">
                <MenuButton active={edgeStyle === 'solid'} title="Durchgezogen" onClick={() => updateEdge(id, { style: 'solid' })}>
                  <Minus size={14} />
                </MenuButton>
                <MenuButton active={edgeStyle === 'dashed'} title="Gestrichelt" onClick={() => updateEdge(id, { style: 'dashed' })}>
                  <GripHorizontal size={14} />
                </MenuButton>
              </div>

              <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 px-0.5 mb-1">
                Richtung
              </div>
              <div className="flex gap-1 mb-2">
                <MenuButton active={direction === 'forward'} title="Vorwaerts" onClick={() => updateEdge(id, { direction: 'forward' })}>
                  <ArrowRight size={14} />
                </MenuButton>
                <MenuButton active={direction === 'backward'} title="Rueckwaerts" onClick={() => updateEdge(id, { direction: 'backward' })}>
                  <ArrowLeft size={14} />
                </MenuButton>
                <MenuButton active={direction === 'both'} title="Beide" onClick={() => updateEdge(id, { direction: 'both' })}>
                  <ArrowLeftRight size={14} />
                </MenuButton>
                <MenuButton active={direction === 'none'} title="Keine" onClick={() => updateEdge(id, { direction: 'none' })}>
                  <Slash size={14} />
                </MenuButton>
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); removeEdge(id); closeEdgeMenu(); }}
                className="w-full flex items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-medium
                  bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
              >
                <X size={12} /> Entfernen
              </button>
            </div>
          ) : (
            <button
              className="nodrag nopan absolute pointer-events-auto flex items-center justify-center w-6 h-6 rounded-full
                bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-md
                text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              style={{ transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)` }}
              title="Optionen (Doppelklick auf die Linie)"
              onClick={(e) => { e.stopPropagation(); openEdgeMenu(id); }}
            >
              <MoreVertical size={14} />
            </button>
          )}
        </EdgeLabelRenderer>
      )}
    </>
  );
});
