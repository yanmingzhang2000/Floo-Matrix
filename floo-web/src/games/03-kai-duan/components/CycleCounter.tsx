/**
 * 循环计数器组件
 * 显示当前循环次数、已发现线索数量、已解锁副线
 */
import { motion } from 'framer-motion'

interface CycleCounterProps {
  currentLoop: number
  maxLoop: number
  discoveredClues: number
  totalClues: number
  unlockedSublines: string[]
}

const SUBLINE_LABELS: Record<string, string> = {
  subline1_unlocked: '卢迪',
  subline2_unlocked: '王萌萌',
  trust_xiao_high: '感情线',
  investigated_lao_zhang: '老张',
  investigated_ma_guoqiang: '马国强',
  investigated_lao_jiao: '老焦',
}

export function CycleCounter({
  currentLoop,
  maxLoop,
  discoveredClues,
  totalClues,
  unlockedSublines,
}: CycleCounterProps) {
  return (
    <motion.div
      className="fixed top-4 left-4 z-30 flex flex-col gap-2"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      {/* 循环次数 */}
      <div className="flex items-center gap-2 bg-floo-bg-secondary/80 backdrop-blur-sm border border-floo-text-muted/20 rounded-lg px-4 py-2">
        <span className="text-floo-text-muted text-xs font-ui">循环</span>
        <span className="font-heading text-floo-accent-gold text-lg">
          {currentLoop}
        </span>
        <span className="text-floo-text-muted text-xs font-ui">/ {maxLoop}</span>
      </div>

      {/* 线索数量 */}
      <div className="flex items-center gap-2 bg-floo-bg-secondary/80 backdrop-blur-sm border border-floo-text-muted/20 rounded-lg px-4 py-2">
        <span className="text-floo-text-muted text-xs font-ui">线索</span>
        <span className="font-heading text-floo-accent-green text-lg">
          {discoveredClues}
        </span>
        <span className="text-floo-text-muted text-xs font-ui">/ {totalClues}</span>
      </div>

      {/* 已解锁副线 */}
      {unlockedSublines.length > 0 && (
        <div className="flex flex-wrap gap-1 bg-floo-bg-secondary/80 backdrop-blur-sm border border-floo-text-muted/20 rounded-lg px-3 py-2">
          {unlockedSublines.map((subline) => (
            <span
              key={subline}
              className="text-xs font-ui px-2 py-0.5 rounded bg-floo-accent-green/10 text-floo-accent-green border border-floo-accent-green/30"
            >
              {SUBLINE_LABELS[subline] || subline}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  )
}
