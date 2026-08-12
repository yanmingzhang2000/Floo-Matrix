/**
 * 游戏引导组件
 * 分步展示核心玩法，支持跳过/上一步/下一步
 */
import { useState } from 'react'
import { motion } from 'framer-motion'

export interface TutorialStep {
  title: string
  content: string
  icon?: string
}

interface GameTutorialProps {
  steps: TutorialStep[]
  storageKey: string
  onComplete: () => void
}

export function GameTutorial({ steps, storageKey, onComplete }: GameTutorialProps) {
  const [current, setCurrent] = useState(0)
  const isLast = current === steps.length - 1

  const handleSkip = () => {
    localStorage.setItem(storageKey, '1')
    onComplete()
  }

  const handleNext = () => {
    if (isLast) {
      localStorage.setItem(storageKey, '1')
      onComplete()
    } else {
      setCurrent((c) => c + 1)
    }
  }

  const handlePrev = () => {
    if (current > 0) setCurrent((c) => c - 1)
  }

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-center justify-center px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* 遮罩 */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* 卡片 */}
      <motion.div
        className="relative z-10 w-full max-w-md bg-floo-bg-secondary border border-floo-accent-green/20 rounded-2xl p-8 shadow-2xl"
        key={current}
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.97 }}
        transition={{ duration: 0.3 }}
      >
        {/* 跳过按钮 */}
        <button
          type="button"
          onClick={handleSkip}
          className="absolute top-4 right-4 text-floo-text-muted text-xs font-ui hover:text-floo-text-primary transition-colors"
        >
          跳过
        </button>

        {/* 步骤图标 */}
        {steps[current].icon && (
          <div className="text-4xl mb-4 text-center">{steps[current].icon}</div>
        )}

        {/* 标题 */}
        <h2 className="font-heading text-floo-accent-green text-xl tracking-wider text-center mb-3">
          {steps[current].title}
        </h2>

        {/* 内容 */}
        <p className="font-body text-floo-text-primary text-sm leading-relaxed text-center mb-8">
          {steps[current].content}
        </p>

        {/* 圆点指示器 */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {steps.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === current
                  ? 'bg-floo-accent-green w-5'
                  : 'bg-floo-text-muted/30 hover:bg-floo-text-muted/50'
              }`}
            />
          ))}
        </div>

        {/* 导航按钮 */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrev}
            disabled={current === 0}
            className="px-4 py-2 rounded-lg text-sm font-ui text-floo-text-muted hover:text-floo-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            上一步
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-2.5 rounded-lg bg-floo-accent-green/20 border border-floo-accent-green text-floo-text-primary text-sm font-ui hover:bg-floo-accent-green/30 transition-colors"
          >
            {isLast ? '开始游戏' : '下一步'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
