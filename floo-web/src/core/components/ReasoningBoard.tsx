/**
 * 推理板组件
 * 让玩家建立人物与线索的关联，形成自己的推理
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Character, Clue } from '@/core/types/story'

interface ReasoningBoardProps {
  characters: Character[]
  clues: Clue[]
  discoveredClueIds: Set<string>
  onConfirm: (reasoning: string) => void
}

export function ReasoningBoard({ characters, clues, discoveredClueIds, onConfirm }: ReasoningBoardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null)
  const [suspicions, setSuspicions] = useState<Record<string, string[]>>({})

  const discoveredClues = clues.filter((c) => discoveredClueIds.has(c.id))

  const toggleSuspicion = (characterId: string, clueId: string) => {
    setSuspicions((prev) => {
      const current = prev[characterId] || []
      const next = current.includes(clueId)
        ? current.filter((id) => id !== clueId)
        : [...current, clueId]
      return { ...prev, [characterId]: next }
    })
  }

  const handleConfirm = () => {
    // 找出怀疑度最高的角色
    const maxSus = Object.entries(suspicions).reduce(
      (max, [id, clueIds]) => (clueIds.length > max.clueIds.length ? { id, clueIds } : max),
      { id: '', clueIds: [] as string[] }
    )
    onConfirm(maxSus.id)
    setIsOpen(false)
  }

  return (
    <>
      {/* 触发按钮 */}
      <motion.button
        type="button"
        onClick={() => setIsOpen(true)}
        className="px-6 py-3 rounded-lg border border-floo-accent-gold/40 bg-floo-accent-gold/10 text-floo-accent-gold font-ui hover:bg-floo-accent-gold/20 hover:border-floo-accent-gold/60 transition-colors"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        🧠 整理推理
      </motion.button>

      {/* 推理板面板 */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* 遮罩 */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* 推理板内容 */}
            <motion.div
              className="fixed inset-4 md:inset-8 lg:inset-16 z-50 bg-floo-bg-primary rounded-xl border border-floo-text-muted/20 overflow-hidden flex flex-col"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              {/* 头部 */}
              <div className="flex items-center justify-between p-4 border-b border-floo-text-muted/10">
                <div>
                  <h2 className="font-heading text-lg text-floo-text-primary">推理板</h2>
                  <p className="text-xs text-floo-text-muted/60 font-ui mt-1">
                    选择人物，将线索与之关联，形成你的推理
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

              {/* 主体内容 */}
              <div className="flex-1 overflow-hidden flex">
                {/* 左侧：人物列表 */}
                <div className="w-1/3 border-r border-floo-text-muted/10 p-4 overflow-y-auto">
                  <p className="text-xs text-floo-text-muted/40 font-ui mb-3">人物</p>
                  <div className="space-y-2">
                    {characters.map((char) => (
                      <button
                        key={char.id}
                        type="button"
                        onClick={() => setSelectedCharacter(char.id)}
                        className={[
                          'w-full text-left p-3 rounded-lg border transition-all',
                          selectedCharacter === char.id
                            ? 'bg-floo-accent-green/10 border-floo-accent-green/40'
                            : 'bg-floo-bg-secondary border-floo-text-muted/10 hover:border-floo-text-muted/30',
                        ].join(' ')}
                      >
                        <p className="font-heading text-sm text-floo-text-primary">{char.name}</p>
                        {char.identity && (
                          <p className="text-[10px] text-floo-accent-gold font-ui mt-1">{char.identity}</p>
                        )}
                        {suspicions[char.id]?.length ? (
                          <p className="text-[10px] text-floo-accent-red font-ui mt-1">
                            {suspicions[char.id].length} 条关联线索
                          </p>
                        ) : null}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 右侧：线索关联区 */}
                <div className="flex-1 p-4 overflow-y-auto">
                  {selectedCharacter ? (
                    <>
                      <p className="text-xs text-floo-text-muted/40 font-ui mb-3">
                        为「{characters.find((c) => c.id === selectedCharacter)?.name}」关联线索
                      </p>
                      <div className="space-y-2">
                        {discoveredClues.map((clue) => {
                          const isLinked = suspicions[selectedCharacter]?.includes(clue.id)
                          return (
                            <button
                              key={clue.id}
                              type="button"
                              onClick={() => toggleSuspicion(selectedCharacter, clue.id)}
                              className={[
                                'w-full text-left p-3 rounded-lg border transition-all',
                                isLinked
                                  ? 'bg-floo-accent-gold/10 border-floo-accent-gold/40'
                                  : 'bg-floo-bg-secondary border-floo-text-muted/10 hover:border-floo-text-muted/30',
                              ].join(' ')}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-xs">
                                  {isLinked ? '✓' : '○'}
                                </span>
                                <span className="font-heading text-sm text-floo-text-primary">
                                  {clue.title}
                                </span>
                              </div>
                              <p className="text-[10px] text-floo-text-muted/60 font-body mt-1 ml-5">
                                {clue.content.substring(0, 60)}...
                              </p>
                            </button>
                          )
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-floo-text-muted/40 font-body text-sm">
                        ← 选择一个人物开始关联线索
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* 底部确认按钮 */}
              <div className="p-4 border-t border-floo-text-muted/10 flex justify-end">
                <motion.button
                  type="button"
                  onClick={handleConfirm}
                  className="px-6 py-2 rounded-lg bg-floo-accent-gold/20 border border-floo-accent-gold text-floo-text-primary font-ui hover:bg-floo-accent-gold/30 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  确认推理
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
