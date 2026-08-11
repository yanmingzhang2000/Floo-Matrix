/**
 * 叙事引擎 React Hook
 * 将 StoryEngine 与 gameStore 绑定，提供组件可直接使用的状态与操作
 */
import { useEffect, useMemo, useState } from 'react'
import { StoryEngine } from '@/core/engine/StoryEngine'
import { useGameStore } from '@/core/store/gameStore'
import type { Choice, StoryData, StoryNode } from '@/core/types/story'

export function useStoryEngine(story: StoryData) {
  const engine = useMemo(() => new StoryEngine(story), [story])
  const { gameId, currentNodeId, startGame, goToNode, completeGame } = useGameStore()
  const [currentNode, setCurrentNode] = useState<StoryNode | null>(null)

  useEffect(() => {
    if (gameId !== story.gameId) {
      const startNode = engine.getStartNode()
      startGame(story.gameId, startNode.id)
      engine.enterNode(startNode)
      setCurrentNode(startNode)
    } else if (currentNodeId) {
      setCurrentNode(engine.getNode(currentNodeId))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story.gameId])

  const advanceTo = (nextNode: StoryNode) => {
    engine.enterNode(nextNode)
    goToNode(nextNode.id)
    setCurrentNode(nextNode)
    if (nextNode.type === 'ending') {
      completeGame()
    }
  }

  const selectChoice = (choice: Choice) => {
    advanceTo(engine.makeChoice(choice))
  }

  /** 推进到节点自带的 nextNode（用于无选项的纯剧情/过场节点） */
  const advanceNode = () => {
    if (currentNode?.nextNode) {
      advanceTo(engine.getNode(currentNode.nextNode))
    }
  }

  const availableChoices = currentNode ? engine.getAvailableChoices(currentNode) : []
  const canAdvance = Boolean(currentNode?.nextNode) && availableChoices.length === 0

  return {
    currentNode,
    availableChoices,
    selectChoice,
    advanceNode,
    canAdvance,
    isEnding: currentNode?.type === 'ending',
  }
}
