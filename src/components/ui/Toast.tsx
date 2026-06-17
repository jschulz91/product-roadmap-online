import { memo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { useUIStore } from '../../store/ui-store';

const icons = {
  success: <CheckCircle2 size={16} className="text-emerald-500" />,
  error: <XCircle size={16} className="text-red-500" />,
  info: <Info size={16} className="text-blue-500" />,
};

export const Toasts = memo(function Toasts() {
  const toasts = useUIStore(s => s.toasts);
  const removeToast = useUIStore(s => s.removeToast);

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-300 min-w-[200px]"
          >
            {icons[toast.type]}
            <span className="flex-1">{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} className="text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
});
