/**
 * 循环重置转场动画
 * 当玩家在爆炸中死亡或进入新循环时播放
 * 效果：白光闪烁 → 倒带效果 → 淡出回到起点
 */
import { motion, AnimatePresence } from 'framer-motion'

interface LoopResetOverlayProps {
  active: boolean
  fromLoop: number
  toLoop: number
  onComplete: () => void
}

export function LoopResetOverlay({ active, fromLoop, toLoop, onComplete }: LoopResetOverlayProps) {
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

          {/* 倒带文字 */}
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
              时间倒流
            </motion.p>
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <span className="font-heading text-2xl text-floo-accent-gold">循环 {fromLoop}</span>
              <motion.span
                className="text-floo-text-muted text-xl"
                animate={{ x: [- 5, 5, -5] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                →
              </motion.span>
              <span className="font-heading text-2xl text-floo-accent-green">循环 {toLoop}</span>
            </motion.div>
          </motion.div>

          {/* 时钟倒转效果 */}
          <motion.div
            className="absolute w-32 h-32 border-2 border-floo-accent-green/30 rounded-full"
            initial={{ opacity: 0, rotate: 0 }}
            animate={{ opacity: [0, 0.6, 0], rotate: -720 }}
            transition={{ delay: 0.3, duration: 2, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute w-24 h-24 border border-floo-accent-gold/20 rounded-full"
            initial={{ opacity: 0, rotate: 0 }}
            animate={{ opacity: [0, 0.4, 0], rotate: 540 }}
            transition={{ delay: 0.5, duration: 1.8, ease: 'easeInOut' }}
          />

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
