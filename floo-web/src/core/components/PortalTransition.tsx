/**
 * 传送门转场动画（重度版 - 四阶段序列）
 * 阶段1：撒粉 → 阶段2：点燃 → 阶段3：吞噬 → 阶段4：淡出
 */
import { motion } from 'framer-motion'
import { useEffect, useState, useMemo } from 'react'
import { PowderToss } from './PowderToss'
import { audioManager } from '@/core/engine/audioManager'

interface PortalTransitionProps {
  active: boolean
  fireplaceX: number // 壁炉中心X坐标
  fireplaceY: number // 壁炉中心Y坐标
  clickX: number // 点击位置X
  clickY: number // 点击位置Y
  onComplete?: () => void
}

type Stage = 'powder' | 'ignite' | 'consume' | 'fadeout'

export function PortalTransition({
  active,
  fireplaceX,
  fireplaceY,
  clickX,
  clickY,
  onComplete,
}: PortalTransitionProps) {
  const [stage, setStage] = useState<Stage>('powder')
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // 余烬粒子爆发用（阶段3）
  const emberParticles = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        angle: (Math.PI * 2 * i) / 60,
        distance: 200 + Math.random() * 400,
        size: 4 + Math.random() * 8,
        duration: 1.0 + Math.random() * 0.5,
        delay: Math.random() * 0.3,
      })),
    []
  )

  useEffect(() => {
    if (!active) return

    // 注册音效
    audioManager.registerPortalSounds()

    if (prefersReducedMotion) {
      // 降级模式：直接跳到淡出
      setTimeout(() => onComplete?.(), 800)
      return
    }

    // 阶段时序控制
    const timers: ReturnType<typeof setTimeout>[] = []

    // 阶段1：撒粉（0-0.6s）
    audioManager.play('powder-toss')
    
    timers.push(
      setTimeout(() => {
        // 阶段2：点燃（0.6-1.8s）
        setStage('ignite')
        audioManager.play('fire-ignite')
      }, 600)
    )

    timers.push(
      setTimeout(() => {
        // 阶段3：吞噬（1.8-3.6s）
        setStage('consume')
        audioManager.play('portal-whoosh')
      }, 1800)
    )

    timers.push(
      setTimeout(() => {
        // 阶段4：淡出（3.6-4.2s）
        setStage('fadeout')
      }, 3600)
    )

    timers.push(
      setTimeout(() => {
        onComplete?.()
      }, 4200)
    )

    return () => timers.forEach(clearTimeout)
  }, [active, onComplete, prefersReducedMotion])

  if (!active) return null

  // 降级模式：简单淡入淡出
  if (prefersReducedMotion) {
    return (
      <motion.div
        className="fixed inset-0 z-50 bg-floo-bg-primary"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      />
    )
  }

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* 阶段1：撒粉 */}
      {stage === 'powder' && (
        <PowderToss
          startX={clickX}
          startY={clickY}
          targetX={fireplaceX}
          targetY={fireplaceY}
          onComplete={() => {}} // 时序由 useEffect 控制
        />
      )}

      {/* 阶段2：点燃（火焰在壁炉位置爆发） */}
      {(stage === 'ignite' || stage === 'consume' || stage === 'fadeout') && (
        <motion.div
          className="fixed inset-0 bg-floo-bg-primary"
          initial={{ opacity: 0 }}
          animate={{ opacity: stage === 'ignite' ? 1 : 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* 火焰爆发中心 */}
          <motion.div
            className="absolute rounded-full"
            style={{
              left: fireplaceX,
              top: fireplaceY,
              x: '-50%',
              y: '-50%',
              width: 200,
              height: 200,
              background: 'radial-gradient(circle, #2ecc71 0%, #27ae60 40%, transparent 70%)',
              filter: 'blur(20px)',
            }}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{
              scale: stage === 'ignite' ? [0.5, 2, 1.5] : stage === 'consume' ? [1.5, 6] : [6, 8],
              opacity: stage === 'ignite' ? [0, 1, 0.9] : stage === 'consume' ? [0.9, 0.7] : [0.7, 0],
            }}
            transition={{
              duration: stage === 'ignite' ? 1.2 : stage === 'consume' ? 1.8 : 0.6,
              ease: stage === 'ignite' ? [0.22, 1, 0.36, 1] : 'easeOut',
            }}
          />

          {/* 镜头推近效果（阶段2-3） */}
          {(stage === 'ignite' || stage === 'consume') && (
            <motion.div
              className="fixed inset-0"
              initial={{ scale: 1 }}
              animate={{ scale: stage === 'consume' ? 1.08 : 1.03 }}
              transition={{ duration: stage === 'consume' ? 1.8 : 1.2, ease: 'easeInOut' }}
            />
          )}
        </motion.div>
      )}

      {/* 阶段3：余烬粒子向外爆发吞噬全屏 */}
      {(stage === 'consume' || stage === 'fadeout') && (
        <div className="fixed inset-0">
          {emberParticles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full"
              style={{
                left: fireplaceX,
                top: fireplaceY,
                width: p.size,
                height: p.size,
                background: 'radial-gradient(circle, #2ecc71, #27ae60)',
                boxShadow: '0 0 8px rgba(46, 204, 113, 0.8)',
                filter: 'blur(2px)',
              }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{
                x: Math.cos(p.angle) * p.distance,
                y: Math.sin(p.angle) * p.distance,
                opacity: stage === 'fadeout' ? 0 : [1, 0.6, 0],
                scale: [1, 1.2, 0.8],
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
          ))}

          {/* 径向模糊遮罩（营造"被卷入"感） */}
          <motion.div
            className="fixed inset-0"
            style={{
              background: `radial-gradient(circle at ${fireplaceX}px ${fireplaceY}px, transparent 0%, rgba(10, 14, 20, 0.6) 40%, #0a0e14 80%)`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: stage === 'fadeout' ? 1 : [0, 0.9] }}
            transition={{ duration: stage === 'fadeout' ? 0.6 : 1.4 }}
          />
        </div>
      )}
    </div>
  )
}

