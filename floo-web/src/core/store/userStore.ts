/**
 * 用户登录状态管理
 * token 持久化到 localStorage（key: floo-token）
 * user 信息存内存，刷新页面通过 token 恢复
 */
import { create } from 'zustand'
import { authApi } from '@/core/api/apiClient'
import type { AxiosError } from 'axios'

interface User {
  id: string
  email: string
}

interface UserState {
  user: User | null
  /** 是否正在执行登录/注册请求 */
  loading: boolean
  /** 最近一次的错误信息 */
  error: string | null

  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string) => Promise<boolean>
  logout: () => void
  clearError: () => void
  /** 启动时从 localStorage 恢复 token，验证有效性（暂用本地解析，不发请求） */
  restoreSession: () => void
}

function parseTokenPayload(token: string): { userId: string; exp: number } | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload
  } catch {
    return null
  }
}

export const useUserStore = create<UserState>()((set) => ({
  user: null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const { data } = await authApi.login(email, password)
      localStorage.setItem('floo-token', data.token)
      set({ user: data.user, loading: false })
      return true
    } catch (err) {
      const msg =
        (err as AxiosError<{ error: string }>).response?.data?.error ?? '登录失败，请稍后重试'
      set({ error: msg, loading: false })
      return false
    }
  },

  register: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const { data } = await authApi.register(email, password)
      localStorage.setItem('floo-token', data.token)
      set({ user: data.user, loading: false })
      return true
    } catch (err) {
      const msg =
        (err as AxiosError<{ error: string }>).response?.data?.error ?? '注册失败，请稍后重试'
      set({ error: msg, loading: false })
      return false
    }
  },

  logout: () => {
    localStorage.removeItem('floo-token')
    set({ user: null, error: null })
  },

  clearError: () => set({ error: null }),

  restoreSession: () => {
    const token = localStorage.getItem('floo-token')
    if (!token) return

    const payload = parseTokenPayload(token)
    if (!payload) {
      localStorage.removeItem('floo-token')
      return
    }

    // token 已过期
    if (payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('floo-token')
      return
    }

    // token 有效但没有 email（JWT 里只存了 userId），设置一个占位用户
    // 登录后 authApi 会返回完整 user，这里只恢复已登录状态
    set({ user: { id: payload.userId, email: '' } })
  },
}))
