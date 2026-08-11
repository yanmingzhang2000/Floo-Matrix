/**
 * axios 实例封装
 * - 自动附加 Authorization header
 * - 统一错误格式
 */
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE ?? 'https://floo-ai.duckdns.org:3001'

export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10_000,
})

// 请求拦截：从 localStorage 读 token 注入 header
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('floo-token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ---- 类型化 API 方法 ----

export interface AuthPayload {
  token: string
  user: { id: string; email: string }
}

export interface ProgressPayload {
  fireplaces: unknown[]
  inventory: unknown[]
  flags: Record<string, boolean>
  variables: Record<string, string | number | boolean>
  gameState: Record<string, unknown>
  updatedAt: string | null
}

export const authApi = {
  register: (email: string, password: string) =>
    apiClient.post<AuthPayload>('/api/auth/register', { email, password }),

  login: (email: string, password: string) =>
    apiClient.post<AuthPayload>('/api/auth/login', { email, password }),
}

export const progressApi = {
  get: () => apiClient.get<ProgressPayload>('/api/progress'),

  put: (data: Omit<ProgressPayload, 'updatedAt'>) =>
    apiClient.put<{ ok: boolean; updatedAt: string }>('/api/progress', data),
}
