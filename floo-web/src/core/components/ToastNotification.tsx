/**
 * Toast 通知组件
 * 显示信任度变化等实时通知
 */
import { motion, AnimatePresence } from 'framer-motion'
import { useToastStore } from '@/core/store/toastStore'

export function ToastNotification() {
  const { toasts, removeToast } = useToastStore()

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            onClick={() => removeToast(toast.id)}
            className="pointer-events-auto cursor-pointer px-4 py-2.5 rounded-lg border backdrop-blur-md shadow-lg"
            style={{
              backgroundColor: 'rgba(30, 27, 24, 0.9)',
              borderColor: toast.delta > 0 ? 'rgba(74, 160, 108, 0.5)' : 'rgba(184, 84, 80, 0.5)',
            }}
          >
            <div className="flex items-center gap-3">
              <span className="font-heading text-sm text-floo-text-primary">
                {toast.characterName}
              </span>
              <span
                className="font-ui text-sm font-medium"
                style={{ color: toast.delta > 0 ? '#4aa06c' : '#b85450' }}
              >
                信任度 {toast.delta > 0 ? '+' : ''}{toast.delta}
              </span>
              <span className="text-xs text-floo-text-muted/60 font-ui">
                ({toast.newAffinity}/100)
              </span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
