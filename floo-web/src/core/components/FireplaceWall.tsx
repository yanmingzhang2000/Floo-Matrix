/**
 * 壁炉墙 - 大厅主视图
 * 网格布局展示所有游戏入口（壁炉）
 */
import { motion } from 'framer-motion'
import { FireplacePortal } from './FireplacePortal'
import type { FireplaceConfig } from '@/core/types/story'

interface FireplaceWallProps {
  fireplaces: FireplaceConfig[]
  onEnterGame: (gameId: string) => void
}

export function FireplaceWall({ fireplaces, onEnterGame }: FireplaceWallProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <motion.h1
        className="font-heading text-4xl md:text-5xl text-floo-text-primary mb-2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        Floo Network
      </motion.h1>
      <motion.p
        className="font-body text-floo-text-muted mb-12 italic"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        选择一座壁炉，踏入未知的时空
      </motion.p>

      <motion.div
        className="flex flex-wrap gap-8 justify-center"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: { staggerChildren: 0.15 },
          },
        }}
      >
        {fireplaces.map((config) => (
          <motion.div
            key={config.gameId}
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            <FireplacePortal config={config} onEnter={onEnterGame} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
