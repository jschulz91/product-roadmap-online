import { memo } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
}

export const DeleteConfirmDialog = memo(function DeleteConfirmDialog({
  open, onOpenChange, title, description, onConfirm,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-red-50 dark:bg-red-950 rounded-lg">
              <AlertTriangle size={20} className="text-red-500" />
            </div>
            <Dialog.Title className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              {title}
            </Dialog.Title>
            <Dialog.Close className="ml-auto p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
              <X size={16} className="text-gray-400" />
            </Dialog.Close>
          </div>
          <Dialog.Description className="text-xs text-gray-600 dark:text-gray-400 mb-4">
            {description}
          </Dialog.Description>
          <div className="flex gap-2 justify-end">
            <Dialog.Close className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">
              Abbrechen
            </Dialog.Close>
            <button
              onClick={() => { onConfirm(); onOpenChange(false); }}
              className="px-3 py-1.5 text-xs font-medium text-white bg-red-500 rounded-lg hover:bg-red-600"
            >
              Loeschen
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
});
