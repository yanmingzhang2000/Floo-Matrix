/**
 * Toast 通知状态管理
 * 用于显示信任度变化等实时通知
 */
import { create } from 'zustand'

export interface Toast {
  id: string
  characterName: string
  delta: number
  newAffinity: number
  timestamp: number
}

interface ToastState {
  toasts: Toast[]
  addToast: (characterName: string, delta: number, newAffinity: number) => void
  removeToast: (id: string) => void
}

export const useToastStore = create<ToastState>()((set) => ({
  toasts: [],

  addToast: (characterName, delta, newAffinity) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const toast: Toast = { id, characterName, delta, newAffinity, timestamp: Date.now() }
    set((state) => ({ toasts: [...state.toasts, toast] }))

    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
    }, 3000)
  },

  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
  },
}))
