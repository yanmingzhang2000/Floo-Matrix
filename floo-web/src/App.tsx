/**
 * 根路由控制器
 * 负责大厅 Hub 视图与游戏实例 Portal 视图之间的切换
 */
import { useEffect, useState, type ComponentType } from 'react'
import { FireplaceWall } from '@/core/components/FireplaceWall'
import { PortalTransition } from '@/core/components/PortalTransition'
import { useHubStore } from '@/core/store/hubStore'
import { useGameStore } from '@/core/store/gameStore'
import { ChamberOfSecrets } from '@/games/01-chamber-of-secrets/components/ChamberOfSecrets'

const GAME_COMPONENTS: Record<string, ComponentType<{ onExit: () => void }>> = {
  '01-chamber-of-secrets': ChamberOfSecrets,
}

function App() {
  const { fireplaces, registerFireplace, completeFireplace } = useHubStore()
  const resetGame = useGameStore((state) => state.resetGame)
  const [activeGameId, setActiveGameId] = useState<string | null>(null)
  const [transitioning, setTransitioning] = useState(false)
  const [pendingGameId, setPendingGameId] = useState<string | null>(null)

  useEffect(() => {
    registerFireplace({
      gameId: '01-chamber-of-secrets',
      title: '密室：记忆碎片',
      subtitle: '一场关于记忆与欺骗的博弈',
      unlocked: true,
      completed: false,
    })
  }, [registerFireplace])

  const handleEnterGame = (gameId: string) => {
    setPendingGameId(gameId)
    setTransitioning(true)
  }

  const handleTransitionComplete = () => {
    setActiveGameId(pendingGameId)
    setTransitioning(false)
  }

  const handleExitGame = () => {
    if (activeGameId && useGameStore.getState().status === 'completed') {
      completeFireplace(activeGameId)
    }
    resetGame()
    setActiveGameId(null)
  }

  if (activeGameId) {
    const GameComponent = GAME_COMPONENTS[activeGameId]
    return GameComponent ? <GameComponent onExit={handleExitGame} /> : null
  }

  return (
    <>
      <FireplaceWall fireplaces={fireplaces} onEnterGame={handleEnterGame} />
      <PortalTransition active={transitioning} onComplete={handleTransitionComplete} />
    </>
  )
}

export default App
