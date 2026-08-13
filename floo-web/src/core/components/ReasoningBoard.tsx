/**
 * 推理板组件（抽屉模式）
 * 让玩家随时随地建立人物与线索、线索与线索的关联
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Character, Clue, ClueLink } from '@/core/types/story'

type TabId = 'characters' | 'clues' | 'chain'

interface ReasoningBoardProps {
  characters: Character[]
  clues: Clue[]
  clueLinks?: ClueLink[]
  discoveredClueIds: Set<string>
}

export function ReasoningBoard({ characters, clues, clueLinks = [], discoveredClueIds }: ReasoningBoardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<TabId>('characters')
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null)
  const [selectedClue, setSelectedClue] = useState<string | null>(null)
  const [suspicions, setSuspicions] = useState<Record<string, string[]>>({})
  const [clueLinksState, setClueLinksState] = useState<Record<string, string[]>>({})

  const discoveredClues = clues.filter((c) => discoveredClueIds.has(c.id))

  const linkCount = Object.values(suspicions).reduce((sum, arr) => sum + arr.length, 0)
  const clueLinkCount = Object.values(clueLinksState).reduce((sum, arr) => sum + arr.length, 0)

  const toggleSuspicion = (characterId: string, clueId: string) => {
    setSuspicions((prev) => {
      const current = prev[characterId] || []
      const next = current.includes(clueId)
        ? current.filter((id) => id !== clueId)
        : [...current, clueId]
      return { ...prev, [characterId]: next }
    })
  }

  const toggleClueLink = (sourceClueId: string, targetClueId: string) => {
    setClueLinksState((prev) => {
      const current = prev[sourceClueId] || []
      const next = current.includes(targetClueId)
        ? current.filter((id) => id !== targetClueId)
        : [...current, targetClueId]
      return { ...prev, [sourceClueId]: next }
    })
  }

  const getLinkedCharacters = (clueId: string) => {
    return Object.entries(suspicions)
      .filter(([, clueIds]) => clueIds.includes(clueId))
      .map(([charId]) => characters.find((c) => c.id === charId)?.name)
      .filter(Boolean)
  }

  const getLinkedClues = (clueId: string) => {
    const linked = clueLinksState[clueId] || []
    return linked.map((id) => clues.find((c) => c.id === id)?.title).filter(Boolean)
  }

  const getLinkTypeLabel = (type: ClueLink['linkType']) => {
    switch (type) {
      case 'support': return '支持'
      case 'contradict': return '矛盾'
      case 'supplement': return '补充'
      case 'cause': return '因果'
    }
  }

  const getLinkTypeColor = (type: ClueLink['linkType']) => {
    switch (type) {
      case 'support': return 'text-floo-accent-green'
      case 'contradict': return 'text-floo-accent-red'
      case 'supplement': return 'text-floo-accent-blue'
      case 'cause': return 'text-floo-accent-gold'
    }
  }

  return (
    <>
      {/* 触发按钮 - 固定在左上角，与线索按钮并排 */}
      <motion.button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-[140px] z-40 flex items-center gap-2 px-3 py-2 rounded-lg bg-floo-bg-secondary/80 border border-floo-text-muted/20 text-floo-text-muted hover:border-floo-accent-gold/40 hover:text-floo-accent-gold transition-colors backdrop-blur-sm"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="text-lg">🧠</span>
        <span className="text-xs font-ui">
          推理 {linkCount + clueLinkCount}
        </span>
      </motion.button>

      {/* 推理板抽屉 */}
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

            {/* 抽屉内容 - 右侧 */}
            <motion.div
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg bg-floo-bg-primary border-l border-floo-text-muted/20 overflow-hidden flex flex-col"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              {/* 头部 */}
              <div className="flex items-center justify-between p-4 border-b border-floo-text-muted/10">
                <div>
                  <h2 className="font-heading text-lg text-floo-text-primary">推理板</h2>
                  <p className="text-xs text-floo-text-muted/60 font-ui mt-1">
                    关联线索，形成你的推理
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

              {/* 标签页 */}
              <div className="flex border-b border-floo-text-muted/10">
                {([
                  { id: 'characters' as TabId, label: '人物关联', count: linkCount },
                  { id: 'clues' as TabId, label: '线索关联', count: clueLinkCount },
                  { id: 'chain' as TabId, label: '推理链', count: 0 },
                ]).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={[
                      'flex-1 py-3 text-xs font-ui transition-colors relative',
                      activeTab === tab.id
                        ? 'text-floo-accent-gold'
                        : 'text-floo-text-muted hover:text-floo-text-primary',
                    ].join(' ')}
                  >
                    {tab.label}
                    {tab.count > 0 && (
                      <span className="ml-1 text-[10px] opacity-60">({tab.count})</span>
                    )}
                    {activeTab === tab.id && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-floo-accent-gold"
                        layoutId="tab-indicator"
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* 内容区 */}
              <div className="flex-1 overflow-y-auto p-4">
                {/* 人物关联标签 */}
                {activeTab === 'characters' && (
                  <div className="space-y-4">
                    {/* 人物列表 */}
                    <div className="space-y-2">
                      {characters.map((char) => (
                        <button
                          key={char.id}
                          type="button"
                          onClick={() => setSelectedCharacter(selectedCharacter === char.id ? null : char.id)}
                          className={[
                            'w-full text-left p-3 rounded-lg border transition-all',
                            selectedCharacter === char.id
                              ? 'bg-floo-accent-gold/10 border-floo-accent-gold/40'
                              : 'bg-floo-bg-secondary border-floo-text-muted/10 hover:border-floo-text-muted/30',
                          ].join(' ')}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-heading text-sm text-floo-text-primary">{char.name}</p>
                              {char.identity && (
                                <p className="text-[10px] text-floo-accent-gold font-ui mt-1">{char.identity}</p>
                              )}
                            </div>
                            {suspicions[char.id]?.length ? (
                              <span className="text-[10px] text-floo-accent-red font-ui">
                                {suspicions[char.id].length} 条线索
                              </span>
                            ) : null}
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* 选中人物的线索关联 */}
                    {selectedCharacter && (
                      <div className="mt-4 p-3 rounded-lg bg-floo-bg-secondary/50 border border-floo-text-muted/10">
                        <p className="text-xs text-floo-text-muted/60 font-ui mb-3">
                          为「{characters.find((c) => c.id === selectedCharacter)?.name}」关联线索
                        </p>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {discoveredClues.map((clue) => {
                            const isLinked = suspicions[selectedCharacter]?.includes(clue.id)
                            return (
                              <button
                                key={clue.id}
                                type="button"
                                onClick={() => toggleSuspicion(selectedCharacter, clue.id)}
                                className={[
                                  'w-full text-left p-2 rounded border transition-all text-xs',
                                  isLinked
                                    ? 'bg-floo-accent-gold/10 border-floo-accent-gold/40'
                                    : 'bg-floo-bg-primary border-floo-text-muted/10 hover:border-floo-text-muted/30',
                                ].join(' ')}
                              >
                                <div className="flex items-center gap-2">
                                  <span className={isLinked ? 'text-floo-accent-gold' : 'text-floo-text-muted/40'}>
                                    {isLinked ? '✓' : '○'}
                                  </span>
                                  <span className="text-floo-text-primary">{clue.title}</span>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 线索关联标签 */}
                {activeTab === 'clues' && (
                  <div className="space-y-4">
                    {discoveredClues.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-floo-text-muted/40 font-body text-sm">
                          还没有发现任何线索
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* 选择线索A */}
                        <div>
                          <p className="text-xs text-floo-text-muted/40 font-ui mb-2">选择线索</p>
                          <div className="space-y-2">
                            {discoveredClues.map((clue) => (
                              <button
                                key={clue.id}
                                type="button"
                                onClick={() => setSelectedClue(selectedClue === clue.id ? null : clue.id)}
                                className={[
                                  'w-full text-left p-3 rounded-lg border transition-all',
                                  selectedClue === clue.id
                                    ? 'bg-floo-accent-blue/10 border-floo-accent-blue/40'
                                    : 'bg-floo-bg-secondary border-floo-text-muted/10 hover:border-floo-text-muted/30',
                                ].join(' ')}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-heading text-sm text-floo-text-primary">
                                    {clue.title}
                                  </span>
                                  {clueLinksState[clue.id]?.length ? (
                                    <span className="text-[10px] text-floo-accent-gold font-ui">
                                      {clueLinksState[clue.id].length} 关联
                                    </span>
                                  ) : null}
                                </div>
                                <p className="text-[10px] text-floo-text-muted/60 font-body mt-1">
                                  {clue.content.substring(0, 80)}...
                                </p>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 选中线索的关联目标 */}
                        {selectedClue && (
                          <div className="p-3 rounded-lg bg-floo-bg-secondary/50 border border-floo-text-muted/10">
                            <p className="text-xs text-floo-text-muted/60 font-ui mb-2">
                              将「{clues.find((c) => c.id === selectedClue)?.title}」与其他线索关联
                            </p>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                              {discoveredClues
                                .filter((c) => c.id !== selectedClue)
                                .map((clue) => {
                                  const isLinked = clueLinksState[selectedClue]?.includes(clue.id)
                                  return (
                                    <button
                                      key={clue.id}
                                      type="button"
                                      onClick={() => toggleClueLink(selectedClue, clue.id)}
                                      className={[
                                        'w-full text-left p-2 rounded border transition-all text-xs',
                                        isLinked
                                          ? 'bg-floo-accent-gold/10 border-floo-accent-gold/40'
                                          : 'bg-floo-bg-primary border-floo-text-muted/10 hover:border-floo-text-muted/30',
                                      ].join(' ')}
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className={isLinked ? 'text-floo-accent-gold' : 'text-floo-text-muted/40'}>
                                          {isLinked ? '✓' : '○'}
                                        </span>
                                        <span className="text-floo-text-primary">{clue.title}</span>
                                      </div>
                                    </button>
                                  )
                                })}
                            </div>
                          </div>
                        )}

                        {/* 已有关联显示 */}
                        {Object.keys(clueLinksState).length > 0 && (
                          <div className="p-3 rounded-lg bg-floo-bg-secondary/50 border border-floo-text-muted/10">
                            <p className="text-xs text-floo-text-muted/60 font-ui mb-2">已建立的关联</p>
                            <div className="space-y-2">
                              {Object.entries(clueLinksState).map(([sourceId, targetIds]) =>
                                targetIds.map((targetId) => {
                                  const source = clues.find((c) => c.id === sourceId)
                                  const target = clues.find((c) => c.id === targetId)
                                  if (!source || !target) return null
                                  return (
                                    <div key={`${sourceId}-${targetId}`} className="flex items-center gap-2 text-xs">
                                      <span className="text-floo-text-primary">{source.title}</span>
                                      <span className="text-floo-accent-gold">→</span>
                                      <span className="text-floo-text-primary">{target.title}</span>
                                    </div>
                                  )
                                })
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* 推理链标签 */}
                {activeTab === 'chain' && (
                  <div className="space-y-4">
                    {discoveredClues.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-floo-text-muted/40 font-body text-sm">
                          还没有发现任何线索
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* 推理链概览 */}
                        <div className="p-3 rounded-lg bg-floo-bg-secondary/50 border border-floo-text-muted/10">
                          <p className="text-xs text-floo-text-muted/60 font-ui mb-3">推理概览</p>
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <span className="text-floo-text-muted/40">已发现线索</span>
                              <p className="text-floo-text-primary font-heading text-lg">
                                {discoveredClues.length}/{clues.length}
                              </p>
                            </div>
                            <div>
                              <span className="text-floo-text-muted/40">人物关联</span>
                              <p className="text-floo-text-primary font-heading text-lg">
                                {linkCount}
                              </p>
                            </div>
                            <div>
                              <span className="text-floo-text-muted/40">线索关联</span>
                              <p className="text-floo-text-primary font-heading text-lg">
                                {clueLinkCount}
                              </p>
                            </div>
                            <div>
                              <span className="text-floo-text-muted/40">关联人物</span>
                              <p className="text-floo-text-primary font-heading text-lg">
                                {Object.keys(suspicions).filter((k) => suspicions[k].length > 0).length}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* 线索详情与关联 */}
                        <div className="space-y-3">
                          {discoveredClues.map((clue) => {
                            const linkedChars = getLinkedCharacters(clue.id)
                            const linkedClues = getLinkedClues(clue.id)
                            if (linkedChars.length === 0 && linkedClues.length === 0) return null
                            return (
                              <div
                                key={clue.id}
                                className="p-3 rounded-lg bg-floo-bg-secondary/50 border border-floo-text-muted/10"
                              >
                                <p className="font-heading text-sm text-floo-text-primary">{clue.title}</p>
                                {linkedChars.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-1">
                                    <span className="text-[10px] text-floo-text-muted/40 font-ui">人物:</span>
                                    {linkedChars.map((name) => (
                                      <span key={name} className="text-[10px] px-2 py-0.5 rounded bg-floo-accent-gold/10 text-floo-accent-gold font-ui">
                                        {name}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                {linkedClues.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-1">
                                    <span className="text-[10px] text-floo-text-muted/40 font-ui">线索:</span>
                                    {linkedClues.map((title) => (
                                      <span key={title} className="text-[10px] px-2 py-0.5 rounded bg-floo-accent-blue/10 text-floo-accent-blue font-ui">
                                        {title}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>

                        {/* 预定义的线索关联（来自 story.json） */}
                        {clueLinks.length > 0 && (
                          <div className="p-3 rounded-lg bg-floo-bg-secondary/50 border border-floo-text-muted/10">
                            <p className="text-xs text-floo-text-muted/60 font-ui mb-3">系统提示的关联</p>
                            <div className="space-y-2">
                              {clueLinks.map((link, i) => {
                                const source = clues.find((c) => c.id === link.sourceClueId)
                                const target = clues.find((c) => c.id === link.targetClueId)
                                if (!source || !target) return null
                                if (!discoveredClueIds.has(link.sourceClueId) || !discoveredClueIds.has(link.targetClueId)) return null
                                return (
                                  <div key={i} className="flex items-center gap-2 text-xs">
                                    <span className="text-floo-text-primary">{source.title}</span>
                                    <span className={getLinkTypeColor(link.linkType)}>
                                      {getLinkTypeLabel(link.linkType)}
                                    </span>
                                    <span className="text-floo-text-primary">{target.title}</span>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
