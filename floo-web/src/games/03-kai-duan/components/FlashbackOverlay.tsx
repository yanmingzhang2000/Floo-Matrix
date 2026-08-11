/**
 * 回忆过场组件
 * 用于展示五年前的事件回放
 */
import { motion } from 'framer-motion'
import { useState } from 'react'

interface FlashbackOverlayProps {
  content: string
  onAdvance: () => void
}

export function FlashbackOverlay({ content, onAdvance }: FlashbackOverlayProps) {
  const [revealed, setRevealed] = useState(false)

  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-center justify-center px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* 棕褐色滤镜背景 */}
      <div className="absolute inset-0 bg-amber-900/20 backdrop-blur-[1px]" />

      {/* 老旧照片边框效果 */}
      <motion.div
        className="relative z-10 max-w-2xl w-full"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        <div className="bg-floo-bg-secondary/90 border border-amber-800/30 rounded-lg p-8 shadow-2xl">
          {/* 回忆标题 */}
          <motion.div
            className="flex items-center gap-2 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="w-2 h-2 rounded-full bg-amber-600" />
            <span className="font-heading text-amber-600 text-sm tracking-widest uppercase">
              五年前
            </span>
            <div className="flex-1 h-px bg-amber-800/30" />
          </motion.div>

          {/* 内容 - 模糊到清晰 */}
          <motion.div
            className="font-body text-floo-text-primary text-lg leading-relaxed"
            initial={{ filter: 'blur(8px)', opacity: 0 }}
            animate={{ filter: 'blur(0px)', opacity: 1 }}
            transition={{ delay: 0.8, duration: 1.2 }}
            onClick={() => {
              if (!revealed) setRevealed(true)
            }}
          >
            {content.split('\n').map((paragraph, i) => (
              <motion.p
                key={i}
                className={i > 0 ? 'mt-4' : ''}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 + i * 0.3, duration: 0.6 }}
              >
                {paragraph}
              </motion.p>
            ))}
          </motion.div>

          {/* 继续按钮 */}
          {revealed && (
            <motion.button
              type="button"
              onClick={onAdvance}
              className="mt-8 px-6 py-3 rounded-lg border border-floo-accent-gold/40 bg-floo-bg-secondary text-floo-text-primary font-ui hover:bg-floo-accent-gold/10 hover:border-floo-accent-gold/60 transition-colors"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              继续 →
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
