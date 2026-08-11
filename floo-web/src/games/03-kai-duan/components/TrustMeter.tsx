/**
 * 信任度指示器
 * 显示与其他角色的信任度
 */
import { motion } from 'framer-motion'

interface TrustMeterProps {
  trustLevel: number
  label?: string
}

export function TrustMeter({ trustLevel, label = '信任度' }: TrustMeterProps) {
  const getColor = (level: number) => {
    if (level >= 80) return 'text-floo-accent-green'
    if (level >= 50) return 'text-floo-accent-gold'
    return 'text-red-400'
  }

  return (
    <motion.div
      className="fixed top-4 right-4 z-30 flex items-center gap-2 bg-floo-bg-secondary/80 backdrop-blur-sm border border-floo-text-muted/20 rounded-lg px-4 py-2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <span className="text-floo-text-muted text-xs font-ui">{label}</span>
      <span className={`font-heading text-lg ${getColor(trustLevel)}`}>
        {trustLevel}%
      </span>
    </motion.div>
  )
}
