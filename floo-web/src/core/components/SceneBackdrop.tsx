/**
 * 场景背景层
 * 根据当前剧本节点的 scene 字段驱动背景色调与暗角强度切换
 * 基础版：静态渐变 + vignette，不做鼠标跟随光斑（后续可迭代）
 */
import { motion, AnimatePresence } from 'framer-motion'
import type { SceneId } from '@/core/types/story'

interface SceneBackdropProps {
  scene?: SceneId
  tensionLevel?: number
}

const SCENE_STYLES: Record<SceneId, { gradient: string; vignette: string }> = {
  basement: {
    gradient: 'radial-gradient(circle at 50% 30%, #1c2b28 0%, #0a0e14 70%)',
    vignette: 'rgba(0, 0, 0, 0.75)',
  },
  forest: {
    gradient: 'radial-gradient(circle at 50% 40%, #0f1a14 0%, #05070a 75%)',
    vignette: 'rgba(0, 0, 0, 0.7)',
  },
  cabin: {
    gradient: 'radial-gradient(circle at 50% 35%, #2b2013 0%, #0a0e14 75%)',
    vignette: 'rgba(10, 5, 0, 0.6)',
  },
  station: {
    gradient: 'radial-gradient(circle at 50% 20%, #2a2d33 0%, #0a0e14 80%)',
    vignette: 'rgba(0, 0, 0, 0.5)',
  },
  reveal: {
    gradient: 'radial-gradient(circle at 50% 30%, #1a0f0f 0%, #050505 70%)',
    vignette: 'rgba(0, 0, 0, 0.8)',
  },
}

export function SceneBackdrop({ scene, tensionLevel = 0 }: SceneBackdropProps) {
  const style = scene ? SCENE_STYLES[scene] : null

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={scene}
        className="fixed inset-0 -z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.2, ease: 'easeInOut' }}
        style={{
          background: style?.gradient ?? '#0a0e14',
        }}
      >
        {/* Vignette 暗角层，紧张度越高暗角越重 */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle, transparent 20%, ${style?.vignette ?? 'rgba(0,0,0,0.6)'} 100%)`,
            opacity: 0.5 + tensionLevel * 0.15,
          }}
        />
      </motion.div>
    </AnimatePresence>
  )
}
