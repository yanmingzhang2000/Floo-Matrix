/**
 * 开端番外·送不到 - 游戏主视图
 * 快递员时间循环互动叙事游戏
 * 集成循环系统、线索系统、信任系统、配送任务系统
 */
import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import storyDataJson from '../story.json'
import { LoopResetOverlay } from '@/games/03-kai-duan/components/LoopResetOverlay'
import { FlashbackOverlay } from '@/games/03-kai-duan/components/FlashbackOverlay'
import { DialogueBox } from '@/core/components/DialogueBox'
import { ChoicePanel } from '@/core/components/ChoicePanel'
import { SceneBackdrop } from '@/core/components/SceneBackdrop'
import { InvestigationPanel } from '@/core/components/InvestigationPanel'
import { ClueDrawer } from '@/core/components/ClueDrawer'
import { ReasoningBoard } from '@/core/components/ReasoningBoard'
import { RelationshipGraph } from '@/core/components/RelationshipGraph'
import { GameTutorial } from '@/core/components/GameTutorial'
import { useStoryEngine } from '@/core/hooks/useStoryEngine'
import { audioManager } from '@/core/engine/audioManager'
import type { StoryData } from '@/core/types/story'

const storyData = storyDataJson as unknown as StoryData

interface SongBuDaoProps {
  onExit: () => void
}

const base = import.meta.env.BASE_URL

const AMBIENT_SOUNDS: Record<string, string> = {
  courier_station: `${base}audio/ambient/cabin.mp3`,
  city_street: `${base}audio/ambient/forest.mp3`,
  bridge_side: `${base}audio/ambient/forest.mp3`,
  residential: `${base}audio/ambient/cabin.mp3`,
  apartment: `${base}audio/ambient/basement.mp3`,
  bus: `${base}audio/ambient/basement.mp3`,
  police_station: `${base}audio/ambient/cabin.mp3`,
  hospital: `${base}audio/ambient/cabin.mp3`,
}

const SFX_SOUNDS: Record<string, string> = {
  heartbeat: `${base}audio/sfx/heartbeat.mp3`,
  'loop-reset': `${base}audio/sfx/bad-ending-impact.mp3`,
  'good-ending': `${base}audio/sfx/good-ending-chime.mp3`,
  'bad-ending': `${base}audio/sfx/bad-ending-impact.mp3`,
  explosion: `${base}audio/sfx/bad-ending-impact.mp3`,
}

// 副线标签
const SUBLINE_LABELS: Record<string, string> = {
  saved_elderly_man: '老人',
  saved_falling_child: '小孩',
  saved_qin_rourou: '秦柔柔',
  qin_rourou_trust: '信任',
  met_dr_jiang: '姜医生',
  career_dream: '梦想',
  subline1_unlocked: '老人',
  subline2_unlocked: '小孩',
  subline4_unlocked: '秦柔柔',
}

const TUTORIAL_KEY = 'floo-tutorial-song-bu-dao'
const TUTORIAL_STEPS = [
  {
    icon: '📦',
    title: '快递任务',
    content: '你是一名快递员，每天需要完成配送任务。有一份收件人为肖鹤云的快递始终无法送达。',
  },
  {
    icon: '🔄',
    title: '时间循环',
    content: '你陷入了时间循环，每天早上都会回到快递站。但你保留了所有记忆。',
  },
  {
    icon: '🔍',
    title: '探索与线索',
    content: '每次循环可以调查不同的人和事。点击调查按钮收集线索，解锁支线故事。',
  },
  {
    icon: '⚡',
    title: '最终循环',
    content: '第10次循环是最后机会。你的结局取决于之前积累的标记——可能是多种不同结局之一。',
  },
]

// 信任度变化映射
const TRUST_CHANGES: Record<string, number> = {
  saved_elderly_man: 10,
  saved_falling_child: 10,
  saved_qin_rourou: 10,
  qin_rourou_trust: 10,
  police_support: 5,
  investigated_alone: -10,
}

export function SongBuDao({ onExit }: SongBuDaoProps) {
  const { currentNode, availableChoices, selectChoice, advanceNode, jumpToNode, canAdvance, isEnding } =
    useStoryEngine(storyData as StoryData)
  const registeredRef = useRef(false)

  // 引导状态
  const [showTutorial, setShowTutorial] = useState(() => {
    return !localStorage.getItem(TUTORIAL_KEY)
  })

  // 线索收集状态
  const [discoveredClues, setDiscoveredClues] = useState<Set<string>>(new Set())

  // 循环相关状态
  const [currentLoop, setCurrentLoop] = useState(1)
  const [showLoopReset, setShowLoopReset] = useState(false)
  const [prevLoop, setPrevLoop] = useState(1)
  const [unlockedSublines, setUnlockedSublines] = useState<Set<string>>(new Set())

  // 信任度状态
  const [trustLevel, setTrustLevel] = useState(50)

  const handleClueFound = useCallback((clueId: string) => {
    setDiscoveredClues((prev) => {
      if (prev.has(clueId)) return prev
      const next = new Set(prev)
      next.add(clueId)
      return next
    })
  }, [])

  // 注册音频
  useEffect(() => {
    if (registeredRef.current) return
    registeredRef.current = true
    Object.entries(AMBIENT_SOUNDS).forEach(([key, src]) => {
      audioManager.register(key, src, { loop: true, volume: 0.5 })
    })
    Object.entries(SFX_SOUNDS).forEach(([key, src]) => {
      audioManager.register(key, src, { volume: 0.8 })
    })
  }, [])

  // 监听节点变化，更新循环状态和播放音效
  useEffect(() => {
    if (!currentNode) return

    // 播放环境音
    if (currentNode.ambientSound && AMBIENT_SOUNDS[currentNode.ambientSound]) {
      audioManager.playBgm(currentNode.ambientSound)
    }

    // 检测循环变化
    const newLoop = (() => {
      const id = currentNode.id
      const match = id.match(/^loop(\d+)_/)
      if (match) return parseInt(match[1])
      return currentLoop
    })()

    if (newLoop !== currentLoop && newLoop > 1) {
      setPrevLoop(currentLoop)
      setCurrentLoop(newLoop)
      setShowLoopReset(true)
      audioManager.play('loop-reset')
      setTimeout(() => setShowLoopReset(false), 2500)
    } else if (newLoop !== currentLoop) {
      setCurrentLoop(newLoop)
    }

    // 检测副线解锁和信任度变化
    if (currentNode.effects) {
      currentNode.effects.forEach((effect) => {
        if (effect.type === 'setFlag' && effect.key.startsWith('subline')) {
          setUnlockedSublines((prev) => new Set(prev).add(effect.key))
        }
        if (effect.type === 'setFlag' && effect.key.startsWith('saved_')) {
          setUnlockedSublines((prev) => new Set(prev).add(effect.key))
        }
        // 信任度变化
        if (effect.type === 'setFlag' && TRUST_CHANGES[effect.key]) {
          setTrustLevel((prev) => Math.max(0, Math.min(100, prev + TRUST_CHANGES[effect.key])))
        }
      })
    }

    // 结局音效
    if (currentNode.type === 'ending') {
      if (currentNode.endingVariant === 'bad') {
        audioManager.play('bad-ending')
      } else if (currentNode.endingVariant === 'good') {
        audioManager.play('good-ending')
      }
    }
  }, [currentNode, currentLoop])

  const handleRetry = () => {
    if (currentNode?.checkpointNodeId) {
      jumpToNode(currentNode.checkpointNodeId)
    } else {
      onExit()
    }
  }

  const isBadEnding = isEnding && currentNode?.endingVariant === 'bad'
  const isGoodEnding = isEnding && currentNode?.endingVariant === 'good'
  const investigations = currentNode?.investigations || []

  // 计算已解锁副线的显示标签
  const sublineDisplayLabels = useMemo(() => {
    return Array.from(unlockedSublines).map((key) => SUBLINE_LABELS[key] || key)
  }, [unlockedSublines])

  // Keep all hooks above the early return while the story engine initializes.
  const loopProgress = useMemo(() => {
    return Math.min(100, ((currentLoop - 1) / 9) * 100)
  }, [currentLoop])

  if (!currentNode) return null

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center px-6 py-12 overflow-hidden">
      <SceneBackdrop scene={currentNode.scene} tensionLevel={currentNode.tensionLevel} />

      {/* 游戏引导 */}
      <AnimatePresence>
        {showTutorial && (
          <GameTutorial
            steps={TUTORIAL_STEPS}
            storageKey={TUTORIAL_KEY}
            onComplete={() => setShowTutorial(false)}
          />
        )}
      </AnimatePresence>

      {/* UI 覆盖层 - 循环计数器 */}
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
          <span className="text-floo-text-muted text-xs font-ui">/ 10</span>
        </div>

        {/* 线索数量 */}
        <div className="flex items-center gap-2 bg-floo-bg-secondary/80 backdrop-blur-sm border border-floo-text-muted/20 rounded-lg px-4 py-2">
          <span className="text-floo-text-muted text-xs font-ui">线索</span>
          <span className="font-heading text-floo-accent-green text-lg">
            {discoveredClues.size}
          </span>
          <span className="text-floo-text-muted text-xs font-ui">/ {storyData.clues?.length || 0}</span>
        </div>

        {/* 已解锁副线 */}
        {sublineDisplayLabels.length > 0 && (
          <div className="flex flex-wrap gap-1 bg-floo-bg-secondary/80 backdrop-blur-sm border border-floo-text-muted/20 rounded-lg px-3 py-2">
            {sublineDisplayLabels.map((label) => (
              <span
                key={label}
                className="text-xs font-ui px-2 py-0.5 rounded bg-floo-accent-green/10 text-floo-accent-green border border-floo-accent-green/30"
              >
                {label}
              </span>
            ))}
          </div>
        )}
      </motion.div>

      {/* 循环进度条（替代爆炸倒计时） */}
      <motion.div
        className="fixed top-4 left-1/2 -translate-x-1/2 z-30 w-[280px] sm:w-[360px]"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="bg-floo-bg-secondary/80 backdrop-blur-sm border border-floo-text-muted/20 rounded-lg px-4 py-3">
          <div className="flex justify-between items-center mb-2">
            <span className="font-heading text-floo-accent-gold text-sm">第{currentLoop}天</span>
            <span className="text-floo-text-muted text-xs font-ui">循环进度</span>
          </div>
          <div className="relative h-2 bg-floo-bg-primary rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                background: `linear-gradient(90deg, #2ecc71 0%, #f39c12 70%, #e74c3c 100%)`,
              }}
              initial={{ width: 0 }}
              animate={{ width: `${loopProgress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
            <motion.div
              className="absolute top-0 bottom-0 w-1 bg-white/60 rounded-full"
              style={{ left: `${loopProgress}%` }}
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
          <div className="flex gap-1 mt-2 justify-center">
            {Array.from({ length: 10 }, (_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i < currentLoop
                    ? 'bg-floo-accent-green'
                    : 'bg-floo-text-muted/30'
                }`}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* 信任度指示器 */}
      <motion.div
        className="fixed top-4 right-4 z-30 flex items-center gap-2 bg-floo-bg-secondary/80 backdrop-blur-sm border border-floo-text-muted/20 rounded-lg px-4 py-2"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <span className="text-floo-text-muted text-xs font-ui">信任度</span>
        <span className={`font-heading text-lg ${
          trustLevel >= 80 ? 'text-floo-accent-green' :
          trustLevel >= 50 ? 'text-floo-accent-gold' :
          'text-red-400'
        }`}>
          {trustLevel}%
        </span>
      </motion.div>

      {/* 线索抽屉 */}
      <ClueDrawer
        allClues={storyData.clues || []}
        discoveredIds={discoveredClues}
      />

      {/* 推理板 */}
      <ReasoningBoard
        characters={storyData.characters || []}
        clues={storyData.clues || []}
        clueLinks={storyData.clueLinks}
        discoveredClueIds={discoveredClues}
      />

      {/* 人物关系图 */}
      <RelationshipGraph
        gameId={storyData.gameId}
        characters={storyData.characters || []}
      />

      {/* 循环重置动画 */}
      <LoopResetOverlay
        active={showLoopReset}
        fromLoop={prevLoop}
        toLoop={currentLoop}
        onComplete={() => setShowLoopReset(false)}
      />

      <AnimatePresence mode="wait">
        {isBadEnding ? (
          <motion.div
            key={currentNode.id}
            className="flex flex-col items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="max-w-2xl text-center">
              {/* 坏结局红色闪烁 */}
              <motion.div
                className="mb-8"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
              >
                <motion.div
                  className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-red-500/50 flex items-center justify-center"
                  animate={{ borderColor: ['rgba(239,68,68,0.3)', 'rgba(239,68,68,0.8)', 'rgba(239,68,68,0.3)'] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="text-red-400 text-2xl">✕</span>
                </motion.div>
                <h2 className="font-heading text-red-400 text-xl tracking-wider mb-2">循环失败</h2>
                <p className="text-floo-text-muted text-sm font-ui">时间将重新开始</p>
              </motion.div>

              <DialogueBox content={currentNode.content} />

              <motion.button
                type="button"
                onClick={handleRetry}
                className="mt-6 px-6 py-3 rounded-lg border border-red-400/40 bg-floo-bg-secondary text-floo-text-primary font-ui hover:bg-red-400/10 hover:border-red-400/60 transition-colors"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                重新开始循环 →
              </motion.button>
            </div>
          </motion.div>
        ) : isGoodEnding ? (
          <motion.div
            key={currentNode.id}
            className="flex flex-col items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="max-w-2xl text-center">
              {/* 好结局金色光芒 */}
              <motion.div
                className="mb-8"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
              >
                <motion.div
                  className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-floo-accent-gold/50 flex items-center justify-center"
                  animate={{ boxShadow: ['0 0 20px rgba(243,156,18,0.2)', '0 0 40px rgba(243,156,18,0.4)', '0 0 20px rgba(243,156,18,0.2)'] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <span className="text-floo-accent-gold text-2xl">✦</span>
                </motion.div>
                <h2 className="font-heading text-floo-accent-gold text-xl tracking-wider mb-2">循环终结</h2>
              </motion.div>

              <DialogueBox content={currentNode.content} />

              <motion.div
                className="flex flex-col items-center mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <p className="font-heading text-floo-accent-gold text-sm mb-4 tracking-widest uppercase">
                  记忆水晶已收入魔袋
                </p>
                <motion.button
                  type="button"
                  onClick={onExit}
                  className="px-6 py-3 rounded-lg bg-floo-accent-gold/20 border border-floo-accent-gold text-floo-text-primary font-ui hover:bg-floo-accent-gold/30 transition-colors"
                >
                  返回
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        ) : currentNode.scene === 'bridge_side' && currentNode.type === 'cutscene' ? (
          <motion.div
            key={currentNode.id}
            className="flex flex-col items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <FlashbackOverlay content={currentNode.content} onAdvance={advanceNode} />
          </motion.div>
        ) : (
          <motion.div
            key={currentNode.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center relative z-10 max-w-4xl"
          >
            <DialogueBox content={currentNode.content} speaker={currentNode.speaker} />

            {/* 调查面板 */}
            {investigations.length > 0 && (
              <InvestigationPanel
                points={investigations}
                onClueFound={handleClueFound}
                discoveredClues={discoveredClues}
              />
            )}

            {!isEnding && availableChoices.length > 0 && (
              <ChoicePanel choices={availableChoices} onSelect={selectChoice} />
            )}

            {!isEnding && canAdvance && (
              <motion.button
                type="button"
                onClick={advanceNode}
                className="mt-6 px-6 py-3 rounded-lg border border-floo-accent-green/40 bg-floo-bg-secondary text-floo-text-primary font-ui hover:bg-floo-accent-green/10 hover:border-floo-accent-green/60 transition-colors"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                继续 →
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
