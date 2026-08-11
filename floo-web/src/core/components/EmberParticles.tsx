/**
 * 余烬粒子组件
 * 从炉腔底部持续发射飘浮上升的绿色火星，增强火焰动态感
 */
import { motion } from 'framer-motion'
import { useMemo } from 'react'

interface EmberParticle {
  id: number
  x: number // 起始X偏移（相对容器中心，-50~50）
  y: number // 起始Y偏移
  size: number // 粒子大小（4-10px）
  duration: number // 上升动画时长（2-4s）
  delay: number // 发射延迟（0-2s）
  drift: number // 水平漂移距离（-20~20px）
  opacity: number // 起始透明度（0.6-1）
}

interface EmberParticlesProps {
  count?: number // 粒子数量（默认25）
  intensity?: number // 强度倍数（悬停时可加到1.5）
}

export function EmberParticles({ count = 25, intensity = 1 }: EmberParticlesProps) {
  const particles = useMemo<EmberParticle[]>(() => {
    return Array.from({ length: Math.floor(count * intensity) }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 80, // -40 ~ 40px
      y: Math.random() * 20, // 0-20px（从炉底稍上方发射）
      size: 4 + Math.random() * 6, // 4-10px
      duration: 2.5 + Math.random() * 1.5, // 2.5-4s
      delay: Math.random() * 2, // 0-2s stagger
      drift: (Math.random() - 0.5) * 40, // -20 ~ 20px 水平漂移
      opacity: 0.6 + Math.random() * 0.4, // 0.6-1.0
    }))
  }, [count, intensity])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `calc(50% + ${p.x}px)`,
            bottom: `${p.y}px`,
            width: p.size,
            height: p.size,
            background: 'radial-gradient(circle, var(--color-floo-accent-green), transparent)',
            filter: 'blur(2px)',
          }}
          animate={{
            y: [-20, -120 - Math.random() * 40], // 上升120-160px
            x: [0, p.drift],
            opacity: [p.opacity, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  )
}
