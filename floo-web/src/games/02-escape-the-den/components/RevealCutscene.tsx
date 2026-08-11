/**
 * 终局揭示过场组件
 * 用于 reveal 场景下的 cutscene 节点：文字从模糊到清晰浮现，
 * 关键揭秘句（内容中最后一段）单独放大高亮，制造"真相时刻"的仪式感
 */
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'

interface RevealCutsceneProps {
  content: string
  onAdvance: () => void
}

export function RevealCutscene({ content, onAdvance }: RevealCutsceneProps) {
  const paragraphs = useMemo(() => content.split('\n\n').filter(Boolean), [content])
  const bodyParagraphs = paragraphs.slice(0, -1)
  const revealLine = paragraphs[paragraphs.length - 1]
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(false)
    const timer = setTimeout(() => setReady(true), 400)
    return () => clearTimeout(timer)
  }, [content])

  return (
    <motion.div
      className="max-w-2xl w-full px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="space-y-4 mb-6">
        {bodyParagraphs.map((paragraph, index) => (
          <motion.p
            key={index}
            className="font-body text-floo-text-primary/90 leading-relaxed whitespace-pre-wrap"
            initial={{ opacity: 0, filter: 'blur(8px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1, delay: 0.3 + index * 0.5 }}
          >
            {paragraph}
          </motion.p>
        ))}
      </div>

      {revealLine && (
        <motion.p
          className="font-heading text-floo-accent-gold text-lg sm:text-xl leading-relaxed text-center py-4 whitespace-pre-wrap"
          initial={{ opacity: 0, scale: 0.92, filter: 'blur(12px)' }}
          animate={
            ready
              ? { opacity: 1, scale: 1, filter: 'blur(0px)' }
              : { opacity: 0, scale: 0.92, filter: 'blur(12px)' }
          }
          transition={{ duration: 1.2, delay: 0.4 + bodyParagraphs.length * 0.5, ease: 'easeOut' }}
        >
          {revealLine}
        </motion.p>
      )}

      <motion.button
        type="button"
        onClick={onAdvance}
        className="mt-6 w-full px-6 py-3 rounded-lg border border-floo-accent-gold/40 bg-floo-bg-secondary text-floo-text-primary font-ui hover:bg-floo-accent-gold/10 hover:border-floo-accent-gold/60 transition-colors"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 + bodyParagraphs.length * 0.5 }}
      >
        继续 →
      </motion.button>
    </motion.div>
  )
}
