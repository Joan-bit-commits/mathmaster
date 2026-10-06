import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function UploadProgressModal({
  open,
  fileName,
  progress,
  onCancel,
}: {
  open: boolean;
  fileName: string;
  progress: number;
  onCancel?: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-ink-800"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ink-900 dark:text-ink-100">Uploading</h3>
              {onCancel && (
                <button onClick={onCancel} className="rounded-lg p-1 text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-700" aria-label="Cancel upload">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <p className="mt-2 truncate text-xs text-ink-500">{fileName}</p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-700">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500"
                animate={{ width: `${progress}%` }}
                transition={{ ease: 'easeOut' }}
              />
            </div>
            <p className="mt-2 text-right text-xs font-medium text-ink-500">{progress}%</p>
            {onCancel && (
              <Button variant="ghost" size="sm" className="mt-4 w-full" onClick={onCancel}>Cancel</Button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
