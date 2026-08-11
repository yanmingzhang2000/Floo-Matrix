/**
 * 线索卡片组件
 * 显示单个线索的事实碎片，不告诉玩家结论
 */
import { motion } from 'framer-motion'
import type { Clue } from '@/core/types/story'

interface ClueCardProps {
  clue: Clue
  index: number
}

const TYPE_LABELS: Record<Clue['type'], { label: string; color: string }> = {
  fact: { label: '事实', color: 'text-floo-accent-blue' },
  testimony: { label: '证词', color: 'text-floo-accent-gold' },
  anomaly: { label: '异常', color: 'text-floo-accent-red' },
}

export function ClueCard({ clue, index }: ClueCardProps) {
  const typeInfo = TYPE_LABELS[clue.type]

  return (
    <motion.div
      className="p-4 rounded-lg bg-floo-bg-secondary border border-floo-text-muted/10"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-xs font-ui px-2 py-0.5 rounded ${typeInfo.color} bg-floo-bg-primary`}>
          {typeInfo.label}
        </span>
        <span className="text-xs text-floo-text-muted/60 font-ui">
          #{String(index + 1).padStart(2, '0')}
        </span>
      </div>

      <h4 className="font-heading text-sm text-floo-text-primary mb-1">
        {clue.title}
      </h4>

      <p className="font-body text-xs text-floo-text-muted leading-relaxed">
        {clue.content}
      </p>

      <div className="mt-2 flex items-center gap-2">
        <span className="text-[10px] text-floo-text-muted/40 font-ui">
          📍 {clue.location}
        </span>
      </div>
    </motion.div>
  )
}
