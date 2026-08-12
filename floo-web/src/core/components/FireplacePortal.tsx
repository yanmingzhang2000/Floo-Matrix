/**
 * 单个壁炉传送门组件（重度版）
 * 石砌拱形壁炉 + 分层火焰 + 余烬粒子
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
    hoverGlow: `0 0 32px rgba(${rgb}, 0.4), inset 0 0 24px rgba(${rgb}, 0.1)`,
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
        'relative flex flex-col items-center justify-end',
        'w-64 h-80',
        unlocked ? 'cursor-pointer' : 'cursor-not-allowed opacity-50',
      ].join(' ')}
      whileHover={unlocked ? { scale: 1.03, y: -8 } : undefined}
      whileTap={unlocked ? { scale: 0.98 } : undefined}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
    >
      {/* 石砌壁炉外框 */}
      <div className="absolute inset-0 flex flex-col">
        {/* 拱顶 */}
        <div
          className="h-1/3 rounded-t-[120px] border-2 border-floo-text-muted/30"
          style={{
            background: `
              linear-gradient(135deg, #2a2f39 0%, #1a1f29 50%, #121821 100%),
              repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(127, 140, 141, 0.05) 20px, rgba(127, 140, 141, 0.05) 22px)
            `,
            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.6), 0 4px 12px rgba(0,0,0,0.4)',
          }}
        />
        
        {/* 炉腔（内凹） */}
        <div
          className="flex-1 border-x-2 border-floo-text-muted/30 relative overflow-hidden"
          style={{
            background: 'linear-gradient(to bottom, #0e0c09 0%, #080605 100%)',
            boxShadow: 'inset 0 8px 16px rgba(0,0,0,0.9), inset 0 -4px 8px rgba(0,0,0,0.6)',
          }}
        >
          {/* 火焰多层叠加（如果解锁） */}
          {unlocked && (
            <>
              {/* 底层：大范围模糊光晕（地基） */}
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
                  filter: 'blur(8px)',
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

              {/* 顶层：火焰尖端（更亮更小） */}
              <motion.div
                className="absolute bottom-16 left-1/2 -translate-x-1/2 w-12 h-20 rounded-t-full"
                style={{
                  background: colors.tip,
                  filter: 'blur(4px)',
                }}
                animate={{
                  y: isHovered ? [-5, -15, -8] : [-2, -8, -3],
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

              {/* 余烬粒子系统 */}
              <EmberParticles count={25} intensity={isHovered ? 1.5 : 1} color={flameColor} />
            </>
          )}
        </div>

        {/* 炉台底座 */}
        <div
          className="h-8 border-2 border-t-0 border-floo-text-muted/30 rounded-b"
          style={{
            background: 'linear-gradient(to bottom, #1a1610 0%, #0e0c09 100%)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.6)',
          }}
        />
      </div>

      {/* 完成标记 */}
      {completed && (
        <div className="absolute top-3 right-3 text-floo-accent-gold text-xs font-ui z-10 bg-floo-bg-primary/80 px-2 py-1 rounded">
          ✓ 已通关
        </div>
      )}

      {/* 悬停发光效果 */}
      {unlocked && isHovered && (
        <motion.div
          className="absolute inset-0 rounded-t-[120px] pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ boxShadow: colors.hoverGlow }}
        />
      )}

      {/* 标题和副标题 */}
      <div className="absolute bottom-12 left-0 right-0 px-4 text-center z-10">
        <motion.h3
          className="font-heading text-lg text-floo-text-primary mb-1 drop-shadow-lg"
          animate={{ textShadow: isHovered && unlocked ? colors.textGlow : '0 0 0px transparent' }}
        >
          {title}
        </motion.h3>
        <p className="font-ui text-xs text-floo-text-muted drop-shadow">{subtitle}</p>
        {!unlocked && (
          <p className="font-ui text-xs text-floo-text-muted mt-2">🔒 未解锁</p>
        )}
      </div>
    </motion.button>
  )
}
