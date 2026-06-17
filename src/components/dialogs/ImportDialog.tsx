import { memo, useState, useCallback, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, FileJson } from 'lucide-react';
import { parseAndValidateProject } from '../../lib/import';
import { useRoadmapStore } from '../../store/roadmap-store';
import { useUIStore } from '../../store/ui-store';

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ImportDialog = memo(function ImportDialog({ open, onOpenChange }: ImportDialogProps) {
  const importProject = useRoadmapStore(s => s.importProject);
  const addToast = useUIStore(s => s.addToast);
  const [errors, setErrors] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setErrors([]);
    const text = await file.text();
    const result = parseAndValidateProject(text);
    if (result.success && result.data) {
      importProject(result.data);
      addToast('Projekt erfolgreich importiert', 'success');
      onOpenChange(false);
    } else {
      setErrors(result.errors ?? ['Unbekannter Fehler']);
    }
  }, [importProject, addToast, onOpenChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 animate-in fade-in" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              Projekt importieren
            </Dialog.Title>
            <Dialog.Close className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
              <X size={18} className="text-gray-400" />
            </Dialog.Close>
          </div>

          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragging
                ? 'border-blue-400 bg-blue-50 dark:bg-blue-950'
                : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'}
            `}
          >
            <FileJson size={40} className="mx-auto mb-3 text-gray-400" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              JSON-Datei hierhin ziehen
            </p>
            <p className="text-xs text-gray-400">oder klicken zum Auswaehlen</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </div>

          {errors.length > 0 && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-xs font-medium text-red-600 mb-1">Validierungsfehler:</p>
              <ul className="text-xs text-red-500 space-y-0.5">
                {errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
});
