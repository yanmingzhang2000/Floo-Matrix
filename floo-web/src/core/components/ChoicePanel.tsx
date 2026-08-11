/**
 * 选项面板组件
 * 展示当前节点可用的选择分支
 */
import { motion } from 'framer-motion'
import type { Choice } from '@/core/types/story'

interface ChoicePanelProps {
  choices: Choice[]
  onSelect: (choice: Choice) => void
}

export function ChoicePanel({ choices, onSelect }: ChoicePanelProps) {
  return (
    <div className="flex flex-col gap-3 mt-4 max-w-2xl w-full">
      {choices.map((choice, index) => (
        <motion.button
          key={choice.id}
          type="button"
          onClick={() => onSelect(choice)}
          className="text-left px-5 py-3 rounded-lg border border-floo-accent-green/30 bg-floo-bg-secondary hover:bg-floo-accent-green/10 hover:border-floo-accent-green/60 transition-colors font-ui text-floo-text-primary"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.08 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {choice.text}
        </motion.button>
      ))}
    </div>
  )
}
