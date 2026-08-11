/**
 * 传送门转场动画
 * 点击壁炉进入游戏时的全屏火焰过渡效果
 */
import { AnimatePresence, motion } from 'framer-motion'

interface PortalTransitionProps {
  active: boolean
  onComplete?: () => void
}

export function PortalTransition({ active, onComplete }: PortalTransitionProps) {
  return (
    <AnimatePresence onExitComplete={onComplete}>
      {active && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-floo-bg-primary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div
            className="w-16 h-16 rounded-full"
            style={{
              background:
                'radial-gradient(circle, var(--color-floo-accent-green) 0%, transparent 70%)',
            }}
            initial={{ scale: 1 }}
            animate={{ scale: 40 }}
            transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
            onAnimationComplete={onComplete}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
