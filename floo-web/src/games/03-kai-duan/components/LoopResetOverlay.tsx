/**
 * 循环重置转场动画
 * 极简氛围感——白光闪烁 → 黑屏 → 淡出
 * 不显示循环数字，让玩家自己感知"又回来了"
 */
import { motion, AnimatePresence } from 'framer-motion'

interface LoopResetOverlayProps {
  active: boolean
  onComplete: () => void
  /** @deprecated 不再使用，保留向后兼容 */
  fromLoop?: number
  /** @deprecated 不再使用，保留向后兼容 */
  toLoop?: number
}

export function LoopResetOverlay({ active, onComplete }: LoopResetOverlayProps) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* 黑色背景 */}
          <motion.div
            className="absolute inset-0 bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          />

          {/* 白色闪光 */}
          <motion.div
            className="absolute inset-0 bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.8, 0, 0.4, 0] }}
            transition={{ duration: 1.5, times: [0, 0.15, 0.3, 0.5, 0.7] }}
          />

          {/* 极简提示文字 - 只显示"似曾相识" */}
          <motion.div
            className="relative z-10 flex flex-col items-center gap-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <motion.p
              className="font-heading text-floo-text-muted text-sm tracking-[0.3em] uppercase"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              似曾相识
            </motion.p>
          </motion.div>

          {/* 淡出触发 */}
          <motion.div
            className="absolute inset-0 bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.5 }}
            onAnimationComplete={onComplete}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
