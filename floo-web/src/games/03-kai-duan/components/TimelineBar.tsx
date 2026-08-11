/**
 * 时间线进度条
 * 显示当前循环的时间点和爆炸倒计时
 */
import { motion } from 'framer-motion'

interface TimelineBarProps {
  currentTime: string
  explosionTime: string
  progress: number
}

export function TimelineBar({ currentTime, explosionTime, progress }: TimelineBarProps) {
  return (
    <motion.div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-30 w-[280px] sm:w-[360px]"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <div className="bg-floo-bg-secondary/80 backdrop-blur-sm border border-floo-text-muted/20 rounded-lg px-4 py-3">
        {/* 时间标签 */}
        <div className="flex justify-between items-center mb-2">
          <span className="font-heading text-floo-accent-green text-sm">{currentTime}</span>
          <span className="text-floo-text-muted text-xs font-ui">距爆炸</span>
          <span className="font-heading text-red-400 text-sm">{explosionTime}</span>
        </div>

        {/* 进度条 */}
        <div className="relative h-2 bg-floo-bg-primary rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              background: `linear-gradient(90deg, #2ecc71 0%, #f39c12 70%, #e74c3c 100%)`,
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
          {/* 闪光点 */}
          <motion.div
            className="absolute top-0 bottom-0 w-1 bg-white/60 rounded-full"
            style={{ left: `${progress}%` }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>

        {/* 已解锁时间点 */}
        <div className="flex gap-1 mt-2 justify-center">
          {['1:40', '1:38', '1:35', '1:33', '1:30', '1:25', '1:20', '1:15', '1:10', '1:05', '1:00'].map(
            (time, i) => (
              <div
                key={time}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i < Math.floor(progress / 9)
                    ? 'bg-floo-accent-green'
                    : 'bg-floo-text-muted/30'
                }`}
              />
            )
          )}
        </div>
      </div>
    </motion.div>
  )
}
