/**
 * 大厅全局状态管理
 * 管理壁炉解锁状态、玩家整体进度
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { FireplaceConfig } from '@/core/types/story'

interface HubState {
  fireplaces: FireplaceConfig[]
  /** 剧情标记（用于跨游戏彩蛋、隐藏剧情判断） */
  flags: Record<string, boolean>
  /** 全局变量（用于数值型条件判断） */
  variables: Record<string, string | number | boolean>

  registerFireplace: (config: FireplaceConfig) => void
  unlockFireplace: (gameId: string) => void
  completeFireplace: (gameId: string) => void
  setFlag: (key: string, value: boolean) => void
  setVariable: (key: string, value: string | number | boolean) => void
}

export const useHubStore = create<HubState>()(
  persist(
    (set) => ({
      fireplaces: [],
      flags: {},
      variables: {},

      registerFireplace: (config) => {
        set((state) => {
          if (state.fireplaces.some((f) => f.gameId === config.gameId)) {
            return state
          }
          return { fireplaces: [...state.fireplaces, config] }
        })
      },

      unlockFireplace: (gameId) => {
        set((state) => ({
          fireplaces: state.fireplaces.map((f) =>
            f.gameId === gameId ? { ...f, unlocked: true } : f
          ),
        }))
      },

      completeFireplace: (gameId) => {
        set((state) => ({
          fireplaces: state.fireplaces.map((f) =>
            f.gameId === gameId ? { ...f, completed: true } : f
          ),
        }))
      },

      setFlag: (key, value) => {
        set((state) => ({ flags: { ...state.flags, [key]: value } }))
      },

      setVariable: (key, value) => {
        set((state) => ({ variables: { ...state.variables, [key]: value } }))
      },
    }),
    {
      name: 'floo-hub',
    }
  )
)
