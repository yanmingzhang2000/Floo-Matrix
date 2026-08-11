/**
 * 当前游戏运行时状态管理
 * 管理正在进行的游戏实例：当前节点、临时道具、存档点
 */
import { create } from 'zustand'
import type { GameStatus } from '@/core/types/story'

interface GameState {
  gameId: string | null
  currentNodeId: string | null
  status: GameStatus
  /** 已经历过的节点历史（用于回退/日志展示） */
  history: string[]

  startGame: (gameId: string, startNodeId: string) => void
  goToNode: (nodeId: string) => void
  completeGame: () => void
  resetGame: () => void
}

export const useGameStore = create<GameState>()((set) => ({
  gameId: null,
  currentNodeId: null,
  status: 'idle',
  history: [],

  startGame: (gameId, startNodeId) => {
    set({
      gameId,
      currentNodeId: startNodeId,
      status: 'playing',
      history: [startNodeId],
    })
  },

  goToNode: (nodeId) => {
    set((state) => ({
      currentNodeId: nodeId,
      history: [...state.history, nodeId],
    }))
  },

  completeGame: () => {
    set({ status: 'completed' })
  },

  resetGame: () => {
    set({ gameId: null, currentNodeId: null, status: 'idle', history: [] })
  },
}))
