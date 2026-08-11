/**
 * 逃出魔窟 - 游戏主视图
 * 负责渲染当前剧本节点（对话/选择/过场/结局），驱动场景光影与环境音切换
 */
import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import storyData from '../story.json'
import { BadEndingOverlay } from './BadEndingOverlay'
import { RevealCutscene } from './RevealCutscene'
import { DialogueBox } from '@/core/components/DialogueBox'
import { ChoicePanel } from '@/core/components/ChoicePanel'
import { SceneBackdrop } from '@/core/components/SceneBackdrop'
import { useStoryEngine } from '@/core/hooks/useStoryEngine'
import { audioManager } from '@/core/engine/audioManager'
import type { StoryData } from '@/core/types/story'

interface EscapeTheDenProps {
  onExit: () => void
}

const AMBIENT_SOUNDS: Record<string, string> = {
  basement: '/audio/ambient/basement.wav',
  forest: '/audio/ambient/forest.wav',
  cabin: '/audio/ambient/cabin.wav',
}

const SFX_SOUNDS: Record<string, string> = {
  heartbeat: '/audio/sfx/heartbeat.wav',
  'bad-ending-impact': '/audio/sfx/bad-ending-impact.wav',
  'good-ending-chime': '/audio/sfx/good-ending-chime.wav',
}

export function EscapeTheDen({ onExit }: EscapeTheDenProps) {
  const { currentNode, availableChoices, selectChoice, advanceNode, jumpToNode, canAdvance, isEnding } =
    useStoryEngine(storyData as StoryData)
  const registeredRef = useRef(false)

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
        audioManager.play('bad-ending-impact')
      } else if (currentNode.endingVariant === 'good') {
        audioManager.play('good-ending-chime')
      }
    }
  }, [currentNode])

  if (!currentNode) return null

  const handleRetry = () => {
    if (currentNode.checkpointNodeId) {
      jumpToNode(currentNode.checkpointNodeId)
    } else {
      onExit()
    }
  }

  const isRevealCutscene = currentNode.type === 'cutscene' && currentNode.scene === 'reveal'
  const isBadEnding = isEnding && currentNode.endingVariant === 'bad'
  const isGoodEnding = isEnding && currentNode.endingVariant === 'good'

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center px-6 py-12 overflow-hidden">
      <SceneBackdrop scene={currentNode.scene} tensionLevel={currentNode.tensionLevel} />

      <AnimatePresence mode="wait">
        {isBadEnding ? (
          <BadEndingOverlay key={currentNode.id} content={currentNode.content} onRetry={handleRetry} />
        ) : isRevealCutscene ? (
          <motion.div
            key={currentNode.id}
            className="flex flex-col items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <RevealCutscene content={currentNode.content} onAdvance={advanceNode} />
          </motion.div>
        ) : (
          <motion.div
            key={currentNode.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center relative z-10"
          >
            <DialogueBox content={currentNode.content} speaker={currentNode.speaker} />

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

            {isGoodEnding && (
              <motion.div
                className="flex flex-col items-center mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <p className="font-heading text-floo-accent-gold text-sm mb-4 tracking-widest uppercase">
                  记忆水晶已收入魔袋
                </p>
                <motion.button
                  type="button"
                  onClick={onExit}
                  className="px-6 py-3 rounded-lg bg-floo-accent-gold/20 border border-floo-accent-gold text-floo-text-primary font-ui hover:bg-floo-accent-gold/30 transition-colors"
                >
                  返回壁炉墙
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
