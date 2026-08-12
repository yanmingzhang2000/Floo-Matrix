# Floo Matrix

沉浸式互动叙事解谜平台。玩家通过壁炉传送门穿梭于不同的悬疑时空中，体验文字驱动的分支剧情、线索推理与多结局探索。

## 快速开始

```bash
# 前端
cd floo-web
pnpm install
pnpm dev

# 后端（可选）
cd floo-backend
pnpm install
cp .env.example .env  # 填入数据库和 JWT 配置
pnpm prisma migrate dev
pnpm dev
```

## 项目结构

```
Floo-Matrix/
├── floo-web/                  # 前端（React + Vite + TypeScript）
│   └── src/
│       ├── core/              # 平台级核心底座
│       │   ├── components/    # 通用 UI 组件
│       │   ├── engine/        # 叙事引擎 + 音频管理
│       │   ├── hooks/         # 自定义 Hooks
│       │   ├── store/         # Zustand 状态管理
│       │   ├── services/      # 云端同步服务
│       │   ├── api/           # API 客户端
│       │   └── types/         # 核心类型定义
│       ├── games/             # 游戏（独立插拔）
│       │   ├── 02-escape-the-den/  # 逃出魔窟
│       │   ├── 03-kai-duan/       # 开端
│       │   └── 04-song-bu-dao/    # （开发中）
│       ├── App.tsx            # 根路由：大厅 vs 游戏
│       ├── main.tsx           # 入口
│       └── index.css          # Tailwind 主题 + 颜色变量
├── floo-backend/              # 后端（Node.js + Prisma + SQLite）
└── REQUIREMENTS_KAI_DUAN.md   # 开端需求文档
```

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | React 19 + TypeScript |
| 构建 | Vite 8 |
| 样式 | Tailwind CSS v4（`@theme` 配置颜色） |
| 动画 | Framer Motion 13 |
| 状态 | Zustand 5（persist 中间件 → localStorage） |
| 音频 | Howler.js |
| 后端 | Node.js + Prisma + SQLite |

## 设计规范

### 配色（沉稳棕金风）

定义在 `floo-web/src/index.css` 的 `@theme` 块中：

| Token | 色值 | 用途 |
|-------|------|------|
| `floo-bg-primary` | `#0e0c09` | 页面底色 |
| `floo-bg-secondary` | `#1a1610` | 卡片/面板背景 |
| `floo-accent-green` | `#c8934a` | 主强调色（按钮、边框、火焰） |
| `floo-accent-green-dark` | `#a07535` | 主强调暗部 |
| `floo-accent-gold` | `#b8973a` | 副强调色（通关标签、标题） |
| `floo-accent-blue` | `#5a8aa8` | 线索卡片-事实类 |
| `floo-accent-red` | `#b85450` | 线索卡片-异常类 |
| `floo-text-primary` | `#e4ddd2` | 主文字 |
| `floo-text-muted` | `#7d7268` | 次要文字/边框 |

### 字体

| Token | 字体 | 用途 |
|-------|------|------|
| `font-heading` | Cinzel | 标题、游戏名 |
| `font-body` | Lora | 故事正文 |
| `font-ui` | Inter | 按钮、标签、UI |

### 每个壁炉独立火焰颜色

在 `App.tsx` 中注册壁炉时通过 `flameColor` 字段指定：

```ts
registerFireplace({
  gameId: '02-escape-the-den',
  flameColor: '#c45a3a', // 暖红橙
  ...
})
registerFireplace({
  gameId: '03-kai-duan',
  flameColor: '#c8a84a', // 明亮金
  ...
})
```

## 叙事引擎

核心逻辑在 `core/engine/StoryEngine.ts`，通过 `useStoryEngine` Hook 暴露给游戏组件。

### story.json 结构

```json
{
  "gameId": "03-kai-duan",
  "title": "开端",
  "startNode": "loop1_awaken",
  "characters": [...],
  "clues": [...],
  "nodes": {
    "node_id": {
      "type": "dialogue | choice | cutscene | ending",
      "content": "故事文本",
      "scene": "bus",
      "choices": [...],
      "effects": [...],
      "investigations": [...]
    }
  }
}
```

### 节点类型

| 类型 | 说明 |
|------|------|
| `dialogue` | 对话文本，可带调查点，自动推进或等待点击 |
| `choice` | 分支选择，玩家点击选项后跳转 |
| `cutscene` | 过场动画（特殊渲染，如回忆、真相揭示） |
| `ending` | 结局节点，区分 `bad` / `good`，可带 `checkpointNodeId` 用于重试 |

### 效果系统

选择后触发的副作用：

```json
{ "type": "addItem", "key": "crystal_name", "value": "记忆水晶" }
{ "type": "setFlag", "key": "trust_xiao_high", "value": true }
{ "type": "setVariable", "key": "currentLoop", "value": 3 }
```

### 条件系统

选项显示的前置条件：

```json
{ "type": "variable", "key": "trust_xiao_high", "operator": "eq", "value": true }
{ "type": "flag", "key": "ghost_contact" }
```

## 新增游戏

1. 在 `src/games/` 下创建目录（如 `05-my-game/`）
2. 编写 `story.json`（遵循上述结构）
3. 创建游戏主组件（参考 `KaiDuan.tsx` 或 `EscapeTheDen.tsx`）
4. 在 `App.tsx` 的 `GAME_COMPONENTS` 中注册
5. 在 `registerFireplace` 中添加壁炉配置（含 `flameColor`）

## 通用组件

| 组件 | 用途 |
|------|------|
| `DialogueBox` | 故事文本展示 |
| `ChoicePanel` | 分支选择按钮列表 |
| `InvestigationPanel` | 调查点按钮，点击展开详情 |
| `ClueDrawer` | 线索抽屉（左上角） |
| `ClueCard` | 单张线索卡片 |
| `ReasoningBoard` | 推理板（关联线索与角色） |
| `SceneBackdrop` | 场景背景（渐变 + 暗角） |
| `GameTutorial` | 游戏引导弹窗 |
| `FireplacePortal` | 壁炉传送门（纯火焰） |
| `PortalTransition` | 进入游戏的转场动画 |
| `AudioControl` | 音量控制 |
| `AuthModal` | 登录/注册弹窗 |

## 开发命令

```bash
pnpm dev      # 启动开发服务器
pnpm build    # TypeScript 编译 + Vite 构建
pnpm lint     # oxlint 代码检查
pnpm preview  # 预览构建产物
```
