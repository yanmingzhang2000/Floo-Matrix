/**
 * 音频设置全局状态管理
 * 管理静音状态和音量大小，持久化到本地
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AudioState {
  muted: boolean
  /** 音量范围 0-1 */
  volume: number

  toggleMuted: () => void
  setVolume: (volume: number) => void
}

export const useAudioStore = create<AudioState>()(
  persist(
    (set) => ({
      muted: false,
      volume: 0.7,

      toggleMuted: () => {
        set((state) => ({ muted: !state.muted }))
      },

      setVolume: (volume) => {
        set({ volume: Math.max(0, Math.min(1, volume)) })
      },
    }),
    {
      name: 'floo-audio',
    }
  )
)
