/**
 * 开端 - 游戏主视图
 * 时间循环互动叙事游戏
 * 集成循环系统、线索系统、信任系统、时间线系统
 */
import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import storyDataJson from '../story.json'
import { LoopResetOverlay } from './LoopResetOverlay'
import { FlashbackOverlay } from './FlashbackOverlay'
import { CycleCounter } from './CycleCounter'
import { TimelineBar } from './TimelineBar'
import { TrustMeter } from './TrustMeter'
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

interface KaiDuanProps {
  onExit: () => void
}

const base = import.meta.env.BASE_URL

const AMBIENT_SOUNDS: Record<string, string> = {
  bus: `${base}audio/ambient/basement.wav`,
  convention: `${base}audio/ambient/forest.wav`,
  police_station: `${base}audio/ambient/cabin.wav`,
  factory: `${base}audio/ambient/basement.wav`,
  bridge: `${base}audio/ambient/forest.wav`,
}

const SFX_SOUNDS: Record<string, string> = {
  heartbeat: `${base}audio/sfx/heartbeat.wav`,
  'loop-reset': `${base}audio/sfx/bad-ending-impact.wav`,
  clue: `${base}audio/sfx/clue.wav`,
  'good-ending': `${base}audio/sfx/good-ending-chime.wav`,
  'bad-ending': `${base}audio/sfx/bad-ending-impact.wav`,
  explosion: `${base}audio/sfx/bad-ending-impact.wav`,
}

// 循环对应的爆炸前时间
const LOOP_TIMES: Record<number, string> = {
  1: '1:40',
  2: '1:38',
  3: '1:35',
  4: '1:33',
  5: '1:30',
  6: '1:25',
  7: '1:20',
  8: '1:15',
  9: '1:10',
  10: '1:05',
  11: '1:00',
  12: '1:00',
}

const TUTORIAL_KEY = 'floo-tutorial-kai-duan'
const TUTORIAL_STEPS = [
  {
    icon: '🔄',
    title: '时间循环',
    content: '你在45路公交车上，爆炸将在1:45发生。每次死亡或失败，时间会倒流——但你会回到更早的时间点。',
  },
  {
    icon: '🔍',
    title: '探索与线索',
    content: '每次循环可以调查不同的乘客和场景。点击调查按钮收集线索，解锁副线故事。线索会收入左上角的线索抽屉。',
  },
  {
    icon: '🔗',
    title: '积累与解锁',
    content: '你的选择会设置隐藏标记，影响后续循环中可用的对话选项。尽量在早期循环中探索更多内容，为最终循环做准备。',
  },
  {
    icon: '⚡',
    title: '最终循环',
    content: '第12次循环是最后机会。你的结局取决于之前积累的标记——可能是4种不同结局之一。尽量解锁所有副线！',
  },
]

export function KaiDuan({ onExit }: KaiDuanProps) {
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

  const handleClueFound = useCallback((clueId: string) => {
    setDiscoveredClues((prev) => {
      if (prev.has(clueId)) return prev
      const next = new Set(prev)
      next.add(clueId)
      audioManager.play('clue')
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

    // 检测副线解锁
    if (currentNode.effects) {
      currentNode.effects.forEach((effect) => {
        if (effect.type === 'setFlag' && effect.key.startsWith('subline')) {
          setUnlockedSublines((prev) => new Set(prev).add(effect.key))
        }
        if (effect.type === 'setFlag' && effect.key.startsWith('investigated_')) {
          setUnlockedSublines((prev) => new Set(prev).add(effect.key))
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

  // 计算时间线进度
  const timeProgress = useMemo(() => {
    return Math.min(100, ((currentLoop - 1) / 11) * 100)
  }, [currentLoop])

  const currentTimeStr = LOOP_TIMES[currentLoop] || '1:40'

  if (!currentNode) return null

  const handleRetry = () => {
    if (currentNode.checkpointNodeId) {
      jumpToNode(currentNode.checkpointNodeId)
    } else {
      onExit()
    }
  }

  const isBadEnding = isEnding && currentNode.endingVariant === 'bad'
  const isGoodEnding = isEnding && currentNode.endingVariant === 'good'
  const investigations = currentNode.investigations || []

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

      {/* UI 覆盖层 */}
      <CycleCounter
        currentLoop={currentLoop}
        maxLoop={12}
        discoveredClues={discoveredClues.size}
        totalClues={storyData.clues?.length || 0}
        unlockedSublines={Array.from(unlockedSublines)}
      />

      <TimelineBar
        currentTime={currentTimeStr}
        explosionTime="1:45"
        progress={timeProgress}
      />

      <TrustMeter trustLevel={85} />

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

      {/* 人物关系图谱 */}
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
        ) : currentNode.scene === 'bridge' && currentNode.type === 'cutscene' ? (
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
