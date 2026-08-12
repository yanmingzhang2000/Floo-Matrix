/**
 * 人物关系状态管理
 * 管理每个游戏中主角与角色的关系：解锁、阵营判断、好感度
 * 按 gameId 独立持久化到 localStorage
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Alignment } from '@/core/types/story'

/** 单个角色的关系状态 */
export interface CharacterRelation {
  /** 是否已认识 */
  met: boolean
  /** 玩家视角的阵营判断 */
  alignment: Alignment
  /** 已揭示的身份描述 */
  unlockedIdentity?: string
  /** 好感度 0-100（可选，仅部分游戏启用） */
  affinity?: number
  /** 好感度标签 */
  affinityLabel?: string
  /** 互动次数 */
  interactCount: number
}

interface RelationshipState {
  /** gameId -> characterId -> relation */
  relations: Record<string, Record<string, CharacterRelation>>

  /** 标记角色已认识 */
  metCharacter: (gameId: string, characterId: string) => void
  /** 设置阵营判断 */
  setAlignment: (gameId: string, characterId: string, alignment: Alignment) => void
  /** 更新好感度 */
  updateAffinity: (gameId: string, characterId: string, delta: number, label?: string) => void
  /** 设置已揭示的身份 */
  setUnlockedIdentity: (gameId: string, characterId: string, identity: string) => void
  /** 获取某游戏已认识的角色数 */
  getMetCount: (gameId: string) => number
  /** 获取某游戏的角色总数 */
  getTotalCount: (gameId: string, totalFromStory: number) => number
  /** 获取某游戏某角色的关系状态 */
  getRelation: (gameId: string, characterId: string) => CharacterRelation
  /** 重置某游戏的关系数据 */
  resetGame: (gameId: string) => void
}

const DEFAULT_RELATION: CharacterRelation = {
  met: false,
  alignment: 'unknown',
  interactCount: 0,
}

export const useRelationshipStore = create<RelationshipState>()(
  persist(
    (set, get) => ({
      relations: {},

      metCharacter: (gameId, characterId) => {
        set((state) => {
          const gameRelations = state.relations[gameId] || {}
          const existing = gameRelations[characterId] || DEFAULT_RELATION
          return {
            relations: {
              ...state.relations,
              [gameId]: {
                ...gameRelations,
                [characterId]: {
                  ...existing,
                  met: true,
                  interactCount: existing.interactCount + 1,
                },
              },
            },
          }
        })
      },

      setAlignment: (gameId, characterId, alignment) => {
        set((state) => {
          const gameRelations = state.relations[gameId] || {}
          const existing = gameRelations[characterId] || DEFAULT_RELATION
          return {
            relations: {
              ...state.relations,
              [gameId]: {
                ...gameRelations,
                [characterId]: { ...existing, alignment },
              },
            },
          }
        })
      },

      updateAffinity: (gameId, characterId, delta, label) => {
        set((state) => {
          const gameRelations = state.relations[gameId] || {}
          const existing = gameRelations[characterId] || DEFAULT_RELATION
          const currentAffinity = existing.affinity ?? 50
          const newAffinity = Math.max(0, Math.min(100, currentAffinity + delta))
          return {
            relations: {
              ...state.relations,
              [gameId]: {
                ...gameRelations,
                [characterId]: {
                  ...existing,
                  affinity: newAffinity,
                  affinityLabel: label ?? existing.affinityLabel,
                },
              },
            },
          }
        })
      },

      setUnlockedIdentity: (gameId, characterId, identity) => {
        set((state) => {
          const gameRelations = state.relations[gameId] || {}
          const existing = gameRelations[characterId] || DEFAULT_RELATION
          return {
            relations: {
              ...state.relations,
              [gameId]: {
                ...gameRelations,
                [characterId]: { ...existing, unlockedIdentity: identity },
              },
            },
          }
        })
      },

      getMetCount: (gameId) => {
        const gameRelations = get().relations[gameId] || {}
        return Object.values(gameRelations).filter((r) => r.met).length
      },

      getTotalCount: (gameId, totalFromStory) => {
        const gameRelations = get().relations[gameId] || {}
        const trackedIds = Object.keys(gameRelations)
        return Math.max(totalFromStory, trackedIds.length)
      },

      getRelation: (gameId, characterId) => {
        const gameRelations = get().relations[gameId] || {}
        return gameRelations[characterId] || { ...DEFAULT_RELATION }
      },

      resetGame: (gameId) => {
        set((state) => {
          const { [gameId]: _, ...rest } = state.relations
          return { relations: rest }
        })
      },
    }),
    {
      name: 'floo-relationship',
    }
  )
)
