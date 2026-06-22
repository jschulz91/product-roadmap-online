import { memo, useState, useEffect } from 'react';
import { X, Trash2, Plus, Check } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRoadmapStore } from '../../store/roadmap-store';
import { useUIStore } from '../../store/ui-store';
import { statusConfig, levelConfig } from '../../styles/theme';
import { COLOR_PRESETS, isValidHex } from '../../lib/node-colors';
import type { NodeStatus } from '../../types/roadmap';

export const NodeDetailPanel = memo(function NodeDetailPanel() {
  const selectedNodeId = useUIStore(s => s.selectedNodeId);
  const isPanelOpen = useUIStore(s => s.isPanelOpen);
  const setPanelOpen = useUIStore(s => s.setPanelOpen);

  const nodes = useRoadmapStore(s => s.nodes);
  const updateNode = useRoadmapStore(s => s.updateNode);
  const deleteNode = useRoadmapStore(s => s.deleteNode);
  const addNode = useRoadmapStore(s => s.addNode);

  const node = nodes.find(n => n.id === selectedNodeId);

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [hexInput, setHexInput] = useState('');

  useEffect(() => {
    if (node) {
      setTitle(node.data.title);
      setSubtitle(node.data.subtitle ?? '');
      setDescription(node.data.description);
      setHexInput(node.data.color ?? '');
    }
  }, [node?.id, node?.data.title, node?.data.subtitle, node?.data.description, node?.data.color]);

  if (!node) return null;

  const childLevel = levelConfig[node.data.level].childLevel;

  const applyHexColor = (hex: string) => {
    if (isValidHex(hex)) {
      updateNode(node.id, { color: hex });
    }
  };

  return (
    <AnimatePresence>
      {isPanelOpen && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-xl z-50 overflow-y-auto"
        >
          <div style={{ padding: '24px' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '20px' }}>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                {levelConfig[node.data.level].label} bearbeiten
              </span>
              <button
                onClick={() => setPanelOpen(false)}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-3">Titel</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  onBlur={() => updateNode(node.id, { title })}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-3">Untertitel</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={e => setSubtitle(e.target.value)}
                  onBlur={() => updateNode(node.id, { subtitle })}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-3">Beschreibung</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  onBlur={() => updateNode(node.id, { description })}
                  rows={3}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-3">Status</label>
                <div className="flex gap-2.5">
                  {(Object.keys(statusConfig) as NodeStatus[]).map(status => (
                    <button
                      key={status}
                      onClick={() => updateNode(node.id, { status })}
                      className={`flex-1 px-2.5 py-2.5 text-xs font-bold rounded-lg border-2 transition-all
                        ${node.data.status === status
                          ? 'border-blue-400 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                          : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300'
                        }`}
                    >
                      {statusConfig[status].label}
                    </button>
                  ))}
                </div>
              </div>

              {node.data.level === 'goal' && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-3">Farbe</label>
                  <div className="flex gap-3 flex-wrap mb-5">
                    {COLOR_PRESETS.map(preset => (
                      <button
                        key={preset.hex}
                        onClick={() => {
                          setHexInput(preset.hex);
                          updateNode(node.id, { color: preset.hex });
                        }}
                        className="relative w-8 h-8 rounded-lg border-2 transition-all hover:scale-110"
                        style={{
                          backgroundColor: preset.hex,
                          borderColor: node.data.color === preset.hex ? 'white' : 'transparent',
                          boxShadow: node.data.color === preset.hex ? `0 0 0 2px ${preset.hex}` : undefined,
                        }}
                        title={preset.label}
                      >
                        {node.data.color === preset.hex && (
                          <Check size={14} className="absolute inset-0 m-auto text-white drop-shadow-md" />
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-3 items-center">
                    <div
                      className="w-9 h-9 rounded-lg border border-gray-200 dark:border-gray-700 shrink-0"
                      style={{ backgroundColor: isValidHex(hexInput) ? hexInput : (node.data.color ?? '#3B82F6') }}
                    />
                    <input
                      type="text"
                      value={hexInput}
                      onChange={e => {
                        let val = e.target.value;
                        if (val && !val.startsWith('#')) val = '#' + val;
                        setHexInput(val);
                        if (isValidHex(val)) {
                          updateNode(node.id, { color: val });
                        }
                      }}
                      onBlur={() => applyHexColor(hexInput)}
                      onKeyDown={e => { if (e.key === 'Enter') applyHexColor(hexInput); }}
                      placeholder="#3B82F6"
                      className={`flex-1 px-3.5 py-2 text-sm font-mono border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400
                        ${hexInput && !isValidHex(hexInput) ? 'border-red-300 dark:border-red-700' : 'border-gray-200 dark:border-gray-700'}`}
                    />
                  </div>
                </div>
              )}

              {childLevel && (
                <button
                  onClick={() => addNode(node.id, childLevel)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                >
                  <Plus size={14} />
                  {levelConfig[node.data.level].childLabel}
                </button>
              )}

              {node.data.childrenIds.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-3">
                    Untergeordnete Elemente ({node.data.childrenIds.length})
                  </label>
                  <div className="space-y-2">
                    {node.data.childrenIds.map(childId => {
                      const child = nodes.find(n => n.id === childId);
                      if (!child) return null;
                      return (
                        <div
                          key={childId}
                          className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs text-gray-700 dark:text-gray-300"
                        >
                          <span className={`w-2 h-2 rounded-full ${statusConfig[child.data.status].dotColor}`} />
                          <span className="truncate">{child.data.title}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    deleteNode(node.id);
                    setPanelOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-xs font-medium text-red-600 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                >
                  <Trash2 size={14} />
                  {levelConfig[node.data.level].label} loeschen
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
