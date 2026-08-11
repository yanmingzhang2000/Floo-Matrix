/**
 * 调查面板组件
 * 显示场景中的可调查点，点击后展开调查详情
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { InvestigationPoint } from '@/core/types/story'

interface InvestigationPanelProps {
  points: InvestigationPoint[]
  onClueFound: (clueId: string) => void
  discoveredClues: Set<string>
}

export function InvestigationPanel({ points, onClueFound, discoveredClues }: InvestigationPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const handleInvestigate = (point: InvestigationPoint) => {
    if (expandedId === point.id) {
      setExpandedId(null)
      return
    }
    setExpandedId(point.id)
    if (point.clueId && !discoveredClues.has(point.clueId)) {
      onClueFound(point.clueId)
    }
  }

  return (
    <motion.div
      className="w-full max-w-2xl mt-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <p className="text-xs text-floo-text-muted/60 font-ui mb-3 tracking-wide uppercase">
        调查
      </p>
      <div className="flex flex-wrap gap-3">
        {points.map((point) => {
          const isExpanded = expandedId === point.id
          const hasClue = point.clueId && discoveredClues.has(point.clueId)

          return (
            <div key={point.id} className="flex flex-col">
              <motion.button
                type="button"
                onClick={() => handleInvestigate(point)}
                className={[
                  'px-4 py-2 rounded-lg border font-ui text-sm transition-all',
                  isExpanded
                    ? 'bg-floo-accent-green/20 border-floo-accent-green/60 text-floo-accent-green'
                    : 'bg-floo-bg-secondary border-floo-text-muted/20 text-floo-text-muted hover:border-floo-accent-green/40 hover:text-floo-accent-green',
                ].join(' ')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {hasClue ? '🔍 ' : '🔍 '}{point.label}
              </motion.button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 p-4 rounded-lg bg-floo-bg-primary/50 border border-floo-accent-green/10">
                      <p className="font-body text-sm text-floo-text-primary leading-relaxed whitespace-pre-wrap">
                        {point.content}
                      </p>
                      {hasClue && (
                        <motion.p
                          className="mt-3 text-xs text-floo-accent-gold font-ui"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          ✓ 线索已记录
                        </motion.p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
