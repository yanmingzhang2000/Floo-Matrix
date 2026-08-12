# 🔥 Floo Platform

> *"Through the flicker of shifting hearths, step beyond the screen."*

一个基于 Web 的沉浸式互动悬疑解谜与剧情游戏平台。结合轻量级 ARG 元素与高智商心理博弈叙事，通过独特的"壁炉传送网"机制，让玩家在多个独立但暗中相连的悬疑时空中穿梭。

---

## 🎯 产品定位

### 核心理念
- **类型定位**：Web-based 互动叙事 + 悬疑解谜 + 轻量级 ARG
- **叙事风格**：致敬《十四分之一》式局中局，多层反转，高智商博弈
- **美学基调**：暗黑复古、神秘学、英伦魔法学院风（哈利波特灵感）
- **交互哲学**：拒绝低幼网页小游戏质感，追求电影级 UI 转场与沉浸式文本体验

### 目标用户
- 热爱悬疑推理的剧情向玩家
- 追求沉浸式叙事体验的文字冒险爱好者
- 喜欢 ARG/解密游戏的硬核玩家

---

## 🚀 开发大方向

### Phase 1: 核心平台搭建（当前阶段）
- ✅ 建立 Monorepo 架构（平台大厅 + 游戏实例解耦）
- ✅ 实现"壁炉传送网"核心机制
- ✅ 开发通用叙事引擎（支持结构化 JSON 剧本）
- ✅ 完成第一个完整游戏 Demo

### Phase 2: 横向扩展
- 🔲 增加 3-5 个不同题材的游戏剧本
- 🔲 实现跨游戏记忆残留系统（"魔袋"道具联动）
- 🔲 大厅彩蛋与隐藏剧情解锁机制

### Phase 3: 深度优化
- 🔲 可视化剧本编辑器（支持非技术人员编写剧本）
- 🔲 用户存档云同步
- 🔲 社区分享与 UGC 剧本上传

### Phase 4: ARG 破壁
- 🔲 控制台隐藏线索系统
- 🔲 假报错页面与外部加密链接
- 🔲 真实世界互动元素（邮件、短信、社交媒体）

---

## 🛠️ 技术栈

### 核心技术
- **前端框架**：React 19 + TypeScript + Vite
- **样式方案**：Tailwind CSS（自定义暗黑魔法风主题）
- **动画引擎**：Framer Motion（页面转场、火焰特效、解谜动效）
- **状态管理**：Zustand（全局大厅状态、跨游戏道具、玩家进度）
- **音效管理**：Howler.js（环境音、BGM、UI 音效）
- **路由方案**：React Router DOM

### 开发工具
- **包管理器**：pnpm（推荐）或 npm
- **代码规范**：ESLint + Prettier
- **类型检查**：TypeScript Strict Mode

---

## 📂 项目结构

```
floo-matrix/
├── floo-web/                    # 主应用代码
│   ├── public/
│   │   ├── audio/               # 音频资源（BGM、音效、环境音）
│   │   └── images/              # 图片资源（壁炉墙、游戏场景）
│   ├── src/
│   │   ├── core/                # 🔥 平台核心底座
│   │   │   ├── components/      # 大厅全局组件（壁炉墙、转场动画）
│   │   │   ├── store/           # Zustand 状态管理
│   │   │   ├── engine/          # 通用叙事引擎
│   │   │   ├── hooks/           # 自定义 React Hooks
│   │   │   └── types/           # TypeScript 类型定义
│   │   ├── games/               # 🎮 游戏剧本实例（插拔式）
│   │   │   ├── 01-chamber-of-secrets/
│   │   │   │   ├── story.json   # 剧本数据
│   │   │   │   ├── assets/      # 游戏专属资源
│   │   │   │   └── components/  # 游戏专属 UI 组件
│   │   │   └── 02-next-game/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
└── PROJECT_OVERVIEW.md          # 详细设计文档
```

---

## 📜 代码规范

### 组件开发原则

#### 1. 高内聚低耦合
- **UI 与数据分离**：组件只负责渲染，数据逻辑交给叙事引擎
- **游戏独立性**：每个游戏的特定逻辑封装在 `games/[game-id]/` 目录内
- **核心通用性**：`core/` 目录中的代码必须保持游戏无关

#### 2. 动效必须流畅
- 所有页面切换必须使用 Framer Motion 过渡动画
- 禁止生硬的"硬切页"（instant navigation）
- 交互反馈延迟不超过 100ms

#### 3. 类型安全优先
- 所有组件必须定义明确的 TypeScript 接口
- 禁止使用 `any` 类型（特殊情况需注释说明）
- 剧本 JSON 数据必须通过 Zod 或 JSON Schema 验证

#### 4. 可读性与可维护性
- 组件单一职责，单个文件不超过 300 行
- 复杂逻辑抽取为自定义 Hook
- 关键业务逻辑必须添加注释

### 命名规范

```typescript
// 组件命名：PascalCase
const FireplacePortal: React.FC<Props> = () => {}

// Hook 命名：use + 功能描述
const useStoryEngine = () => {}

// Store 命名：use + 领域 + Store
const useInventoryStore = create(() => {})

// 类型命名：描述性名词 + 类型后缀
interface StoryNode {}
type GameStatus = 'idle' | 'playing' | 'completed'

// 文件命名：
// - 组件：PascalCase.tsx
// - Hook：useSomething.ts
// - Store：somethingStore.ts
// - 工具：kebab-case.ts
```

### Git 提交规范

```bash
# 格式：<type>(<scope>): <subject>

feat(hub): 实现壁炉墙悬停动效
fix(engine): 修复条件判断逻辑错误
style(ui): 调整对话框配色
refactor(core): 重构叙事引擎状态管理
docs(readme): 更新安装指南
```

**Type 类型**：
- `feat`: 新功能
- `fix`: Bug 修复
- `refactor`: 代码重构
- `style`: 样式调整
- `docs`: 文档更新
- `test`: 测试相关
- `chore`: 构建/工具链配置

---

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0.0
- pnpm >= 8.0.0（推荐）

### 安装依赖

```bash
cd floo-web
pnpm install
```

### 开发模式

```bash
pnpm dev
```

访问 `http://localhost:5173`

### 生产构建

```bash
pnpm build
pnpm preview
```

---

## 🎨 设计资源

### 配色方案（哈利波特暗黑魔法风）

```css
/* 主色调 */
--bg-primary: #0a0e14      /* 深灰黑 */
--bg-secondary: #1a1f29    /* 石板灰 */
--accent-green: #2ecc71    /* 斯莱特林绿（火焰） */
--accent-gold: #f39c12     /* 魔法金（点缀） */
--text-primary: #ecf0f1    /* 羊皮纸白 */
--text-muted: #7f8c8d      /* 灰雾 */
```

### 字体建议
- **标题**：Cinzel（古典衬线体）
- **正文**：Merriweather 或 Lora（可读性强的衬线体）
- **界面**：Inter（现代无衬线体）

---

## 🤝 贡献指南

### 开发新游戏

1. 在 `src/games/` 创建新目录（格式：`[编号]-[英文名]/`）
2. 添加 `story.json` 剧本文件
3. 如需自定义组件，在 `components/` 子目录实现
4. 在 Hub 的壁炉配置中注册新游戏

### 剧本 JSON 结构示例

```json
{
  "gameId": "01-chamber-of-secrets",
  "title": "密室：记忆碎片",
  "description": "一场关于记忆与欺骗的博弈",
  "startNode": "node_001",
  "nodes": {
    "node_001": {
      "type": "dialogue",
      "content": "你醒来时，头痛欲裂...",
      "choices": [
        {
          "id": "choice_001",
          "text": "环顾四周",
          "nextNode": "node_002",
          "conditions": []
        }
      ]
    }
  }
}
```

### ⚠️ Story.json 编写注意事项

#### 中文引号必须转义

在 JSON 字符串中使用中文引号（`""`）时，**必须转义为 Unicode 序列**，否则会导致 JSON 解析失败。

```json
// ❌ 错误写法（会导致 TypeScript 编译错误）
"content": "张队说："你好，我知道了。""

// ✅ 正确写法
"content": "张队说：\u201c你好，我知道了。\u201d"
```

**常用中文标点转义对照表：**

| 原字符 | Unicode 转义 | 说明 |
|--------|--------------|------|
| `"` | `\u201c` | 左双引号 |
| `"` | `\u201d` | 右双引号 |
| `'` | `\u2018` | 左单引号 |
| `'` | `\u2019` | 右单引号 |

**查找未转义引号的方法：**

```bash
# 使用 grep 查找可能有问题的行
grep -n '"[^"]*"[^"]*"' story.json
```

#### 其他注意事项

1. **字符串中的换行**：使用 `\n` 而非实际换行符
2. **特殊字符**：制表符用 `\t`，反斜杠用 `\\`
3. **中文内容**：确保文件编码为 UTF-8（无 BOM）
4. **嵌套结构**：确保所有括号、引号正确配对

---

## 📄 License

MIT License - 详见 [LICENSE](./LICENSE) 文件

---

## 🔗 相关链接

- [详细设计文档](../PROJECT_OVERVIEW.md)
- [开发计划](#) (待补充)
- [API 文档](#) (待补充)

---

**Made with 🔥 by the Floo Team**
