import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import useAppStore from '../store/appStore';

export default function ConfirmDialog() {
  const { confirmDialog, closeConfirmDialog, t } = useAppStore();

  if (!confirmDialog.isOpen) return null;

  const handleConfirm = () => {
    if (confirmDialog.onConfirm) confirmDialog.onConfirm();
    closeConfirmDialog();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        onClick={closeConfirmDialog}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.2 }}
          className="rounded-2xl border border-white/10 bg-dark-950 p-6 max-w-sm w-full shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start gap-4 mb-6">
            <div className="w-10 h-10 rounded-xl border border-yellow-500/20 bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-yellow-400" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-base tracking-tight mb-1">
                {confirmDialog.title}
              </h3>
              <p className="text-sm text-dark-400 leading-relaxed">
                {confirmDialog.message}
              </p>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={closeConfirmDialog}
              className="px-4 py-2 rounded-full border border-white/10 text-dark-300 hover:text-white hover:border-white/20 text-sm font-medium transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 rounded-full bg-white text-dark-950 text-sm font-semibold hover:bg-dark-200 transition-colors"
            >
              {t('common.confirm')}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}