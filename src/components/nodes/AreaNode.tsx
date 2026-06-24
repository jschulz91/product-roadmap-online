import { memo, useEffect, useRef, useState } from 'react';
import { NodeResizer, useReactFlow, type NodeProps } from '@xyflow/react';
import { Trash2 } from 'lucide-react';
import { useRoadmapStore } from '../../store/roadmap-store';
import { COLOR_PRESETS } from '../../lib/node-colors';

type AreaNodeData = { name: string; color: string };
type AreaNodeProps = NodeProps & { data: AreaNodeData };

export const AreaNode = memo(function AreaNode({ id, data, selected }: AreaNodeProps) {
  const updateArea = useRoadmapStore(s => s.updateArea);
  const updateAreaRect = useRoadmapStore(s => s.updateAreaRect);
  const removeArea = useRoadmapStore(s => s.removeArea);
  const { getViewport, setViewport } = useReactFlow();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(data.name);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-pan while resizing so an area can grow beyond the visible canvas.
  const resizingRef = useRef(false);
  const pointerRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => { setName(data.name); }, [data.name]);
  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const onWindowPointerMove = (e: PointerEvent) => {
    pointerRef.current = { x: e.clientX, y: e.clientY };
  };

  const stopAutoPan = () => {
    resizingRef.current = false;
    window.removeEventListener('pointermove', onWindowPointerMove);
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const autoPanTick = () => {
    if (!resizingRef.current) return;
    const el = document.querySelector('.react-flow') as HTMLElement | null;
    if (el) {
      const r = el.getBoundingClientRect();
      const margin = 56;
      const speed = 14;
      const { x, y } = pointerRef.current;
      let dx = 0, dy = 0;
      if (x > r.right - margin) dx = -speed;
      else if (x < r.left + margin) dx = speed;
      if (y > r.bottom - margin) dy = -speed;
      else if (y < r.top + margin) dy = speed;
      if (dx !== 0 || dy !== 0) {
        const vp = getViewport();
        setViewport({ x: vp.x + dx, y: vp.y + dy, zoom: vp.zoom });
        // Nudge the resizer to recompute the size against the new transform.
        window.dispatchEvent(new PointerEvent('pointermove', { clientX: x, clientY: y, bubbles: true }));
      }
    }
    rafRef.current = requestAnimationFrame(autoPanTick);
  };

  const startAutoPan = () => {
    if (resizingRef.current) return;
    resizingRef.current = true;
    window.addEventListener('pointermove', onWindowPointerMove);
    rafRef.current = requestAnimationFrame(autoPanTick);
  };

  useEffect(() => () => stopAutoPan(), []);

  const color = data.color || '#3B82F6';

  const commitName = () => {
    setEditing(false);
    if (name !== data.name) updateArea(id, { name });
  };

  return (
    <>
      <NodeResizer
        isVisible={!!selected}
        minWidth={120}
        minHeight={80}
        lineClassName="!border-blue-400"
        handleClassName="!bg-white !border-2 !border-blue-400 !w-2.5 !h-2.5 !rounded-sm"
        onResizeStart={startAutoPan}
        onResizeEnd={(_e, p) => {
          stopAutoPan();
          updateAreaRect(id, { position: { x: p.x, y: p.y }, width: p.width, height: p.height });
        }}
      />

      <div
        className={`w-full h-full rounded-xl border-2 transition-colors ${selected ? 'border-solid' : 'border-dashed'}`}
        style={{ backgroundColor: color + '1A', borderColor: color + (selected ? 'CC' : '80') }}
      >
        {/* Name label */}
        <div className="absolute top-2 left-3 flex items-center gap-2 max-w-[90%]">
          {editing ? (
            <input
              ref={inputRef}
              value={name}
              onChange={e => setName(e.target.value)}
              onBlur={commitName}
              onKeyDown={e => {
                if (e.key === 'Enter') commitName();
                if (e.key === 'Escape') { setName(data.name); setEditing(false); }
              }}
              className="nodrag px-1.5 py-0.5 text-sm font-semibold rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          ) : (
            <span
              className="nodrag px-1.5 py-0.5 text-sm font-semibold rounded cursor-text select-none"
              style={{ color }}
              onDoubleClick={(e) => { e.stopPropagation(); setEditing(true); }}
              title="Doppelklick zum Umbenennen"
            >
              {data.name || 'Bereich'}
            </span>
          )}
        </div>

        {/* Toolbar when selected: color swatches + delete */}
        {selected && (
          <div className="nodrag absolute -top-9 right-0 flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md px-1.5 py-1">
            {COLOR_PRESETS.slice(0, 6).map(preset => (
              <button
                key={preset.hex}
                onClick={(e) => { e.stopPropagation(); updateArea(id, { color: preset.hex }); }}
                className="w-4 h-4 rounded-full border border-black/10 dark:border-white/20 hover:scale-110 transition-transform"
                style={{ backgroundColor: preset.hex, outline: color === preset.hex ? `2px solid ${preset.hex}` : undefined, outlineOffset: '1px' }}
                title={preset.label}
              />
            ))}
            <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-0.5" />
            <button
              onClick={(e) => { e.stopPropagation(); removeArea(id); }}
              className="text-red-500 hover:text-red-600 transition-colors"
              title="Bereich löschen"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>
    </>
  );
});
