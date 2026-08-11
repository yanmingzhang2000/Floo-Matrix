/**
 * 单个壁炉传送门组件
 * 代表大厅中的一个游戏入口，带火焰悬停动效
 */
import { motion } from 'framer-motion'
import type { FireplaceConfig } from '@/core/types/story'

interface FireplacePortalProps {
  config: FireplaceConfig
  onEnter: (gameId: string) => void
}

export function FireplacePortal({ config, onEnter }: FireplacePortalProps) {
  const { gameId, title, subtitle, unlocked, completed } = config

  return (
    <motion.button
      type="button"
      disabled={!unlocked}
      onClick={() => unlocked && onEnter(gameId)}
      className={[
        'relative flex flex-col items-center justify-end',
        'w-56 h-72 rounded-t-3xl rounded-b-md',
        'border-2 transition-colors duration-300',
        unlocked
          ? 'border-floo-accent-green/40 bg-floo-bg-secondary cursor-pointer'
          : 'border-floo-text-muted/20 bg-floo-bg-secondary/50 cursor-not-allowed opacity-50',
      ].join(' ')}
      whileHover={unlocked ? { scale: 1.05, y: -6 } : undefined}
      whileTap={unlocked ? { scale: 0.97 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* 火焰效果层 */}
      {unlocked && (
        <motion.div
          className="absolute bottom-6 w-16 h-24 rounded-full blur-md"
          style={{
            background:
              'radial-gradient(circle, var(--color-floo-accent-green) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.6, 0.9, 0.6],
          }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* 完成标记 */}
      {completed && (
        <div className="absolute top-3 right-3 text-floo-accent-gold text-xs font-ui">
          ✓ 已通关
        </div>
      )}

      <div className="relative z-10 px-4 pb-6 text-center">
        <h3 className="font-heading text-lg text-floo-text-primary mb-1">{title}</h3>
        <p className="font-ui text-xs text-floo-text-muted">{subtitle}</p>
        {!unlocked && (
          <p className="font-ui text-xs text-floo-text-muted mt-2">🔒 未解锁</p>
        )}
      </div>
    </motion.button>
  )
}
