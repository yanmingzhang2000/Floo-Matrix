/**
 * 根路由控制器
 * 负责大厅 Hub 视图与游戏实例 Portal 视图之间的切换
 */
import { useEffect, useState, type ComponentType } from 'react'
import { FireplaceWall } from '@/core/components/FireplaceWall'
import { PortalTransition } from '@/core/components/PortalTransition'
import { AudioControl } from '@/core/components/AudioControl'
import { useHubStore } from '@/core/store/hubStore'
import { useGameStore } from '@/core/store/gameStore'
import { ChamberOfSecrets } from '@/games/01-chamber-of-secrets/components/ChamberOfSecrets'
import { EscapeTheDen } from '@/games/02-escape-the-den/components/EscapeTheDen'

const GAME_COMPONENTS: Record<string, ComponentType<{ onExit: () => void }>> = {
  '01-chamber-of-secrets': ChamberOfSecrets,
  '02-escape-the-den': EscapeTheDen,
}

function App() {
  const { fireplaces, registerFireplace, completeFireplace } = useHubStore()
  const resetGame = useGameStore((state) => state.resetGame)
  const [activeGameId, setActiveGameId] = useState<string | null>(null)
  const [transitioning, setTransitioning] = useState(false)
  const [pendingGameId, setPendingGameId] = useState<string | null>(null)
  const [transitionCoords, setTransitionCoords] = useState({
    clickX: 0,
    clickY: 0,
    fireplaceX: 0,
    fireplaceY: 0,
  })

  useEffect(() => {
    registerFireplace({
      gameId: '01-chamber-of-secrets',
      title: '密室：记忆碎片',
      subtitle: '一场关于记忆与欺骗的博弈',
      unlocked: true,
      completed: false,
    })
    registerFireplace({
      gameId: '02-escape-the-den',
      title: '逃出魔窟',
      subtitle: '七次抉择，一线生天',
      unlocked: true,
      completed: false,
    })
  }, [registerFireplace])

  const handleEnterGame = (
    gameId: string,
    clickX: number,
    clickY: number,
    fireplaceX: number,
    fireplaceY: number
  ) => {
    setPendingGameId(gameId)
    setTransitionCoords({ clickX, clickY, fireplaceX, fireplaceY })
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

  const GameComponent = activeGameId ? GAME_COMPONENTS[activeGameId] : null

  return (
    <>
      <AudioControl />
      {GameComponent ? (
        <GameComponent onExit={handleExitGame} />
      ) : (
        <>
          <FireplaceWall fireplaces={fireplaces} onEnterGame={handleEnterGame} />
          <PortalTransition
            active={transitioning}
            clickX={transitionCoords.clickX}
            clickY={transitionCoords.clickY}
            fireplaceX={transitionCoords.fireplaceX}
            fireplaceY={transitionCoords.fireplaceY}
            onComplete={handleTransitionComplete}
          />
        </>
      )}
    </>
  )
}

export default App
