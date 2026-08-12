/**
 * 单个壁炉传送门组件（纯火焰版）
 * 纯净火焰动画 + 标题，无石砌外框
 */
import { motion } from 'framer-motion'
import { useState, useRef, useMemo } from 'react'
import { EmberParticles } from './EmberParticles'
import type { FireplaceConfig } from '@/core/types/story'

interface FireplacePortalProps {
  config: FireplaceConfig
  onEnter: (
    gameId: string,
    clickX: number,
    clickY: number,
    fireplaceX: number,
    fireplaceY: number
  ) => void
}

/** 将 hex 转为 rgb 分量 */
function hexToRgb(hex: string) {
  const h = hex.replace('#', '')
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  }
}

/** 生成火焰各层颜色 */
function flameColors(hex: string) {
  const { r, g, b } = hexToRgb(hex)
  const rgb = `${r}, ${g}, ${b}`
  return {
    glow: `radial-gradient(ellipse 100% 80% at 50% 100%, ${hex} 0%, transparent 60%)`,
    body: `linear-gradient(to top, rgba(${rgb}, 0.6) 0%, ${hex} 50%, rgba(${rgb}, 0.3) 100%)`,
    tip: `radial-gradient(ellipse at 50% 80%, ${hex}, rgba(${rgb}, 0.6), transparent)`,
    baseGlow: `radial-gradient(ellipse at 50% 100%, rgba(${rgb}, 0.25) 0%, transparent 70%)`,
    hoverGlow: `0 0 40px rgba(${rgb}, 0.3), 0 0 80px rgba(${rgb}, 0.15)`,
    textGlow: `0 0 12px rgba(${rgb}, 0.6)`,
  }
}

export function FireplacePortal({ config, onEnter }: FireplacePortalProps) {
  const { gameId, title, subtitle, flameColor = '#c8934a', unlocked, completed } = config
  const [isHovered, setIsHovered] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const colors = useMemo(() => flameColors(flameColor), [flameColor])

  const handleClick = (e: React.MouseEvent) => {
    if (!unlocked) return
    
    const rect = buttonRef.current?.getBoundingClientRect()
    if (!rect) return

    const clickX = e.clientX
    const clickY = e.clientY
    const fireplaceX = rect.left + rect.width / 2
    const fireplaceY = rect.top + rect.height / 2

    onEnter(gameId, clickX, clickY, fireplaceX, fireplaceY)
  }

  return (
    <motion.button
      ref={buttonRef}
      type="button"
      disabled={!unlocked}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={[
        'relative flex flex-col items-center justify-center',
        'w-48 h-64',
        unlocked ? 'cursor-pointer' : 'cursor-not-allowed opacity-40',
      ].join(' ')}
      whileHover={unlocked ? { scale: 1.05, y: -6 } : undefined}
      whileTap={unlocked ? { scale: 0.97 } : undefined}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
    >
      {/* 火焰容器 */}
      <div className="relative w-32 h-40 mb-2">
        {unlocked && (
          <>
            {/* 底部地面反光 */}
            <div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-8 rounded-full blur-xl"
              style={{ background: colors.baseGlow }}
            />

            {/* 底层：大范围模糊光晕 */}
            <motion.div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-40 rounded-full blur-2xl"
              style={{ background: colors.glow }}
              animate={{
                scale: isHovered ? [1, 1.2, 1] : [1, 1.1, 1],
                opacity: isHovered ? [0.7, 0.9, 0.7] : [0.5, 0.7, 0.5],
              }}
              transition={{
                duration: isHovered ? 1.8 : 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* 中层：火焰形状 */}
            <motion.div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-32"
              style={{
                background: colors.body,
                clipPath: 'polygon(50% 0%, 30% 20%, 20% 50%, 35% 80%, 50% 100%, 65% 80%, 80% 50%, 70% 20%)',
                filter: 'blur(6px)',
              }}
              animate={{
                scaleY: isHovered ? [1, 1.25, 1.1] : [1, 1.12, 1],
                scaleX: isHovered ? [1, 0.95, 1] : [1, 0.98, 1],
              }}
              transition={{
                duration: isHovered ? 1.4 : 2.0,
                repeat: Infinity,
                ease: [0.45, 0.05, 0.55, 0.95],
              }}
            />

            {/* 顶层：火焰尖端 */}
            <motion.div
              className="absolute bottom-16 left-1/2 -translate-x-1/2 w-10 h-16 rounded-t-full"
              style={{
                background: colors.tip,
                filter: 'blur(3px)',
              }}
              animate={{
                y: isHovered ? [-4, -12, -6] : [-2, -6, -2],
                opacity: isHovered ? [0.9, 1, 0.9] : [0.7, 0.85, 0.7],
                scaleX: [1, 0.9, 1],
              }}
              transition={{
                duration: isHovered ? 1.2 : 1.8,
                repeat: Infinity,
                ease: 'easeInOut',
                times: [0, 0.5, 1],
              }}
            />

            {/* 余烬粒子 */}
            <EmberParticles count={20} intensity={isHovered ? 1.5 : 1} color={flameColor} />
          </>
        )}

        {/* 未解锁占位 */}
        {!unlocked && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl opacity-30">🔒</span>
          </div>
        )}
      </div>

      {/* 标题区域 */}
      <div className="text-center z-10">
        <motion.h3
          className="font-heading text-base text-floo-text-primary mb-0.5 drop-shadow-lg"
          animate={{ textShadow: isHovered && unlocked ? colors.textGlow : '0 0 0px transparent' }}
        >
          {title}
        </motion.h3>
        <p className="font-ui text-[11px] text-floo-text-muted drop-shadow">{subtitle}</p>
      </div>

      {/* 已通关标签 */}
      {completed && (
        <div className="absolute top-0 right-0 text-floo-accent-gold text-[10px] font-ui z-10 bg-floo-bg-primary/80 px-2 py-0.5 rounded-bl-lg rounded-tr-lg">
          ✓ 已通关
        </div>
      )}

      {/* 悬停发光 */}
      {unlocked && isHovered && (
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ boxShadow: colors.hoverGlow }}
        />
      )}
    </motion.button>
  )
}
