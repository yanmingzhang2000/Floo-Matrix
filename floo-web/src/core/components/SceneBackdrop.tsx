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
    gradient: 'radial-gradient(circle at 50% 30%, #1c1f1a 0%, #0e0c09 70%)',
    vignette: 'rgba(0, 0, 0, 0.75)',
  },
  forest: {
    gradient: 'radial-gradient(circle at 50% 40%, #0f1a14 0%, #080a07 75%)',
    vignette: 'rgba(0, 0, 0, 0.7)',
  },
  cabin: {
    gradient: 'radial-gradient(circle at 50% 35%, #2b2013 0%, #0e0c09 75%)',
    vignette: 'rgba(10, 5, 0, 0.6)',
  },
  station: {
    gradient: 'radial-gradient(circle at 50% 20%, #2a2823 0%, #0e0c09 80%)',
    vignette: 'rgba(0, 0, 0, 0.5)',
  },
  reveal: {
    gradient: 'radial-gradient(circle at 50% 30%, #1a0f0f 0%, #080605 70%)',
    vignette: 'rgba(0, 0, 0, 0.8)',
  },
  bus: {
    gradient: 'radial-gradient(circle at 50% 40%, #1a181e 0%, #0e0c09 75%)',
    vignette: 'rgba(0, 0, 0, 0.65)',
  },
  convention: {
    gradient: 'radial-gradient(circle at 50% 30%, #2d1a2a 0%, #0e0c09 70%)',
    vignette: 'rgba(0, 0, 0, 0.5)',
  },
  police_station: {
    gradient: 'radial-gradient(circle at 50% 25%, #1e2528 0%, #0e0c09 80%)',
    vignette: 'rgba(0, 0, 0, 0.6)',
  },
  factory: {
    gradient: 'radial-gradient(circle at 50% 35%, #2a1f1a 0%, #0e0c09 75%)',
    vignette: 'rgba(0, 0, 0, 0.7)',
  },
  bridge: {
    gradient: 'radial-gradient(circle at 50% 20%, #1a2025 0%, #080a0d 80%)',
    vignette: 'rgba(0, 0, 0, 0.55)',
  },
  courier_station: {
    gradient: 'radial-gradient(circle at 50% 30%, #2a2520 0%, #0e0c09 70%)',
    vignette: 'rgba(0, 0, 0, 0.5)',
  },
  city_street: {
    gradient: 'radial-gradient(circle at 50% 35%, #1a1a1a 0%, #0a0a0a 75%)',
    vignette: 'rgba(0, 0, 0, 0.6)',
  },
  bridge_side: {
    gradient: 'radial-gradient(circle at 50% 20%, #1a2530 0%, #080a0d 80%)',
    vignette: 'rgba(0, 0, 0, 0.55)',
  },
  residential: {
    gradient: 'radial-gradient(circle at 50% 30%, #25201a 0%, #0e0c09 70%)',
    vignette: 'rgba(0, 0, 0, 0.5)',
  },
  apartment: {
    gradient: 'radial-gradient(circle at 50% 35%, #1e1a18 0%, #0e0c09 75%)',
    vignette: 'rgba(0, 0, 0, 0.6)',
  },
  hospital: {
    gradient: 'radial-gradient(circle at 50% 25%, #252830 0%, #0e0c09 80%)',
    vignette: 'rgba(0, 0, 0, 0.5)',
  },
  home_room: {
    gradient: 'radial-gradient(circle at 50% 35%, #2a1a18 0%, #0e0c09 75%)',
    vignette: 'rgba(0, 0, 0, 0.65)',
  },
  street_night: {
    gradient: 'radial-gradient(circle at 50% 20%, #0f1218 0%, #080a0d 80%)',
    vignette: 'rgba(0, 0, 0, 0.7)',
  },
  friend_apartment: {
    gradient: 'radial-gradient(circle at 50% 30%, #201c1a 0%, #0e0c09 75%)',
    vignette: 'rgba(0, 0, 0, 0.55)',
  },
  bus_station: {
    gradient: 'radial-gradient(circle at 50% 25%, #1a1d22 0%, #0e0c09 80%)',
    vignette: 'rgba(0, 0, 0, 0.6)',
  },
  inside_van: {
    gradient: 'radial-gradient(circle at 50% 40%, #15130f 0%, #0a0808 75%)',
    vignette: 'rgba(0, 0, 0, 0.75)',
  },
  meat_factory_room: {
    gradient: 'radial-gradient(circle at 50% 35%, #1a1510 0%, #0e0c09 75%)',
    vignette: 'rgba(0, 0, 0, 0.8)',
  },
  bathroom: {
    gradient: 'radial-gradient(circle at 50% 30%, #1a1e22 0%, #0e0c09 80%)',
    vignette: 'rgba(0, 0, 0, 0.6)',
  },
  corridor: {
    gradient: 'radial-gradient(circle at 50% 30%, #181614 0%, #0a0808 75%)',
    vignette: 'rgba(0, 0, 0, 0.7)',
  },
  street_day: {
    gradient: 'radial-gradient(circle at 50% 25%, #2a2820 0%, #0e0c09 70%)',
    vignette: 'rgba(0, 0, 0, 0.5)',
  },
  neighbor_room: {
    gradient: 'radial-gradient(circle at 50% 35%, #1e1c1a 0%, #0e0c09 75%)',
    vignette: 'rgba(0, 0, 0, 0.55)',
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
          background: style?.gradient ?? '#0e0c09',
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
