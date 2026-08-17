/**
 * 根路由控制器
 * 负责大厅 Hub 视图与游戏实例 Portal 视图之间的切换
 */
import { useEffect, useState, type ComponentType } from 'react'
import { AnimatePresence } from 'framer-motion'
import { FireplaceWall } from '@/core/components/FireplaceWall'
import { PortalTransition } from '@/core/components/PortalTransition'
import { AudioControl } from '@/core/components/AudioControl'
import { AuthModal } from '@/core/components/AuthModal'
import { ToastNotification } from '@/core/components/ToastNotification'
import { useHubStore } from '@/core/store/hubStore'
import { useGameStore } from '@/core/store/gameStore'
import { useUserStore } from '@/core/store/userStore'
import { downloadProgress, uploadProgress } from '@/core/services/syncService'
import { EscapeTheDen } from '@/games/02-escape-the-den/components/EscapeTheDen'
import { KaiDuan } from '@/games/03-kai-duan/components/KaiDuan'
import { SongBuDao } from '@/games/04-song-bu-dao/components/SongBuDao'
import { PiaoBaiZhenZhen } from '@/games/04-piao-bai-zhen-zhen/components/PiaoBaiZhenZhen'

const GAME_COMPONENTS: Record<string, ComponentType<{ onExit: () => void }>> = {
  '02-escape-the-den': EscapeTheDen,
  '03-kai-duan': KaiDuan,
  '04-song-bu-dao': SongBuDao,
  '04-piao-bai-zhen-zhen': PiaoBaiZhenZhen,
}

function App() {
  const { fireplaces, registerFireplace, completeFireplace } = useHubStore()
  const resetGame = useGameStore((state) => state.resetGame)
  const { user, logout, restoreSession } = useUserStore()

  // 清理已废弃的壁炉（从 localStorage 中移除不再注册的游戏）
  useEffect(() => {
    const validIds = Object.keys(GAME_COMPONENTS)
    const stale = fireplaces.filter((f) => !validIds.includes(f.gameId))
    if (stale.length > 0) {
      useHubStore.setState((state) => ({
        fireplaces: state.fireplaces.filter((f) => validIds.includes(f.gameId)),
      }))
    }
  }, [])

  const [activeGameId, setActiveGameId] = useState<string | null>(null)
  const [transitioning, setTransitioning] = useState(false)
  const [pendingGameId, setPendingGameId] = useState<string | null>(null)
  const [transitionCoords, setTransitionCoords] = useState({
    clickX: 0,
    clickY: 0,
    fireplaceX: 0,
    fireplaceY: 0,
  })
  const [showAuth, setShowAuth] = useState(false)

  // 启动时恢复 session，并在已登录时拉取云端进度
  useEffect(() => {
    restoreSession()
  }, [restoreSession])

  useEffect(() => {
    if (user) {
      downloadProgress().catch(console.error)
    }
  }, [user])

  useEffect(() => {
    registerFireplace({
      gameId: '02-escape-the-den',
      title: '逃出魔窟',
      subtitle: '七次抉择，一线生天',
      flameColor: '#c45a3a',
      unlocked: true,
      completed: false,
    })
    registerFireplace({
      gameId: '03-kai-duan',
      title: '开端',
      subtitle: '时间循环，寻找真相',
      flameColor: '#c8a84a',
      unlocked: true,
      completed: false,
    })
    registerFireplace({
      gameId: '04-song-bu-dao',
      title: '开端番外·送不到',
      subtitle: '快递员的时间循环',
      flameColor: '#d4a574',
      unlocked: true,
      completed: false,
    })
    registerFireplace({
      gameId: '04-piao-bai-zhen-zhen',
      title: '窗外',
      subtitle: '漂白·少年甄珍',
      flameColor: '#7a9eb8',
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

    // 游戏结束后上传进度（已登录时）
    if (useUserStore.getState().user) {
      uploadProgress().catch(console.error)
    }
  }

  const handleAuthSuccess = async () => {
    setShowAuth(false)
    // 登录/注册成功后立即拉取云端进度（user 变更会触发 useEffect，此处无需重复调用）
  }

  const GameComponent = activeGameId ? GAME_COMPONENTS[activeGameId] : null

  return (
    <>
      <AudioControl />
      <ToastNotification />

      {/* 右上角登录状态按钮（放在音量控制左边） */}
      {!activeGameId && (
        <div className="fixed top-4 right-16 z-40 flex items-center gap-2">
          {user ? (
            <>
              <span className="text-xs text-floo-text-muted hidden sm:inline">
                {user.email || '已登录'}
              </span>
              <button
                onClick={logout}
                className="text-xs text-floo-text-muted border border-floo-text-muted/30 rounded-lg px-3 py-1.5 hover:border-floo-text-muted transition-colors"
              >
                退出
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              className="text-xs text-floo-accent-green border border-floo-accent-green/40 rounded-lg px-3 py-1.5 hover:bg-floo-accent-green/10 transition-colors"
            >
              登录 / 注册
            </button>
          )}
        </div>
      )}

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

      <AnimatePresence>
        {showAuth && (
          <AuthModal
            onSuccess={handleAuthSuccess}
            onClose={() => setShowAuth(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}

export default App
