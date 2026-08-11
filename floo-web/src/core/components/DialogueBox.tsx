/**
 * 对话框组件
 * 展示当前剧本节点的文本内容
 */
import { motion } from 'framer-motion'

interface DialogueBoxProps {
  content: string
  speaker?: string
}

export function DialogueBox({ content, speaker }: DialogueBoxProps) {
  return (
    <motion.div
      className="bg-floo-bg-secondary border border-floo-accent-green/20 rounded-xl p-6 max-w-2xl"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {speaker && (
        <p className="font-heading text-floo-accent-gold text-sm mb-2">{speaker}</p>
      )}
      <p className="font-body text-floo-text-primary leading-relaxed whitespace-pre-wrap">
        {content}
      </p>
    </motion.div>
  )
}
