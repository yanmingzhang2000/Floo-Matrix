/**
 * 全局魔袋状态管理
 * 管理跨游戏共享的道具背包
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { InventoryItem } from '@/core/types/story'

interface InventoryState {
  items: InventoryItem[]
  addItem: (item: InventoryItem) => void
  removeItem: (itemId: string) => void
  hasItem: (itemId: string) => boolean
  clearAll: () => void
}

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        if (get().hasItem(item.id)) return
        set((state) => ({ items: [...state.items, item] }))
      },

      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        }))
      },

      hasItem: (itemId) => {
        return get().items.some((item) => item.id === itemId)
      },

      clearAll: () => set({ items: [] }),
    }),
    {
      name: 'floo-inventory',
    }
  )
)
