/**
 * Floo Powder 撒粉动效组件
 * 从点击位置向壁炉抛撒绿色粉末颗粒，用抛物线轨迹模拟重力
 */
import { motion } from 'framer-motion'
import { useMemo } from 'react'

interface PowderParticle {
  id: number
  x: number // 起始X（相对容器）
  y: number // 起始Y
  targetX: number // 目标X
  targetY: number // 目标Y
  duration: number // 飞行时长（0.4-0.7s）
  delay: number // 发射延迟（0-0.15s）
  size: number // 粒子大小
  rotation: number // 旋转角度
}

interface PowderTossProps {
  startX: number // 点击位置X（屏幕坐标）
  startY: number // 点击位置Y
  targetX: number // 壁炉中心X
  targetY: number // 壁炉中心Y
  onComplete?: () => void // 粉末落地回调
}

export function PowderToss({ startX, startY, targetX, targetY, onComplete }: PowderTossProps) {
  const particles = useMemo<PowderParticle[]>(() => {
    return Array.from({ length: 12 }, (_, i) => {
      // 从起点到目标点的散射锥
      const spread = (Math.random() - 0.5) * 60 // 横向散开±30px
      const heightVar = Math.random() * 40 // 纵向随机±40px
      
      return {
        id: i,
        x: startX,
        y: startY,
        targetX: targetX + spread,
        targetY: targetY + heightVar,
        duration: 0.5 + Math.random() * 0.2, // 0.5-0.7s
        delay: i * 0.012, // 12ms stagger
        size: 6 + Math.random() * 6, // 6-12px
        rotation: Math.random() * 360,
      }
    })
  }, [startX, startY, targetX, targetY])

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((p, index) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            background: 'radial-gradient(circle, var(--color-floo-accent-green), var(--color-floo-accent-green-dark))',
            boxShadow: '0 0 8px rgba(200, 147, 74, 0.8)',
            filter: 'blur(1px)',
            rotate: p.rotation,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            x: p.targetX - p.x,
            y: [0, -80, p.targetY - p.y], // 抛物线：先上升再下落
            scale: [1, 1.2, 0.8],
            opacity: [1, 1, 0],
            rotate: p.rotation + 180,
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: [0.45, 0.05, 0.55, 0.95], // 重力曲线
          }}
          onAnimationComplete={() => {
            // 最后一个粒子落地时触发回调
            if (index === particles.length - 1 && onComplete) {
              onComplete()
            }
          }}
        />
      ))}
    </div>
  )
}

