/**
 * 登录/注册弹窗
 * 风格沿用 Floo 暗黑魔法主题
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUserStore } from '@/core/store/userStore'

interface AuthModalProps {
  onSuccess: () => void
  onClose: () => void
}

export function AuthModal({ onSuccess, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, register, loading, error, clearError } = useUserStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const ok = mode === 'login'
      ? await login(email, password)
      : await register(email, password)
    if (ok) onSuccess()
  }

  const switchMode = () => {
    clearError()
    setMode((m) => (m === 'login' ? 'register' : 'login'))
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        className="relative w-full max-w-sm mx-4 rounded-xl border border-floo-text-muted/20 bg-floo-bg-secondary p-8 shadow-2xl"
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ duration: 0.25 }}
      >
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-floo-text-muted hover:text-floo-text-primary transition-colors"
          aria-label="关闭"
        >
          ✕
        </button>

        {/* 标题 */}
        <h2 className="font-heading text-2xl text-floo-text-primary mb-1 text-center">
          {mode === 'login' ? '登入 Floo 网络' : '加入 Floo 网络'}
        </h2>
        <p className="text-xs text-floo-text-muted text-center mb-6">
          {mode === 'login' ? '登录后游戏进度将同步至云端' : '注册后可跨设备保存进度'}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs text-floo-text-muted mb-1" htmlFor="auth-email">
              邮箱
            </label>
            <input
              id="auth-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-floo-text-muted/30 bg-floo-bg-primary px-3 py-2 text-sm text-floo-text-primary placeholder:text-floo-text-muted/50 focus:outline-none focus:border-floo-accent-green transition-colors"
              placeholder="owl@hogwarts.edu"
            />
          </div>

          <div>
            <label className="block text-xs text-floo-text-muted mb-1" htmlFor="auth-password">
              密码
            </label>
            <input
              id="auth-password"
              type="password"
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-floo-text-muted/30 bg-floo-bg-primary px-3 py-2 text-sm text-floo-text-primary placeholder:text-floo-text-muted/50 focus:outline-none focus:border-floo-accent-green transition-colors"
              placeholder={mode === 'register' ? '至少 6 位' : ''}
            />
          </div>

          {/* 错误提示 */}
          <AnimatePresence>
            {error && (
              <motion.p
                className="text-xs text-red-400 text-center -mt-1"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading}
            className="mt-1 rounded-lg bg-floo-accent-green px-4 py-2 text-sm font-ui font-medium text-floo-bg-primary transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? '请稍候…' : mode === 'login' ? '登录' : '注册'}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-floo-text-muted">
          {mode === 'login' ? '还没有账号？' : '已有账号？'}
          <button
            onClick={switchMode}
            className="ml-1 text-floo-accent-green hover:underline"
          >
            {mode === 'login' ? '立即注册' : '返回登录'}
          </button>
        </p>

        <p className="mt-3 text-center text-xs text-floo-text-muted/50">
          不登录也可以游玩，进度仅存本设备
        </p>
      </motion.div>
    </div>
  )
}
