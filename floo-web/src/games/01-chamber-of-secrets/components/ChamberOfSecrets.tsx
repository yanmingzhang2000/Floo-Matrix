/**
 * 密室：记忆碎片 - 游戏主视图
 * 负责渲染当前剧本节点（对话/选择/结局）
 */
import { motion } from 'framer-motion'
import storyData from '../story.json'
import { DialogueBox } from '@/core/components/DialogueBox'
import { ChoicePanel } from '@/core/components/ChoicePanel'
import { useStoryEngine } from '@/core/hooks/useStoryEngine'
import type { StoryData } from '@/core/types/story'

interface ChamberOfSecretsProps {
  onExit: () => void
}

export function ChamberOfSecrets({ onExit }: ChamberOfSecretsProps) {
  const { currentNode, availableChoices, selectChoice, advanceNode, canAdvance, isEnding } =
    useStoryEngine(storyData as StoryData)

  if (!currentNode) return null

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-floo-bg-primary">
      <motion.div
        key={currentNode.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center"
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

        {isEnding && (
          <motion.button
            type="button"
            onClick={onExit}
            className="mt-6 px-6 py-3 rounded-lg bg-floo-accent-green/20 border border-floo-accent-green text-floo-text-primary font-ui hover:bg-floo-accent-green/30 transition-colors"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            返回
          </motion.button>
        )}
      </motion.div>
    </div>
  )
}
