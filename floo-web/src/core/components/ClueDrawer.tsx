/**
 * 线索抽屉组件
 * 侧边栏展示已收集的线索卡片
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ClueCard } from './ClueCard'
import type { Clue } from '@/core/types/story'

interface ClueDrawerProps {
  allClues: Clue[]
  discoveredIds: Set<string>
}

export function ClueDrawer({ allClues, discoveredIds }: ClueDrawerProps) {
  const [isOpen, setIsOpen] = useState(false)

  const discoveredClues = allClues.filter((c) => discoveredIds.has(c.id))
  const count = discoveredClues.length
  const total = allClues.length

  return (
    <>
      {/* 触发按钮 */}
      <motion.button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-40 flex items-center gap-2 px-3 py-2 rounded-lg bg-floo-bg-secondary/80 border border-floo-text-muted/20 text-floo-text-muted hover:border-floo-accent-gold/40 hover:text-floo-accent-gold transition-colors backdrop-blur-sm"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="text-lg">🔍</span>
        <span className="text-xs font-ui">
          线索 {count}/{total}
        </span>
      </motion.button>

      {/* 抽屉面板 */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* 遮罩 */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* 抽屉内容 */}
            <motion.div
              className="fixed left-0 top-0 bottom-0 z-50 w-full max-w-md bg-floo-bg-primary border-r border-floo-text-muted/20 overflow-hidden flex flex-col"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              {/* 头部 */}
              <div className="flex items-center justify-between p-4 border-b border-floo-text-muted/10">
                <div>
                  <h2 className="font-heading text-lg text-floo-text-primary">线索档案</h2>
                  <p className="text-xs text-floo-text-muted/60 font-ui mt-1">
                    已发现 {count} / {total} 条线索
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-floo-bg-secondary text-floo-text-muted hover:text-floo-text-primary transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* 线索列表 */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {discoveredClues.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-floo-text-muted/40 font-body text-sm">
                      还没有发现任何线索
                    </p>
                    <p className="text-floo-text-muted/30 font-body text-xs mt-2">
                      在场景中寻找可调查的物品
                    </p>
                  </div>
                ) : (
                  discoveredClues.map((clue, i) => (
                    <ClueCard key={clue.id} clue={clue} index={i} />
                  ))
                )}
              </div>

              {/* 未发现线索的占位提示 */}
              {count < total && (
                <div className="p-4 border-t border-floo-text-muted/10">
                  <p className="text-xs text-floo-text-muted/40 font-ui text-center">
                    还有 {total - count} 条线索等待发现…
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
