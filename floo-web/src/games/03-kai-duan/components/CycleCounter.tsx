/**
 * 信息面板组件
 * 显示当前时间、已知信息数量、已建立的人物联系
 * 不显示循环次数——让玩家自己感知"又回来了"
 */
import { motion } from 'framer-motion'

interface CycleCounterProps {
  currentTime: string
  discoveredClues: number
  totalClues: number
  unlockedConnections: string[]
}

const CONNECTION_LABELS: Record<string, string> = {
  trust_xiao_high: '肖鹤云',
  wallet_driver_help: '王兴德',
  met_wang_early: '王兴德',
  investigated_lu_di: '卢迪',
  investigated_ma_guoqiang: '马国强',
  investigated_lao_jiao: '老焦',
  investigated_yao_po: '药婆',
  liu_yao_trust_high: '刘瑶',
  liu_yao_will_testify: '刘瑶',
  police_cooperation_possible: '警方',
  police_partial_trust: '警方',
  wang_xingde_moved: '王兴德',
  wang_xingde_glove: '王兴德',
  wang_xingde_help_offered: '王兴德',
}

export function CycleCounter({
  currentTime,
  discoveredClues,
  totalClues,
  unlockedConnections,
}: CycleCounterProps) {
  return (
    <motion.div
      className="fixed top-4 left-4 z-30 flex flex-col gap-2"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      {/* 时间显示 - 唯一的进度暗示 */}
      <div className="flex items-center gap-2 bg-floo-bg-secondary/80 backdrop-blur-sm border border-floo-text-muted/20 rounded-lg px-4 py-2">
        <span className="text-floo-text-muted text-xs font-ui">时间</span>
        <span className="font-heading text-floo-accent-gold text-lg">
          {currentTime}
        </span>
      </div>

      {/* 已知信息 */}
      <div className="flex items-center gap-2 bg-floo-bg-secondary/80 backdrop-blur-sm border border-floo-text-muted/20 rounded-lg px-4 py-2">
        <span className="text-floo-text-muted text-xs font-ui">已知信息</span>
        <span className="font-heading text-floo-accent-green text-lg">
          {discoveredClues}
        </span>
        <span className="text-floo-text-muted text-xs font-ui">/ {totalClues}</span>
      </div>

      {/* 已建立的人物联系 */}
      {unlockedConnections.length > 0 && (
        <div className="flex flex-wrap gap-1 bg-floo-bg-secondary/80 backdrop-blur-sm border border-floo-text-muted/20 rounded-lg px-3 py-2">
          {unlockedConnections.map((conn) => (
            <span
              key={conn}
              className="text-xs font-ui px-2 py-0.5 rounded bg-floo-accent-green/10 text-floo-accent-green border border-floo-accent-green/30"
            >
              {CONNECTION_LABELS[conn] || conn}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  )
}
