/**
 * 死亡结局仪式感覆层
 * 暗红色扩散遮罩 + 轻微抖动文字，模拟死亡瞬间的眩晕感
 * 遵循可访问性：闪烁频率控制在安全范围内，并尊重 prefers-reduced-motion
 */
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface BadEndingOverlayProps {
  content: string
  onRetry: () => void
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(query.matches)
    const handler = (event: MediaQueryListEvent) => setReduced(event.matches)
    query.addEventListener('change', handler)
    return () => query.removeEventListener('change', handler)
  }, [])

  return reduced
}

export function BadEndingOverlay({ content, onRetry }: BadEndingOverlayProps) {
  const reducedMotion = usePrefersReducedMotion()
  const [displayedText, setDisplayedText] = useState('')

  useEffect(() => {
    setDisplayedText('')
    let index = 0
    const timer = setInterval(() => {
      index += 1
      setDisplayedText(content.slice(0, index))
      if (index >= content.length) clearInterval(timer)
    }, 30)
    return () => clearInterval(timer)
  }, [content])

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* 暗红扩散遮罩层 */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle, rgba(120,10,10,0.55) 0%, rgba(5,0,0,0.95) 75%)',
        }}
        initial={{ scale: 0.3, opacity: 0 }}
        animate={
          reducedMotion
            ? { scale: 1, opacity: 1 }
            : { scale: 1, opacity: [0, 0.4, 1, 0.6, 1] }
        }
        transition={{ duration: reducedMotion ? 0.6 : 1.4, ease: 'easeOut' }}
      />

      <motion.div
        className="relative z-10 max-w-xl text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reducedMotion ? 0.3 : 1.2, duration: 0.6 }}
      >
        <p className="font-heading text-red-400/80 text-xs uppercase tracking-widest mb-4">
          你没有逃出魔窟
        </p>
        <motion.p
          className="font-body text-floo-text-primary leading-relaxed whitespace-pre-wrap"
          animate={
            reducedMotion
              ? undefined
              : { x: [0, -1, 1, -1, 0] }
          }
          transition={{ duration: 0.3, repeat: reducedMotion ? 0 : 3, repeatDelay: 2 }}
        >
          {displayedText}
        </motion.p>

        <motion.button
          type="button"
          onClick={onRetry}
          className="mt-8 px-6 py-3 rounded-lg border border-red-500/50 bg-red-950/40 text-floo-text-primary font-ui hover:bg-red-900/40 hover:border-red-400/70 transition-colors"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reducedMotion ? 0.6 : 2.4 }}
        >
          重新抉择
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
