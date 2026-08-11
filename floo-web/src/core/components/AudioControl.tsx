/**
 * 全局音量控制按钮
 * 固定在右上角，支持静音切换和音量调节
 */
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useAudioStore } from '@/core/store/audioStore'
import { audioManager } from '@/core/engine/audioManager'

export function AudioControl() {
  const { muted, volume, toggleMuted, setVolume } = useAudioStore()
  const [showSlider, setShowSlider] = useState(false)

  // 音量/静音状态变化时同步到 audioManager
  useEffect(() => {
    audioManager.setMuted(muted)
  }, [muted])

  useEffect(() => {
    audioManager.setVolume(volume)
  }, [volume])

  return (
    <div
      className="fixed top-4 right-4 z-[60] flex items-center gap-2"
      onMouseEnter={() => setShowSlider(true)}
      onMouseLeave={() => setShowSlider(false)}
    >
      <AnimatePresence>
        {showSlider && !muted && (
          <motion.input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-24 accent-floo-accent-green cursor-pointer"
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 96 }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={toggleMuted}
        aria-label={muted ? '取消静音' : '静音'}
        className="w-10 h-10 rounded-full bg-floo-bg-secondary/80 border border-floo-text-muted/30 flex items-center justify-center text-floo-text-primary backdrop-blur-sm"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
      >
        {muted ? (
          <VolumeOffIcon />
        ) : volume > 0.5 ? (
          <VolumeHighIcon />
        ) : (
          <VolumeLowIcon />
        )}
      </motion.button>
    </div>
  )
}

function VolumeHighIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  )
}

function VolumeLowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  )
}

function VolumeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  )
}
