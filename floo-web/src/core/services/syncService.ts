/**
 * 进度同步服务
 *
 * upload(): 把三个 store 的当前状态推送到云端
 * download(): 从云端拉取进度并写入三个 store
 *
 * 合并策略（download）：
 * - fireplaces: 以云端为准（覆盖本地），保留本地有但云端没有的壁炉注册信息
 * - inventory: 以云端为准（覆盖本地）
 * - flags/variables: 以云端为准（覆盖本地）
 * - gameState: 以云端为准（覆盖本地）
 */
import { progressApi } from '@/core/api/apiClient'
import { useHubStore } from '@/core/store/hubStore'
import { useInventoryStore } from '@/core/store/inventoryStore'
import { useGameStore } from '@/core/store/gameStore'
import type { FireplaceConfig, InventoryItem, GameStatus } from '@/core/types/story'

export async function uploadProgress(): Promise<void> {
  const hub = useHubStore.getState()
  const inventory = useInventoryStore.getState()
  const game = useGameStore.getState()

  await progressApi.put({
    fireplaces: hub.fireplaces,
    inventory: inventory.items,
    flags: hub.flags,
    variables: hub.variables,
    gameState: {
      gameId: game.gameId,
      currentNodeId: game.currentNodeId,
      status: game.status,
      history: game.history,
    },
  })
}

export async function downloadProgress(): Promise<void> {
  const { data } = await progressApi.get()

  if (!data.updatedAt) {
    // 新用户，云端无数据，直接上传本地数据初始化
    await uploadProgress()
    return
  }

  const hubStore = useHubStore.getState()

  // fireplaces 合并：云端数据为主，保留本地已注册但云端没有的壁炉（不丢注册）
  const cloudFireplaces = data.fireplaces as FireplaceConfig[]
  const localOnly = hubStore.fireplaces.filter(
    (lf) => !cloudFireplaces.some((cf) => cf.gameId === lf.gameId)
  )
  const mergedFireplaces = [...cloudFireplaces, ...localOnly]

  // 写入 hubStore
  useHubStore.setState({
    fireplaces: mergedFireplaces,
    flags: data.flags,
    variables: data.variables,
  })

  // 写入 inventoryStore
  useInventoryStore.setState({ items: data.inventory as InventoryItem[] })

  // 写入 gameStore（仅在没有进行中的游戏时恢复）
  const currentStatus = useGameStore.getState().status
  if (currentStatus === 'idle') {
    const gs = data.gameState as {
      gameId?: string | null
      currentNodeId?: string | null
      status?: GameStatus
      history?: string[]
    }
    if (gs.gameId && gs.currentNodeId) {
      useGameStore.setState({
        gameId: gs.gameId,
        currentNodeId: gs.currentNodeId,
        status: gs.status ?? 'playing',
        history: gs.history ?? [],
      })
    }
  }
}
