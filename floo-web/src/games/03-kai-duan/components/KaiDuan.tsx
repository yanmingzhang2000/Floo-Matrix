/**
 * 开端 - 游戏主视图
 * 时间循环互动叙事游戏
 * 集成循环系统、线索系统、信任系统、时间线系统
 *
 * 核心设计：世界会重置，信息不会。
 * 每次失败都产出新信息，玩家靠不断失败拼出真相。
 */
import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import storyDataJson from '../story.json'
import { LoopResetOverlay } from './LoopResetOverlay'
import { CycleCounter } from './CycleCounter'
import { TimelineBar } from './TimelineBar'
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
  residential: `${base}audio/ambient/cabin.wav`,
}

const SFX_SOUNDS: Record<string, string> = {
  heartbeat: `${base}audio/sfx/heartbeat.wav`,
  'loop-reset': `${base}audio/sfx/bad-ending-impact.wav`,
  clue: `${base}audio/sfx/heartbeat.wav`,
  'good-ending': `${base}audio/sfx/good-ending-chime.wav`,
  explosion: `${base}audio/sfx/bad-ending-impact.wav`,
}

// 幕对应的当前时间（玩家感知到的时间）
const ACT_TIMES: Record<number, string> = {
  0: '1:20',  // 序章
  1: '1:20',  // 理解循环
  2: '1:20',  // 认识肖鹤云
  3: '1:20',  // 油罐车
  4: '1:20',  // 排除油罐车
  5: '1:20',  // 调查乘客
  6: '1:20',  // 卢迪/老张/马国强/老焦
  7: '1:20',  // 发现炸弹
  8: '1:15',  // 陶映红的真相
  9: '1:10',  // 警方线
  10: '1:05', // 王萌萌的真相
  11: '1:00', // 王兴德
  12: '1:00', // 肖鹤云
  13: '12:55', // 所有线索汇合
  14: '12:50', // 最终循环
}

const TUTORIAL_KEY = 'floo-tutorial-kai-duan'
const TUTORIAL_STEPS = [
  {
    icon: '🔄',
    title: '时间循环',
    content: '你在45路公交车上，爆炸将在1:45发生。每次失败，时间会倒流——但你会回到更早的时间点，带着之前的记忆。',
  },
  {
    icon: '🔍',
    title: '探索与信息',
    content: '每次循环可以调查不同的乘客和场景。点击调查按钮收集信息，了解车上每个人的故事。',
  },
  {
    icon: '💡',
    title: '失败即信息',
    content: '每次失败都会让你获得新信息。躲开油罐车仍爆炸？说明问题在车内。尝试下车失败？说明必须留在车上。',
  },
  {
    icon: '⚡',
    title: '最终循环',
    content: '当你收集了足够多的信息，就能进入最终循环。你的结局取决于之前建立的联系和积累的信息。',
  },
]

export function KaiDuan({ onExit }: KaiDuanProps) {
  const { currentNode, availableChoices, selectChoice, advanceNode, canAdvance, isEnding } =
    useStoryEngine(storyData as StoryData)
  const registeredRef = useRef(false)

  // 引导状态
  const [showTutorial, setShowTutorial] = useState(() => {
    return !localStorage.getItem(TUTORIAL_KEY)
  })

  // 线索收集状态
  const [discoveredClues, setDiscoveredClues] = useState<Set<string>>(new Set())

  // 循环相关状态
  const [currentAct, setCurrentAct] = useState(0)
  const [showLoopReset, setShowLoopReset] = useState(false)
  const [unlockedConnections, setUnlockedConnections] = useState<Set<string>>(new Set())

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

    // 检测阶段变化（从节点ID中提取 act 编号）
    const newAct = (() => {
      const id = currentNode.id
      // 匹配 prologue
      if (id === 'prologue' || id.startsWith('prologue_')) return 0
      // 匹配 actX
      const match = id.match(/^act(\d+)_/)
      if (match) return parseInt(match[1])
      // 匹配 ending
      if (id.startsWith('ending_')) return 14
      return currentAct
    })()

    if (newAct !== currentAct) {
      setCurrentAct(newAct)
      // 只有进入新的 act（非序章）时才显示重置动画
      if (newAct > 0) {
        setShowLoopReset(true)
        audioManager.play('loop-reset')
        setTimeout(() => setShowLoopReset(false), 2500)
      }
    }

    // 检测人物联系解锁
    if (currentNode.effects) {
      currentNode.effects.forEach((effect) => {
        if (effect.type === 'setFlag') {
          setUnlockedConnections((prev) => new Set(prev).add(effect.key))
        }
      })
    }

    // 结局音效
    if (currentNode.type === 'ending' && currentNode.endingVariant === 'good') {
      audioManager.play('good-ending')
    }
  }, [currentNode, currentAct])

  // 计算时间线进度
  const timeProgress = useMemo(() => {
    return Math.min(100, (currentAct / 14) * 100)
  }, [currentAct])

  const currentTimeStr = ACT_TIMES[currentAct] || '1:20'

  if (!currentNode) return null

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
        currentTime={currentTimeStr}
        discoveredClues={discoveredClues.size}
        totalClues={storyData.clues?.length || 0}
        unlockedConnections={Array.from(unlockedConnections)}
      />

      <TimelineBar
        currentTime={currentTimeStr}
        explosionTime="1:45"
        progress={timeProgress}
      />

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
        onComplete={() => setShowLoopReset(false)}
      />

      <AnimatePresence mode="wait">
        {isGoodEnding ? (
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
