# Floo Matrix 改进计划

## 一、当前问题分析

### 1. 剧本问题（核心问题）

**问题描述**：剧本浓缩感太强，没有小说的感觉

**具体表现**：
- 节点过渡太快，缺少环境描写、心理活动、人物互动细节
- 叙述像流水账，如"你继续你的配送工作"、"今天发生的事情让你更加坚定了一个想法"
- 对白生硬，对话缺乏个性和情感张力
- 选择点铺垫不足，重要抉择前缺少足够的心理挣扎和氛围渲染

**示例对比**：

当前写法（浓缩型）：
```
第四天。
你继续你的配送工作，但这一次，你开始留意路上遇到的人和事。
当你经过一座桥时，你看到一个流浪老人站在桥边，似乎想要跳下去。
```

改进后写法（小说型）：
```
第四天，天色阴沉，铅灰色的云层压得很低，像是随时会塌下来。

你骑着电动车穿行在城市的街道上，风从耳边呼啸而过，带着初秋的凉意。这已经是循环的第四天了，你开始习惯这种奇怪的生活——每天醒来，都是同一天的开始，但你的记忆却在不断累积。

路过一座桥时，你下意识地放慢了速度。

桥边站着一个老人，佝偻着背，双手扶着栏杆，像是在眺望远处的江面。他穿着一件洗得发白的旧外套，裤脚沾满了泥点。风掀起他稀疏的白发，你突然注意到他的站位——离栏杆太近了，近到让你心里一紧。

你刹住车，脚撑在地上，远远地看着他。

老人没有动，但你看到他的手指在栏杆上轻轻敲击着，像是在犹豫什么。江水在桥下奔流，发出哗哗的声响，盖过了城市的喧嚣。

你的直觉告诉你：这个人想跳下去。
```

### 2. 读者体感差，没有身临其境的感觉

**问题描述**：
- 当前只有纯文本和静态背景，缺乏沉浸感
- 没有打字机效果、文字动画
- 缺乏环境音效的变化
- 没有视觉上的场景细节

### 3. 推背感差，推理感没有

**问题描述**：
- 线索发现后只是简单记录，没有主动推理的机会
- 推理板只在逃出魔窟最终抉择前使用，其他游戏缺乏推理环节
- 线索之间没有关联展示

### 4. 只有字，缺乏多媒体元素

**问题描述**：
- 当前完全没有图片或视频
- 音效也很基础
- 缺乏环境氛围音和人物语音

---

## 二、改进方案

### 1. 剧本改进（核心）

**改进方向**：
- **增加沉浸式描写**：环境氛围（天气、光线、声音、气味）、心理活动、人物微表情
- **调整叙事节奏**：增加过渡段落，让玩家有时间消化和思考
- **提升对白质量**：让人物说话更自然、更有个性
- **强化选择点渲染**：增加内心独白和两难困境的描写

**实施方式**：
- 扩展 `story.json` 中每个节点的 `content` 字段
- 增加中间过渡节点，放慢节奏
- 为关键选择点增加铺垫节点

**文本量预估**：
- 改进后每个节点的文本量增加2-3倍
- 增加过渡节点约30-50个
- 总体剧本字数从约2万字增加到约5-6万字

### 2. 沉浸感改进（视觉）

**改进方案**：为每个场景准备一张AI生成的插画作为背景

**资源需求**：
- 16个场景各一张背景图（推荐尺寸：1280x720或1920x1080）
- 放置在 `public/backgrounds/` 目录
- 文件命名：`{scene_id}.jpg` 或 `{scene_id}.webp`

**技术实现**：
- 修改 `SceneBackdrop.tsx` 支持背景图显示
- 保留现有的渐变+暗角效果作为叠加层
- 背景图 + 暗角叠加，增强氛围感

**场景列表**：
| 场景ID | 描述 | 游戏 |
|--------|------|------|
| basement | 阴暗潮湿的地下室 | 逃出魔窟 |
| forest | 黑暗的原始森林 | 逃出魔窟 |
| cabin | 温暖但诡异的木屋 | 逃出魔窟 |
| station | 冷清的车站 | 逃出魔窟 |
| reveal | 暗红色的真相揭示场景 | 逃出魔窟 |
| bus | 45路公交车内 | 开端 |
| convention | 漫展现场 | 开端 |
| police_station | 警察局 | 开端 |
| factory | 化工厂 | 开端 |
| bridge | 跨江大桥 | 开端 |
| courier_station | 快递站 | 送不到 |
| city_street | 城市街道 | 送不到 |
| bridge_side | 桥边 | 送不到 |
| residential | 居民区 | 送不到 |
| apartment | 公寓 | 送不到 |
| hospital | 医院 | 送不到 |

### 3. 推理机制改进

**改进方案**：线索关联 + 可视化图谱

**具体实现**：

#### 3.1 升级推理板（ReasoningBoard.tsx）
- 支持线索拖拽关联到人物
- 增加推理链验证逻辑
- 显示玩家的推理过程和结论

#### 3.2 增强人物关系图谱（RelationshipGraph.tsx）
- 在人物节点上显示关联的线索
- 线索之间的关联关系可视化
- 支持从线索反向查看关联人物

#### 3.3 全游戏支持
- 目前推理板只在逃出魔窟使用
- 改进后所有游戏都能使用推理板
- 在 story.json 中增加 `hasReasoningBoard: true` 配置

### 4. 音效增强

**改进方案**：环境氛围音 + 交互音效

**资源需求**：

#### 4.1 环境氛围音（BGM）
| 场景 | 推荐音效 |
|------|----------|
| basement | 低沉的嗡鸣声、滴水声 |
| forest | 风声、树叶沙沙声、远处的狼嚎 |
| cabin | 壁炉燃烧声、木头嘎吱声 |
| bus | 引擎声、乘客低语、报站声 |
| convention | 人群嘈杂声、音乐声 |
| police_station | 键盘敲击声、对讲机声 |
| factory | 机器轰鸣声 |
| bridge | 江水声、风声 |
| courier_station | 包裹搬运声、电话铃声 |
| city_street | 车流声、行人脚步声 |
| apartment | 空调声、隔壁电视声 |
| hospital | 心电监护仪声、推车声 |

#### 4.2 交互音效（SFX）
| 事件 | 推荐音效 |
|------|----------|
| 调查 | 翻找声、纸张声 |
| 发现线索 | 线索发现音（已有） |
| 做出选择 | 选择确认音 |
| 获得道具 | 道具获取音 |
| 坏结局 | 死亡音效（已有） |
| 好结局 | 成功音效（已有） |
| 循环重置 | 时间倒流音效（已有） |

---

## 三、实施优先级

| 优先级 | 任务 | 预计工作量 |
|--------|------|------------|
| P0 | 剧本改进（送不到） | 2-3天 |
| P1 | 沉浸感改进（场景背景图） | 1-2天 |
| P2 | 推理机制改进 | 2-3天 |
| P3 | 音效增强 | 1-2天 |
| P4 | 剧本改进（逃出魔窟） | 2-3天 |
| P5 | 剧本改进（开端） | 3-4天 |

---

## 四、技术实现细节

### 4.1 story.json 扩展

在 `StoryNode` 类型中增加字段：

```typescript
interface StoryNode {
  // ... 现有字段
  
  /** 背景图路径（可选，优先于渐变背景） */
  backgroundImage?: string
  
  /** 打字机效果速度（ms/字符，默认30） */
  typeWriterSpeed?: number
  
  /** 是否显示推理板 */
  showReasoningBoard?: boolean
}
```

### 4.2 SceneBackdrop 升级

```typescript
interface SceneBackdropProps {
  scene?: SceneId
  tensionLevel?: number
  backgroundImage?: string  // 新增
}
```

### 4.3 音效管理器扩展

在 `audioManager.ts` 中增加：

```typescript
// 环境音注册
registerAmbientSounds(gameId: string, sounds: Record<string, string>)

// 交互音效注册
registerInteractionSounds(sounds: Record<string, string>)

// 播放交互音效
playInteraction(key: string)
```

---

## 五、验收标准

### 5.1 剧本改进
- [ ] 每个节点文本量增加2-3倍
- [ ] 增加环境描写、心理活动、人物互动细节
- [ ] 关键选择点有充分的铺垫和渲染
- [ ] 对白自然、有个性
- [ ] 节奏有快慢变化，不再像流水账

### 5.2 沉浸感改进
- [ ] 16个场景各有一张背景图
- [ ] 背景图与暗角效果叠加显示
- [ ] 场景切换时有平滑过渡

### 5.3 推理机制改进
- [ ] 推理板支持线索拖拽关联
- [ ] 人物关系图谱显示关联线索
- [ ] 所有游戏都能使用推理板

### 5.4 音效增强
- [ ] 每个场景有对应的环境氛围音
- [ ] 关键交互有反馈音效
- [ ] 音效切换平滑自然

---

## 六、资源清单

### 6.1 背景图（16张）
- public/backgrounds/basement.webp
- public/backgrounds/forest.webp
- public/backgrounds/cabin.webp
- public/backgrounds/station.webp
- public/backgrounds/reveal.webp
- public/backgrounds/bus.webp
- public/backgrounds/convention.webp
- public/backgrounds/police_station.webp
- public/backgrounds/factory.webp
- public/backgrounds/bridge.webp
- public/backgrounds/courier_station.webp
- public/backgrounds/city_street.webp
- public/backgrounds/bridge_side.webp
- public/backgrounds/residential.webp
- public/backgrounds/apartment.webp
- public/backgrounds/hospital.webp

### 6.2 环境音（12个）
- public/audio/ambient/basement.wav
- public/audio/ambient/forest.wav
- public/audio/ambient/cabin.wav
- public/audio/ambient/bus.wav
- public/audio/ambient/convention.wav
- public/audio/ambient/police_station.wav
- public/audio/ambient/factory.wav
- public/audio/ambient/bridge.wav
- public/audio/ambient/courier_station.wav
- public/audio/ambient/city_street.wav
- public/audio/ambient/apartment.wav
- public/audio/ambient/hospital.wav

### 6.3 交互音效（6个）
- public/audio/sfx/investigate.wav
- public/audio/sfx/choice_select.wav
- public/audio/sfx/item_get.wav
- public/audio/sfx/clue.wav（已有）
- public/audio/sfx/bad-ending-impact.wav（已有）
- public/audio/sfx/good-ending-chime.wav（已有）

---

## 七、风险与注意事项

1. **剧本工作量大**：改进三个游戏的剧本需要大量写作工作，建议先从送不到开始试点
2. **背景图版权**：使用AI生成的图片需确保版权合规
3. **音效质量**：免费音效可能质量参差不齐，建议使用专业音效库
4. **性能影响**：背景图和音效会增加资源加载时间，需要做好懒加载

---

## 八、下一步行动

1. 确认改进范围（先改哪个游戏）
2. 确认背景图风格（写实/暗黑/水彩/像素）
3. 开始实施改进
