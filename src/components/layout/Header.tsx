import { memo, useState } from 'react';
import { Moon, Sun, Download, Upload, Presentation, Map } from 'lucide-react';
import { useRoadmapStore } from '../../store/roadmap-store';
import { useUIStore } from '../../store/ui-store';
import { downloadProject } from '../../lib/export';
import { ImportDialog } from '../dialogs/ImportDialog';

export const Header = memo(function Header() {
  const projectName = useRoadmapStore(s => s.projectName);
  const setProjectName = useRoadmapStore(s => s.setProjectName);
  const exportProject = useRoadmapStore(s => s.exportProject);
  const theme = useUIStore(s => s.theme);
  const toggleTheme = useUIStore(s => s.toggleTheme);
  const startPresentation = useUIStore(s => s.startPresentation);
  const addToast = useUIStore(s => s.addToast);

  const [importOpen, setImportOpen] = useState(false);

  return (
    <>
      <header className="h-12 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center px-4 gap-3 z-10 shrink-0">
        <Map size={18} className="text-blue-500" />
        <input
          type="text"
          value={projectName}
          onChange={e => setProjectName(e.target.value)}
          className="text-sm font-semibold bg-transparent text-gray-800 dark:text-gray-100 border-none focus:outline-none focus:ring-0 min-w-0 flex-1"
          placeholder="Projektname..."
        />

        <div className="flex items-center gap-1">
          <button
            onClick={startPresentation}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400"
            title="Praesentationsmodus (P)"
          >
            <Presentation size={16} />
          </button>
          <button
            onClick={() => {
              downloadProject(exportProject());
              addToast('Projekt exportiert', 'success');
            }}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400"
            title="Exportieren (Ctrl+S)"
          >
            <Download size={16} />
          </button>
          <button
            onClick={() => setImportOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400"
            title="Importieren (Ctrl+O)"
          >
            <Upload size={16} />
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400"
            title="Theme wechseln"
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </div>
      </header>
      <ImportDialog open={importOpen} onOpenChange={setImportOpen} />
    </>
  );
});
