/**
 * 人物关系图谱组件
 * 可视化展示主角与各角色的关系：解锁状态、阵营判断、互动次数
 */
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRelationshipStore } from '@/core/store/relationshipStore'
import type { Character, Alignment } from '@/core/types/story'

interface RelationshipGraphProps {
  gameId: string
  characters: Character[]
}

interface NodePos {
  x: number
  y: number
}

const ALIGNMENT_COLORS: Record<Alignment, string> = {
  good: '#c8934a',
  bad: '#b85450',
  neutral: '#5a8aa8',
  unknown: '#7d7268',
}

const ALIGNMENT_LABELS: Record<Alignment, string> = {
  good: '好人',
  bad: '坏人',
  neutral: '中立',
  unknown: '未知',
}

export function RelationshipGraph({ gameId, characters }: RelationshipGraphProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { relations, setAlignment } = useRelationshipStore()

  const gameRelations = relations[gameId] || {}
  const metCount = characters.filter((c) => {
    const r = gameRelations[c.id]
    return r?.met
  }).length

  // 计算节点布局：主角居中，其余角色圆形排列
  const nodePositions = useMemo(() => {
    const positions: Record<string, NodePos> = {}
    const cx = 200
    const cy = 180
    const protagonist = characters.find((c) => c.id === 'protagonist')
    const others = characters.filter((c) => c.id !== 'protagonist')

    if (protagonist) {
      positions[protagonist.id] = { x: cx, y: cy }
    }

    const radius = 130
    others.forEach((char, i) => {
      const angle = (2 * Math.PI * i) / others.length - Math.PI / 2
      positions[char.id] = {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
      }
    })

    return positions
  }, [characters])

  const selectedChar = selectedId ? characters.find((c) => c.id === selectedId) : null
  const selectedRelation = selectedId ? gameRelations[selectedId] : null

  const handleSetAlignment = (charId: string, alignment: Alignment) => {
    setAlignment(gameId, charId, alignment)
  }

  return (
    <>
      {/* 触发按钮 */}
      <motion.button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed top-16 left-4 z-40 flex items-center gap-2 px-3 py-2 rounded-lg bg-floo-bg-secondary/80 border border-floo-text-muted/20 text-floo-text-muted hover:border-floo-accent-gold/40 hover:text-floo-accent-gold transition-colors backdrop-blur-sm"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="text-lg">🕸</span>
        <span className="text-xs font-ui">
          人物 {metCount}/{characters.length}
        </span>
      </motion.button>

      {/* 面板 */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* 遮罩 */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsOpen(false); setSelectedId(null) }}
            />

            {/* 抽屉内容 */}
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
                  <h2 className="font-heading text-lg text-floo-text-primary">人物关系</h2>
                  <p className="text-xs text-floo-text-muted/60 font-ui mt-1">
                    已认识 {metCount} / {characters.length} 人
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => { setIsOpen(false); setSelectedId(null) }}
                  className="p-2 rounded-lg hover:bg-floo-bg-secondary text-floo-text-muted hover:text-floo-text-primary transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* 图谱区域 */}
              <div className="flex-1 overflow-y-auto p-4">
                <svg
                  viewBox="0 0 400 360"
                  className="w-full"
                  style={{ maxHeight: '400px' }}
                >
                  {/* 连线：已认识的角色与主角之间的连线 */}
                  {characters
                    .filter((c) => c.id !== 'protagonist' && gameRelations[c.id]?.met)
                    .map((c) => {
                      const protagonistPos = nodePositions['protagonist']
                      const charPos = nodePositions[c.id]
                      if (!protagonistPos || !charPos) return null
                      const rel = gameRelations[c.id]
                      const color = rel ? ALIGNMENT_COLORS[rel.alignment] : ALIGNMENT_COLORS.unknown
                      return (
                        <line
                          key={`line-${c.id}`}
                          x1={protagonistPos.x}
                          y1={protagonistPos.y}
                          x2={charPos.x}
                          y2={charPos.y}
                          stroke={color}
                          strokeWidth={2}
                          strokeOpacity={0.5}
                        />
                      )
                    })}

                  {/* 节点 */}
                  {characters.map((char) => {
                    const pos = nodePositions[char.id]
                    if (!pos) return null
                    const rel = gameRelations[char.id]
                    const isMet = rel?.met ?? false
                    const isProtagonist = char.id === 'protagonist'
                    const isSelected = selectedId === char.id
                    const color = isProtagonist
                      ? '#e4ddd2'
                      : isMet
                        ? ALIGNMENT_COLORS[rel?.alignment ?? 'unknown']
                        : '#3a3630'
                    const radius = isProtagonist ? 24 : 18

                    return (
                      <g
                        key={char.id}
                        onClick={() => !isProtagonist && setSelectedId(char.id)}
                        style={{ cursor: isProtagonist ? 'default' : 'pointer' }}
                      >
                        {/* 选中高亮圈 */}
                        {isSelected && (
                          <circle
                            cx={pos.x}
                            cy={pos.y}
                            r={radius + 6}
                            fill="none"
                            stroke={color}
                            strokeWidth={2}
                            strokeDasharray="4 2"
                            opacity={0.6}
                          />
                        )}
                        {/* 节点圆 */}
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r={radius}
                          fill={isMet ? color : 'transparent'}
                          stroke={color}
                          strokeWidth={isProtagonist ? 3 : 2}
                        />
                        {/* 未认识角色显示问号 */}
                        {!isMet && !isProtagonist && (
                          <text
                            x={pos.x}
                            y={pos.y + 1}
                            textAnchor="middle"
                            dominantBaseline="central"
                            fill="#7d7268"
                            fontSize="16"
                            fontFamily="serif"
                          >
                            ?
                          </text>
                        )}
                        {/* 名字标签 */}
                        <text
                          x={pos.x}
                          y={pos.y + radius + 14}
                          textAnchor="middle"
                          fill={isMet ? '#e4ddd2' : '#7d7268'}
                          fontSize="11"
                          fontFamily="'Noto Serif SC', serif"
                        >
                          {isMet ? char.name : '???'}
                        </text>
                      </g>
                    )
                  })}
                </svg>

                {/* 图例 */}
                <div className="flex flex-wrap gap-3 justify-center mt-4">
                  {(['good', 'bad', 'neutral', 'unknown'] as Alignment[]).map((a) => (
                    <div key={a} className="flex items-center gap-1.5">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: ALIGNMENT_COLORS[a] }}
                      />
                      <span className="text-xs font-ui text-floo-text-muted">
                        {ALIGNMENT_LABELS[a]}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full border-2 border-floo-text-muted/30 bg-transparent" />
                    <span className="text-xs font-ui text-floo-text-muted">未认识</span>
                  </div>
                </div>

                {/* 选中角色详情 */}
                <AnimatePresence>
                  {selectedChar && selectedRelation?.met && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="mt-4 p-4 rounded-lg border border-floo-text-muted/20 bg-floo-bg-secondary/50"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: ALIGNMENT_COLORS[selectedRelation.alignment] }}
                        />
                        <h3 className="font-heading text-floo-text-primary">
                          {selectedChar.name}
                        </h3>
                      </div>

                      {selectedChar.description && (
                        <p className="text-sm text-floo-text-muted/80 font-body mb-3">
                          {selectedChar.description}
                        </p>
                      )}

                      {selectedRelation.unlockedIdentity && (
                        <p className="text-sm text-floo-accent-gold font-body mb-3">
                          身份：{selectedRelation.unlockedIdentity}
                        </p>
                      )}

                      <p className="text-xs text-floo-text-muted/60 font-ui mb-3">
                        互动次数：{selectedRelation.interactCount}
                      </p>

                      {/* 阵营标记 */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-floo-text-muted/60 font-ui">标记为：</span>
                        {(['good', 'bad', 'neutral', 'unknown'] as Alignment[]).map((a) => (
                          <button
                            key={a}
                            type="button"
                            onClick={() => handleSetAlignment(selectedChar.id, a)}
                            className={`px-2 py-1 rounded text-xs font-ui transition-colors ${
                              selectedRelation.alignment === a
                                ? 'text-floo-bg-primary'
                                : 'text-floo-text-muted hover:text-floo-text-primary'
                            }`}
                            style={{
                              backgroundColor:
                                selectedRelation.alignment === a
                                  ? ALIGNMENT_COLORS[a]
                                  : 'transparent',
                              border: `1px solid ${ALIGNMENT_COLORS[a]}40`,
                            }}
                          >
                            {ALIGNMENT_LABELS[a]}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
