/**
 * 通用互动叙事引擎
 * 负责解析剧本 JSON、执行条件判断、处理选择跳转与道具/状态副作用
 *
 * 设计原则：引擎本身不感知具体游戏内容，只负责通用的剧本树解析逻辑，
 * 具体游戏的 UI 展现交给 games/[game-id]/components 实现。
 */
import type { Choice, Condition, Effect, StoryData, StoryNode, Alignment } from '@/core/types/story'
import { useInventoryStore } from '@/core/store/inventoryStore'
import { useHubStore } from '@/core/store/hubStore'
import { useRelationshipStore } from '@/core/store/relationshipStore'

export class StoryEngine {
  private story: StoryData
  private gameId: string

  constructor(story: StoryData, gameId?: string) {
    this.story = story
    this.gameId = gameId ?? story.gameId
  }

  /** 获取剧本起始节点 */
  getStartNode(): StoryNode {
    const node = this.story.nodes[this.story.startNode]
    if (!node) {
      throw new Error(`[StoryEngine] 起始节点未找到: ${this.story.startNode}`)
    }
    return node
  }

  /** 根据节点 ID 获取节点数据 */
  getNode(nodeId: string): StoryNode {
    const node = this.story.nodes[nodeId]
    if (!node) {
      throw new Error(`[StoryEngine] 节点未找到: ${nodeId}`)
    }
    return node
  }

  /** 判断单个条件是否满足 */
  checkCondition(condition: Condition): boolean {
    const inventory = useInventoryStore.getState()
    const hub = useHubStore.getState()
    const relationship = useRelationshipStore.getState()

    switch (condition.type) {
      case 'hasItem':
        return inventory.hasItem(condition.key)

      case 'flag':
        return Boolean(hub.flags[condition.key]) === (condition.value ?? true)

      case 'variable': {
        const current = hub.variables[condition.key]
        return this.compareValues(current, condition.operator ?? 'eq', condition.value)
      }

      case 'metCharacter': {
        const relation = relationship.getRelation(this.gameId, condition.key)
        return relation.met === (condition.value ?? true)
      }

      default:
        return false
    }
  }

  /** 判断一组条件是否全部满足（AND 逻辑） */
  checkAllConditions(conditions?: Condition[]): boolean {
    if (!conditions || conditions.length === 0) return true
    return conditions.every((condition) => this.checkCondition(condition))
  }

  /** 获取当前节点中，满足显示条件的选项列表 */
  getAvailableChoices(node: StoryNode): Choice[] {
    if (!node.choices) return []
    return node.choices.filter((choice) => this.checkAllConditions(choice.conditions))
  }

  /** 执行一组效果（道具增减、标记/变量设置、人物关系） */
  applyEffects(effects?: Effect[]): void {
    if (!effects || effects.length === 0) return

    const inventory = useInventoryStore.getState()
    const hub = useHubStore.getState()
    const relationship = useRelationshipStore.getState()

    for (const effect of effects) {
      switch (effect.type) {
        case 'addItem':
          inventory.addItem({
            id: effect.key,
            name: String(effect.value ?? effect.key),
            description: '',
          })
          break
        case 'removeItem':
          inventory.removeItem(effect.key)
          break
        case 'setFlag':
          hub.setFlag(effect.key, Boolean(effect.value))
          break
        case 'setVariable':
          if (effect.value !== undefined) {
            hub.setVariable(effect.key, effect.value)
          }
          break
        case 'meetCharacter':
          relationship.metCharacter(this.gameId, effect.key)
          break
        case 'setAlignment':
          if (effect.value !== undefined) {
            relationship.setAlignment(this.gameId, effect.key, effect.value as Alignment)
          }
          break
        case 'updateAffinity':
          if (effect.value !== undefined) {
            relationship.updateAffinity(this.gameId, effect.key, Number(effect.value), effect.name)
          }
          break
      }
    }
  }

  /** 执行选择：应用副作用并返回下一节点 */
  makeChoice(choice: Choice): StoryNode {
    this.applyEffects(choice.effects)
    return this.getNode(choice.nextNode)
  }

  /** 进入节点：应用节点自身携带的效果（用于对话/过场自动触发） */
  enterNode(node: StoryNode): void {
    this.applyEffects(node.effects)
  }

  private compareValues(
    current: unknown,
    operator: NonNullable<Condition['operator']>,
    target: unknown
  ): boolean {
    switch (operator) {
      case 'eq':
        return current === target
      case 'neq':
        return current !== target
      case 'gt':
        return Number(current) > Number(target)
      case 'lt':
        return Number(current) < Number(target)
      case 'gte':
        return Number(current) >= Number(target)
      case 'lte':
        return Number(current) <= Number(target)
      default:
        return false
    }
  }
}
