import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquarePlus, X } from 'lucide-react';
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
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        onClick={closeConfirmDialog}
      >
        {/* Lighter backdrop with more blur */}
        <div className="absolute inset-0 bg-dark-950/40 backdrop-blur-sm" />

        {/* Dialog — compact size */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-2xl border border-white/10 bg-dark-900/95 backdrop-blur-xl max-w-sm w-full shadow-2xl shadow-black/50 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Subtle top gradient line */}
          <div className="h-[1px] bg-gradient-to-r from-transparent via-primary-500/40 to-transparent" />

          {/* Close button */}
          <button
            onClick={closeConfirmDialog}
            className="absolute top-2.5 right-2.5 p-1.5 rounded-full text-dark-500 hover:text-white hover:bg-white/5 transition-colors z-10"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>

          <div className="p-5">
            {/* Icon + Header */}
            <div className="flex flex-col items-center text-center mb-5">
              {/* Icon with subtle glow */}
              <div className="relative mb-3">
                <div className="absolute inset-0 bg-primary-500/15 blur-lg rounded-full" />
                <div className="relative w-11 h-11 rounded-xl border border-white/10 bg-gradient-to-br from-primary-500/15 to-accent-500/5 flex items-center justify-center">
                  <MessageSquarePlus 
                    className="w-5 h-5 text-primary-400" 
                    strokeWidth={1.5} 
                  />
                </div>
              </div>

              {/* Title */}
              <h3 className="font-semibold text-base tracking-tight text-white mb-1.5">
                {confirmDialog.title}
              </h3>

              {/* Message */}
              <p className="text-xs text-dark-400 leading-relaxed">
                {confirmDialog.message}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={closeConfirmDialog}
                className="flex-1 px-3 py-2 rounded-full border border-white/10 text-dark-200 hover:text-white hover:bg-white/5 hover:border-white/20 text-xs font-medium transition-all"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 px-3 py-2 rounded-full bg-white text-dark-950 text-xs font-semibold hover:bg-dark-100 transition-all"
              >
                {t('common.confirm')}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}