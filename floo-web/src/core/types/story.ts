/**
 * Floo Platform - 核心类型定义
 * 叙事引擎、剧本数据结构相关类型
 */

/** 剧本节点类型 */
export type StoryNodeType = 'dialogue' | 'choice' | 'puzzle' | 'cutscene' | 'ending'

/** 场景标识，驱动背景光影与环境音切换 */
export type SceneId = 'basement' | 'forest' | 'cabin' | 'station' | 'reveal'

/** 条件判断类型（用于分支剧情、道具检查） */
export interface Condition {
  /** 条件类型：拥有道具 / 剧情标记 / 变量比较 */
  type: 'hasItem' | 'flag' | 'variable'
  key: string
  /** 比较值（variable 类型时使用） */
  value?: string | number | boolean
  /** 比较操作符（variable 类型时使用） */
  operator?: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte'
}

/** 效果类型（选择后触发的副作用） */
export interface Effect {
  type: 'addItem' | 'removeItem' | 'setFlag' | 'setVariable'
  key: string
  value?: string | number | boolean
}

/** 选项分支 */
export interface Choice {
  id: string
  text: string
  nextNode: string
  /** 该选项显示所需满足的条件（全部满足才显示） */
  conditions?: Condition[]
  /** 选择后触发的效果 */
  effects?: Effect[]
}

/** 剧本节点 */
export interface StoryNode {
  id: string
  type: StoryNodeType
  content: string
  speaker?: string
  /** 该节点激活时触发的效果（进入即生效） */
  effects?: Effect[]
  choices?: Choice[]
  /** 非选择型节点的默认下一节点（对话/过场自动跳转） */
  nextNode?: string
  /** 解谜节点专属：解谜组件标识，由具体游戏组件渲染 */
  puzzleId?: string
  /** ending 节点专属：区分死亡结局与通关结局，驱动差异化渲染 */
  endingVariant?: 'bad' | 'good'
  /** 场景标识，驱动背景光影/暗角与环境音切换 */
  scene?: SceneId
  /** 该节点对应的环境音 key（对应 audioManager 注册的音效） */
  ambientSound?: string
  /** 紧张程度 0-3，驱动暗角强度/心跳感等氛围效果（不驱动限时逻辑） */
  tensionLevel?: number
  /** bad ending 专属：对应的选择点节点 ID，用于"重新抉择"跳转与未来复活机制预留 */
  checkpointNodeId?: string
}

/** 完整剧本数据 */
export interface StoryData {
  gameId: string
  title: string
  description: string
  startNode: string
  nodes: Record<string, StoryNode>
}

/** 魔袋道具 */
export interface InventoryItem {
  id: string
  name: string
  description: string
  icon?: string
  /** 是否为跨游戏关键道具（可解锁彩蛋/隐藏剧情） */
  isKeyItem?: boolean
}

/** 壁炉（游戏入口）配置 */
export interface FireplaceConfig {
  gameId: string
  title: string
  subtitle: string
  thumbnail?: string
  /** 是否已解锁 */
  unlocked: boolean
  /** 是否已通关 */
  completed: boolean
}

/** 游戏进度状态 */
export type GameStatus = 'idle' | 'playing' | 'completed'
