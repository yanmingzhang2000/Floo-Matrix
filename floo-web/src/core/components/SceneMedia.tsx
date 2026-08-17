/**
 * 场景媒体组件
 * 展示节点配图或视频，支持 image / video 两种类型
 */
import { motion } from 'framer-motion'

interface SceneMediaProps {
  src: string
  type: 'image' | 'video'
  alt?: string
}

export function SceneMedia({ src, type, alt }: SceneMediaProps) {
  return (
    <motion.div
      className="w-full max-w-2xl mb-4 rounded-xl overflow-hidden border border-floo-accent-green/20 bg-floo-bg-secondary"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {type === 'video' ? (
        <video
          src={src}
          autoPlay
          muted
          loop
          playsInline
          className="w-full max-h-[60vh] object-contain"
        />
      ) : (
        <img
          src={src}
          alt={alt ?? ''}
          className="w-full max-h-[60vh] object-contain"
        />
      )}
    </motion.div>
  )
}
