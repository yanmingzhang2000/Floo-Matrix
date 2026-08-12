# Floo Matrix — 项目架构与开发指引

> **最后更新：** 2026-08-12

---

## 1. 项目定位

Floo Matrix 是一个基于 Web 的沉浸式互动叙事解谜平台。玩家通过"壁炉传送门"穿梭于不同的悬疑时空中，体验文字驱动的分支剧情、线索推理与多结局探索。

**设计关键词：** 暗黑魔法风 · 沉稳棕金配色 · 电影级转场 · 文字沉浸体验

---

## 2. 目录结构

```
Floo-Matrix/
├── floo-web/                       # 前端应用
│   ├── src/
│   │   ├── core/                   # 平台核心底座
│   │   │   ├── components/         # 通用 UI 组件（15个）
│   │   │   ├── engine/             # 叙事引擎 + 音频管理
│   │   │   ├── hooks/              # useStoryEngine
│   │   │   ├── store/              # Zustand stores（5个）
│   │   │   ├── services/           # syncService（云端同步）
│   │   │   ├── api/                # apiClient（后端通信）
│   │   │   └── types/              # TypeScript 类型定义
│   │   ├── games/                  # 游戏实例（独立插拔）
│   │   │   ├── 02-escape-the-den/  # 逃出魔窟
│   │   │   ├── 03-kai-duan/       # 开端
│   │   │   └── 04-song-bu-dao/    # （开发中）
│   │   ├── App.tsx                 # 根路由：大厅 Hub vs 游戏 Portal
│   │   ├── main.tsx                # 入口
│   │   └── index.css               # Tailwind @theme 配置
│   ├── public/                     # 静态资源（音频、字体）
│   ├── vite.config.ts
│   └── package.json
├── floo-backend/                   # 后端服务
│   ├── src/
│   ├── prisma/                     # 数据库 Schema
│   └── package.json
├── PROJECT_OVERVIEW.md             # 本文档
├── README.md                       # 快速开始 + 使用指南
└── REQUIREMENTS_KAI_DUAN.md        # 开端需求文档
```

---

## 3. 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| UI 框架 | React + TypeScript | 19.x |
| 构建工具 | Vite | 8.x |
| CSS | Tailwind CSS（`@theme` 配置） | 4.x |
| 动画 | Framer Motion | 13.x |
| 状态管理 | Zustand（persist → localStorage） | 5.x |
| 音频 | Howler.js | 2.x |
| Linter | oxlint | — |
| 后端 | Node.js + Prisma + SQLite | — |

---

## 4. 核心架构

### 4.1 大厅 vs 游戏（Hub & Portal）

`App.tsx` 控制两个视图的切换：

```
大厅（FireplaceWall）  ←→  游戏（GameComponent）
     ↑                          ↑
  壁炉墙 + 转场动画         各游戏主组件
```

- 大厅展示所有已注册的壁炉（`useHubStore.fireplaces`）
- 点击壁炉触发 `PortalTransition`（撒粉 → 点燃 → 吞噬 → 淡出）
- 转场完成后渲染对应游戏组件

### 4.2 叙事引擎

`StoryEngine` 是游戏无关的通用引擎：

```
story.json → StoryEngine.parse() → 节点图
                                        ↓
useStoryEngine hook → currentNode, availableChoices, selectChoice(), ...
                                        ↓
                              游戏组件渲染 UI
```

**支持的节点类型：**
- `dialogue` — 对话，可带调查点
- `choice` — 分支选择
- `cutscene` — 过场（特殊渲染）
- `ending` — 结局（支持 checkpoint 重试）

**效果系统：** `addItem` / `setFlag` / `setVariable`
**条件系统：** `hasItem` / `flag` / `variable`（比较操作符 eq/neq/gt/lt/gte/lte）

### 4.3 状态管理

| Store | 用途 | 持久化 |
|-------|------|--------|
| `hubStore` | 壁炉配置、全局 flags/variables | localStorage |
| `gameStore` | 当前游戏状态 | — |
| `inventoryStore` | 道具（魔袋） | — |
| `audioStore` | 音量/静音 | — |
| `userStore` | 用户登录态 | — |

### 4.4 音频系统

`audioManager` 统一管理：

- **环境音**（BGM）：每个场景对应一个循环播放的环境音
- **音效**（SFX）：心跳、线索发现、循环重置、结局等
- **转场音效**：撒粉、点火、传送门 whoosh

注册时机：游戏组件 mount 时注册，节点切换时播放对应音效。

---

## 5. 配色系统

定义在 `index.css` 的 `@theme` 块，全局 CSS 变量：

```css
/* 沉稳棕金风 */
--color-floo-bg-primary: #0e0c09;       /* 深棕黑底色 */
--color-floo-bg-secondary: #1a1610;     /* 暖褐卡片底 */
--color-floo-accent-green: #c8934a;     /* 琥珀棕金（主强调） */
--color-floo-accent-green-dark: #a07535;/* 深棕 */
--color-floo-accent-gold: #b8973a;      /* 古典金（副强调） */
--color-floo-accent-blue: #5a8aa8;      /* 线索-事实类 */
--color-floo-accent-red: #b85450;       /* 线索-异常类 */
--color-floo-text-primary: #e4ddd2;     /* 暖米白 */
--color-floo-text-muted: #7d7268;       /* 暖灰 */
```

**重要：** 所有 UI 颜色必须使用 `floo-*` token，禁止使用 Tailwind 默认色或硬编码 hex（场景背景除外）。

---

## 6. 组件清单

### 6.1 通用组件（core/components/）

| 组件 | 文件 | 用途 |
|------|------|------|
| `DialogueBox` | 28行 | 故事文本卡片，可选 speaker |
| `ChoicePanel` | 33行 | 分支选择按钮列表 |
| `InvestigationPanel` | 94行 | 调查点按钮，展开显示详情+线索 |
| `ClueDrawer` | 108行 | 左上角线索抽屉（滑出面板） |
| `ClueCard` | 53行 | 单张线索卡片（按类型着色） |
| `ReasoningBoard` | 192行 | 推理板（关联线索与角色） |
| `SceneBackdrop` | 84行 | 场景背景（渐变 + 暗角） |
| `GameTutorial` | ~120行 | 游戏引导弹窗（分步卡片） |
| `FireplacePortal` | ~170行 | 壁炉传送门（纯火焰动画） |
| `FireplaceWall` | 73行 | 大厅壁炉墙布局 |
| `EmberParticles` | 67行 | 余烬粒子系统 |
| `PortalTransition` | 214行 | 四阶段转场动画 |
| `PowderToss` | 89行 | Floo powder 撒粉动效 |
| `AudioControl` | 94行 | 音量控制按钮 |
| `AuthModal` | — | 登录/注册弹窗 |

### 6.2 游戏专属组件

**逃出魔窟：**
- `BadEndingOverlay` — 死亡结局（红色脉冲 + 重试）
- `RevealCutscene` — 真相揭示过场（模糊→清晰）

**开端：**
- `CycleCounter` — 循环次数 + 线索数 + 副线标签
- `TimelineBar` — 时间线进度条（当前时间 vs 爆炸时间）
- `LoopResetOverlay` — 循环重置动画（白光闪烁 → 倒带）
- `TrustMeter` — 信任度指示器
- `FlashbackOverlay` — 回忆过场（棕褐色滤镜）

---

## 7. 游戏数据结构

### story.json 字段说明

```json
{
  "gameId": "唯一标识",
  "title": "显示标题",
  "description": "游戏简介",
  "startNode": "起始节点ID",
  "characters": [{ "id", "name", "description" }],
  "clues": [{ "id", "title", "type", "content", "location" }],
  "nodes": { "node_id": { ... } }
}
```

### 单个节点结构

```json
{
  "id": "节点唯一ID",
  "type": "dialogue | choice | cutscene | ending",
  "content": "故事文本（支持 \\n 换行）",
  "speaker": "说话人名（可选）",
  "scene": "场景ID（驱动背景）",
  "ambientSound": "环境音key",
  "tensionLevel": "0-5（驱动暗角强度）",
  "choices": [{ "id", "text", "nextNode", "conditions?", "effects?" }],
  "effects": [{ "type", "key", "value?" }],
  "investigations": [{ "id", "label", "content", "clueId?" }],
  "nextNode": "默认下一节点",
  "endingVariant": "bad | good（仅 ending 类型）",
  "checkpointNodeId": "重试跳转节点（仅 bad ending）"
}
```

---

## 8. 场景系统

`SceneBackdrop` 根据 `scene` 字段渲染不同背景：

| Scene ID | 用途 | 色调 |
|----------|------|------|
| `basement` | 地下室 | 暗绿黑 |
| `forest` | 森林 | 深绿 |
| `cabin` | 木屋 | 暖棕 |
| `station` | 车站 | 冷灰 |
| `reveal` | 真相揭示 | 暗红 |
| `bus` | 公交车 | 深蓝灰 |
| `convention` | 漫展 | 暗紫 |
| `police_station` | 警局 | 冷蓝灰 |
| `factory` | 工厂 | 暖褐 |
| `bridge` | 大桥 | 深蓝 |

`tensionLevel`（0-5）控制暗角强度，值越高画面越暗。

---

## 9. 添加新游戏

### 步骤

1. **创建目录** `src/games/{序号}-{game-id}/`
2. **编写 `story.json`** — 按照第7节结构
3. **创建游戏主组件** — 参考 `KaiDuan.tsx` 或 `EscapeTheDen.tsx`
4. **注册到 App.tsx：**
   ```tsx
   // GAME_COMPONENTS 中添加
   'my-game': MyGameComponent,

   // registerFireplace 中添加
   registerFireplace({
     gameId: 'my-game',
     title: '游戏标题',
     subtitle: '副标题',
     flameColor: '#hex',
     unlocked: true,
     completed: false,
   })
   ```
5. **（可选）添加专属场景** — 在 `SceneBackdrop` 的 `SCENE_STYLES` 中添加
6. **（可选）添加游戏引导** — 使用 `GameTutorial` 组件

### 游戏主组件模板

```tsx
import { GameTutorial } from '@/core/components/GameTutorial'
import { useStoryEngine } from '@/core/hooks/useStoryEngine'
// ... 其他组件

const TUTORIAL_KEY = 'floo-tutorial-{game-id}'
const TUTORIAL_STEPS = [
  { icon: '📖', title: '步骤1', content: '说明文字' },
  // ...
]

export function MyGame({ onExit }: { onExit: () => void }) {
  const { currentNode, availableChoices, selectChoice, ... } =
    useStoryEngine(storyData)
  const [showTutorial, setShowTutorial] = useState(() => {
    return !localStorage.getItem(TUTORIAL_KEY)
  })

  if (!currentNode) return null

  return (
    <div className="min-h-screen ...">
      <SceneBackdrop scene={currentNode.scene} />
      <AnimatePresence>
        {showTutorial && (
          <GameTutorial steps={TUTORIAL_STEPS} storageKey={TUTORIAL_KEY}
            onComplete={() => setShowTutorial(false)} />
        )}
      </AnimatePresence>
      {/* 游戏内容 */}
    </div>
  )
}
```

---

## 10. 开发规范

### 代码风格

- 所有组件使用函数式组件 + TypeScript
- 样式使用 Tailwind class，颜色使用 `floo-*` token
- 动画使用 Framer Motion，禁止硬切（所有状态切换必须有过渡）
- 状态管理使用 Zustand，跨游戏状态走 `hubStore` 的 flags/variables

### 命名约定

- 游戏目录：`{序号}-{kebab-case-name}`
- 游戏组件：PascalCase（如 `KaiDuan.tsx`）
- story.json 中的节点 ID：`{类型}_{描述}`（如 `loop1_awaken`, `choice_7`）
- 效果/标记 key：snake_case（如 `trust_xiao_high`）

### 禁止事项

- ❌ 硬编码颜色值（场景背景除外），必须用 CSS 变量
- ❌ 使用 Tailwind 默认色（如 `blue-500`），必须用 `floo-*` token
- ❌ 在 JSON 剧本中使用未转义的双引号（用中文引号 `""`）
- ❌ 在 early return 之后调用 Hook
- ❌ 在游戏组件中直接操作 localStorage（走 store）

### Git 提交

- `feat:` 新功能
- `fix:` 修复
- `refactor:` 重构
- `docs:` 文档
