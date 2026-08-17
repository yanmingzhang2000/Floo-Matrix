/**
 * 漂白·少年甄珍 - 游戏主视图
 * 少女被困肉联厂团伙的互动叙事游戏
 * 集成线索系统、观察系统、逃亡抉择系统
 */
import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import storyDataJson from '../story.json'
import { DialogueBox } from '@/core/components/DialogueBox'
import { ChoicePanel } from '@/core/components/ChoicePanel'
import { SceneBackdrop } from '@/core/components/SceneBackdrop'
import { InvestigationPanel } from '@/core/components/InvestigationPanel'
import { ClueDrawer } from '@/core/components/ClueDrawer'
import { GameTutorial } from '@/core/components/GameTutorial'
import { useStoryEngine } from '@/core/hooks/useStoryEngine'
import { audioManager } from '@/core/engine/audioManager'
import type { StoryData } from '@/core/types/story'

const storyData = storyDataJson as unknown as StoryData

interface PiaoBaiZhenZhenProps {
  onExit: () => void
}

const base = import.meta.env.BASE_URL

const AMBIENT_SOUNDS: Record<string, string> = {
  night_wind: `${base}audio/ambient/forest.mp3`,
  room_silence: `${base}audio/ambient/basement.mp3`,
  city_street: `${base}audio/ambient/cabin.mp3`,
  bus_engine: `${base}audio/ambient/basement.mp3`,
  car_engine: `${base}audio/ambient/basement.mp3`,
  street: `${base}audio/ambient/cabin.mp3`,
  door_open: `${base}audio/ambient/basement.mp3`,
  phone_call: `${base}audio/ambient/basement.mp3`,
  window: `${base}audio/ambient/forest.mp3`,
  wind_high: `${base}audio/ambient/forest.mp3`,
  outer_wall: `${base}audio/ambient/forest.mp3`,
  neighbor_room: `${base}audio/ambient/basement.mp3`,
  stairwell: `${base}audio/ambient/basement.mp3`,
  city_noise: `${base}audio/ambient/cabin.mp3`,
  unknown_location: `${base}audio/ambient/basement.mp3`,
  classmate_flat: `${base}audio/ambient/basement.mp3`,
  indoor_silence: `${base}audio/ambient/basement.mp3`,
  door_handle: `${base}audio/ambient/basement.mp3`,
  neighbor_corridor: `${base}audio/ambient/basement.mp3`,
  distant_traffic: `${base}audio/ambient/forest.mp3`,
  quiet_office: `${base}audio/ambient/cabin.mp3`,
  years_later: `${base}audio/ambient/cabin.mp3`,
  rain_heavy: `${base}audio/ambient/forest.mp3`,
  wind_cold: `${base}audio/ambient/forest.mp3`,
  room_damp: `${base}audio/ambient/basement.mp3`,
  water_dripping: `${base}audio/ambient/basement.mp3`,
  water_running_heavy: `${base}audio/ambient/basement.mp3`,
  engine_hum: `${base}audio/ambient/basement.mp3`,
  corridor_noise: `${base}audio/ambient/basement.mp3`,
  street_busy: `${base}audio/ambient/cabin.mp3`,
  siren_loud: `${base}audio/ambient/cabin.mp3`,
}

const SFX_SOUNDS: Record<string, string> = {
  heartbeat: `${base}audio/sfx/heartbeat.mp3`,
  'bad-ending': `${base}audio/sfx/bad-ending-impact.mp3`,
  'good-ending': `${base}audio/sfx/good-ending-chime.mp3`,
  'door-knock': `${base}audio/sfx/bad-ending-impact.mp3`,
}

const TUTORIAL_KEY = 'floo-tutorial-piao-bai-zhen-zhen'
const TUTORIAL_STEPS = [
  {
    icon: '🪟',
    title: '窗外',
    content: '十七岁的甄珍离家出走后，借住同学空房，却阴差阳错卷入了危险。',
  },
  {
    icon: '👁️',
    title: '观察',
    content: '注意每一个细节——后视镜里的眼神、门锁的声音、窗外的墙沿。这些可能是你唯一的线索。',
  },
  {
    icon: '🔍',
    title: '调查',
    content: '点击调查按钮，仔细查看周围环境。每一个发现都可能帮助你逃出去。',
  },
  {
    icon: '🏃',
    title: '抉择',
    content: '你的每个选择都关乎生死。看见出口的时候，真的就自由了吗？',
  },
]

export function PiaoBaiZhenZhen({ onExit }: PiaoBaiZhenZhenProps) {
  const { currentNode, availableChoices, selectChoice, advanceNode, jumpToNode, canAdvance, isEnding } =
    useStoryEngine(storyData as StoryData)
  const registeredRef = useRef(false)

  const [showTutorial, setShowTutorial] = useState(() => {
    return !localStorage.getItem(TUTORIAL_KEY)
  })

  const [discoveredClues, setDiscoveredClues] = useState<Set<string>>(new Set())

  const handleClueFound = useCallback((clueId: string) => {
    setDiscoveredClues((prev) => {
      if (prev.has(clueId)) return prev
      const next = new Set(prev)
      next.add(clueId)
      return next
    })
  }, [])

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

  useEffect(() => {
    if (!currentNode) return

    if (currentNode.ambientSound && AMBIENT_SOUNDS[currentNode.ambientSound]) {
      audioManager.playBgm(currentNode.ambientSound)
    }

    if (currentNode.type === 'ending') {
      if (currentNode.endingVariant === 'bad') {
        audioManager.play('bad-ending')
      } else if (currentNode.endingVariant === 'good') {
        audioManager.play('good-ending')
      }
    }
  }, [currentNode])

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

  if (!currentNode) return null

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center px-6 py-12 overflow-hidden">
      <SceneBackdrop scene={currentNode.scene} tensionLevel={currentNode.tensionLevel} />

      <AnimatePresence>
        {showTutorial && (
          <GameTutorial
            steps={TUTORIAL_STEPS}
            storageKey={TUTORIAL_KEY}
            onComplete={() => setShowTutorial(false)}
          />
        )}
      </AnimatePresence>

      <motion.div
        className="fixed top-4 left-4 z-30 flex flex-col gap-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="flex items-center gap-2 bg-floo-bg-secondary/80 backdrop-blur-sm border border-floo-text-muted/20 rounded-lg px-4 py-2">
          <span className="text-floo-text-muted text-xs font-ui">线索</span>
          <span className="font-heading text-floo-accent-green text-lg">
            {discoveredClues.size}
          </span>
          <span className="text-floo-text-muted text-xs font-ui">/ {storyData.clues?.length || 0}</span>
        </div>
      </motion.div>

      <ClueDrawer
        allClues={storyData.clues || []}
        discoveredIds={discoveredClues}
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
                <h2 className="font-heading text-red-400 text-xl tracking-wider mb-2">未能逃脱</h2>
                <p className="text-floo-text-muted text-sm font-ui">故事将从关键节点重新开始</p>
              </motion.div>

              <DialogueBox content={currentNode.content} />

              {currentNode.checkpointNodeId && (
                <motion.button
                  type="button"
                  onClick={handleRetry}
                  className="mt-6 px-6 py-3 rounded-lg border border-red-400/40 bg-floo-bg-secondary text-floo-text-primary font-ui hover:bg-red-400/10 hover:border-red-400/60 transition-colors"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  重新尝试 →
                </motion.button>
              )}
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
                <h2 className="font-heading text-floo-accent-gold text-xl tracking-wider mb-2">逃出生天</h2>
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
