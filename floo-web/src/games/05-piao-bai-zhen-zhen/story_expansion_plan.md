# 漂白·少年甄珍 - 前置剧情扩充方案

## 背景
当前故事从母亲冲突直接跳到公寓→饥饿→被拐，缺少与邱枫的互动、两次拒绝招募的情节。根据原著，需要扩充前置节点，让故事更完整。

---

## 新增节点（6个叙事节点 + 1个结局节点 + 2个坏结局）

### 节点插入位置
在 `node_04_cold_hunger` 和 `node_05_song_trap` 之间插入新节点，原有节点编号顺移。

### 故事流程（修改后）

```
node_01_mother_chide (母)
    ↓
node_02_burn_award (烧奖状·离家)
    ↓
node_03_qiufeng_meet (遇邱枫·摩擦)        ← 新增
    ↓
node_04_qiufeng_missing (邱枫失踪)          ← 新增
    ↓
node_05_survive_alone (饥饿挣扎)            ← 新增
    ↓
node_06_song_refuse (宋红玉推销·拒绝)       ← 新增
    ↓
node_07_ji_refuse (吉大顺招工·拒绝)         ← 新增
    ↓
node_08_ji_recruit (吉大顺再招·上车)         ← 新增
    ↓
node_09_police_ending (报警结局·neutral)     ← 新增
    ↓
node_10_car_lock (车门锁死)                 ← 原 node_06
    ↓
... 后续原有节点编号全部顺移 +4 ...
    ↓
node_33_good_ending (好结局)                ← 原 node_29
```

---

## 各节点详细设计

### 1. node_03_qiufeng_meet
- **类型**: dialogue
- **场景**: friend_apartment
- **环境音**: room_silence
- **紧张度**: 1
- **叙述者**: 甄珍
- **内容**:
```
我投奔了同学林晓彤，借住进她和别人合租的老旧公寓。屋内另一个房间住着一个叫邱枫的姐姐。

她比我大几岁，染着黄头发，说话很直接。我们抢浴室、抢插座，她翻过我的包，我撞过她的门。

但晚上她递给我一碗泡面的时候，我觉得这个人不坏——只是和我一样，无处可去。
```
- **调查点**:
  - 触摸邱枫的毛巾 → 毛巾冰凉但潮湿，今天早上还有人用过
  - 按压邱枫的床铺 → 被褥中心凉透，枕头上有几根长发，被扯断的
  - 观察桌上的半杯水 → 水杯边缘有口红印，水面漂浮灰尘，至少放了48小时
- **线索**: clue_qiufeng_belongings
- **下一节点**: node_04_qiufeng_missing

### 2. node_04_qiufeng_missing
- **类型**: dialogue
- **场景**: friend_apartment
- **环境音**: room_silence
- **紧张度**: 2
- **叙述者**: 甄珍
- **内容**:
```
第二天早上，邱枫的房间空了。

床铺是乱的，牙刷还在杯子里，手机充电线还插在墙上。但人不见了。

我敲了敲卫生间的门，没人应。推开门——里面空空荡荡，只有她的毛巾还挂在架子上，湿漉漉的。

她去哪了？
```
- **效果**: stamina -5（体力值消耗）
- **线索**: clue_qiufeng_missing（新增线索）
- **下一节点**: node_05_survive_alone

### 3. node_05_survive_alone
- **类型**: dialogue
- **场景**: bus_station
- **环境音**: wind_cold
- **紧张度**: 2
- **叙述者**: 甄珍
- **内容**:
```
晓彤也走了。我身上一分钱也没有，连饭都吃不起。我不敢回家，只能游荡在寒冷的街头。

饥饿感已经从"饿"变成了"疼"，像有一只手在胃袋里拧。手指发麻，视线偶尔发黑——低血糖的前兆。

在公交站台旁，一张电线杆上的招聘广告吸引了我：'招高薪日结工，包吃包住，当天发钱'。
```
- **效果**: stamina -15（体力值从85降到70）
- **下一节点**: node_06_song_refuse

### 4. node_06_song_refuse
- **类型**: choice
- **场景**: bus_station
- **环境音**: city_noise
- **紧张度**: 2
- **叙述者**: 宋红玉
- **内容**:
```
'姑娘，看你冻得这样，没吃饭吧？来，先把这杯热牛奶喝了。阿姨这包吃包住，一天给八十！看你是个学生样，阿姨不骗你，走，跟阿姨上车去厂里看下。'

宋红玉满脸堆笑，手里的纸杯冒着热气。那热气扑在你脸上，你闻到了牛奶的甜香。

你的胃发出一声响亮的痉挛。但另一个声音在脑子里尖叫：'为什么偏偏找你？'
```
- **选项**:
  1. "不用了谢谢阿姨" → node_07_ji_refuse
  2. "我再考虑一下" → node_07_ji_refuse
  3. 接过牛奶 → node_07_ji_refuse（体力+10，但降低警惕）

### 5. node_07_ji_refuse
- **类型**: choice
- **场景**: bus_station
- **环境音**: city_noise
- **紧张度**: 2
- **叙述者**: 甄珍
- **内容**:
```
宋红玉走后没多久，一个高大的男人出现了。他往电线杆上贴了一张新的招聘广告，回头看了我一眼。

'小姑娘，找工作？一天一百，包吃包住。'他的声音很粗，眼睛却很亮——像在看一件货物。

我摇了摇头，往后退了一步。他的笑容僵了一下，但很快恢复了。
```
- **选项**:
  1. "我不需要" → node_08_ji_recruit
  2. "你是谁？" → node_08_ji_recruit
  3. 转身就走 → node_08_ji_recruit

### 6. node_08_ji_recruit
- **类型**: choice
- **场景**: bus_station
- **环境音**: engine_hum
- **紧张度**: 3
- **叙述者**: 甄珍
- **内容**:
```
天黑了。我蜷缩在公交站台的角落里，冷得牙齿打颤。

那个高大的男人又出现了，这次他没有贴广告，而是直接走到我面前。

'上车吧，这么冷的天在外面会死的。'他指了指停在路边的面包车，'先去看看，不满意随时可以走。'

你的手已经冻得没有知觉了。
```
- **线索**: clue_car_childlock
- **调查点**:
  - 触碰后门内侧凹槽 → 手指探入凹槽，摸到冰冷的铁丝和断裂的塑料残片——这门从里面根本打不开！
  - 偷看后视镜里的司机 → 吉大顺的右手搭在档把上，指关节粗大，手背上有新鲜的抓痕
- **选项**:
  1. "好吧，我去看看" → node_09_police_ending
  2. "我可以打个电话吗？" → node_09_police_ending
  3. "我不去了" → node_10_police_call（新增坏结局分支）

### 7. node_09_police_ending（Neutral结局）
- **类型**: ending
- **场景**: street_night
- **环境音**: city_noise
- **紧张度**: 0
- **叙述者**: 甄珍
- **内容**:
```
甄珍被送回家。母亲洪霞开门看了她一眼，冷冷地说："还知道回来？"

邱枫没有那么幸运。三天后，警方在郊外发现了她的尸体。

肉联厂的人早已消失无踪，像从没存在过。

多年后，甄珍成为了一名警察。但她再也忘不了那个在出租屋里抢浴室的姐姐。

妈妈还是那个妈妈。
```
- **效果**: setFlag('police_reported', true), setFlag('qiufeng_dead', true)
- **结局类型**: neutral（不是坏结局，是代价型结局）

---

## 新增坏结局节点

### node_10_police_call（拒绝上车→被强拉）
- **类型**: ending
- **场景**: street_night
- **环境音**: city_noise
- **紧张度**: 4
- **endingVariant**: bad
- **checkpointNodeId**: node_08_ji_recruit
- **叙述者**: 甄珍
- **内容**:
```
【 Bad End：拒绝上车 】你转身想跑，但吉大顺一把抓住了你的肩膀。他的力气大得惊人，像铁钳一样。

'敬酒不吃吃罚酒。'他的声音变得冰冷。

你被拖进了面包车。
```

### node_11_police_caught（报警后被抓→坏结局）
- **类型**: ending
- **场景**: inside_van
- **环境音**: engine_hum
- **紧张度**: 4
- **endingVariant**: bad
- **checkpointNodeId**: node_08_ji_recruit
- **叙述者**: 甄珍
- **内容**:
```
【 Bad End：暴露位置 】你掏出手机想报警，但信号从两格闪到一格，又闪了一下，彻底变为空白。

吉大顺从后视镜里看到了你的动作，猛地刹车，回头一把夺过你的手机。

'想报警？'他的眼神变得凶狠，'看来得给你点教训。'
```

---

## 新增线索

### clue_qiufeng_missing
- **类型**: anomaly
- **内容**: 邱枫的洗漱用品还在，但人凭空消失，没有留下任何痕迹。
- **发现位置**: 林晓彤出租屋

---

## 原有节点编号顺移

原有节点编号全部 **+4**（在新插入的4个节点之后）：

| 原编号 | 新编号 | 节点名称 |
|---|---|---|
| node_05_song_trap | node_12_song_trap | 宋红玉推销 |
| node_05_refuse_fail | node_12_refuse_fail | 拒绝失败 |
| node_06_car_lock | node_13_car_lock | 车门锁死 |
| node_07_signal_zero | node_14_signal_zero | 信号归零 |
| node_08_car_gamble | node_15_car_gamble | 车内抉择 |
| node_09_dark_room | node_16_dark_room | 暗室 |
| node_10_qiufeng_whisper | node_17_qiufeng_whisper | 邱枫低语 |
| node_11_forced_call | node_18_forced_call | 强迫通话 |
| node_12_bathroom_prison | node_19_bathroom_prison | 卫生间囚禁 |
| node_13_micro_investigate | node_20_micro_investigate | 微观调查 |
| node_14_water_decision | node_21_water_decision | 水淹抉择 |
| node_15_barrier_sacrifice | node_22_barrier_sacrifice | 障碍牺牲 |
| node_16_rusty_window | node_23_rusty_window | 生锈小窗 |
| node_17_first_step | node_24_first_step | 第一步 |
| node_18_ac_creak | node_25_ac_creak | 空调外机 |
| node_19_deng_peek | node_26_deng_peek | 邓立钢探头 |
| node_20_blindspot | node_27_blindspot | 盲区 |
| node_21_neighbor_glass | node_28_neighbor_glass | 邻居玻璃 |
| node_22_panic_plea | node_29_panic_plea | 恐慌求助 |
| node_23_safe_room | node_30_safe_room | 安全房间 |
| node_24_110_whisper | node_31_110_whisper | 110低语 |
| node_25_stair_escape | node_32_stair_escape | 楼梯逃生 |
| node_26_face_to_face | node_33_face_to_face | 正面遭遇 |
| node_27_beast_mode | node_34_beast_mode | 野兽模式 |
| node_28_siren_hope | node_35_siren_hope | 警笛希望 |
| node_29_good_ending | node_36_good_ending | 好结局 |
| node_bad_01_car_beaten | node_bad_01_car_beaten | 坏结局1 |
| node_bad_02_bathroom_caught | node_bad_02_bathroom_caught | 坏结局2 |
| node_bad_03_fall | node_bad_03_fall | 坏结局3 |
| node_bad_04_deng_grab | node_bad_04_deng_grab | 坏结局4 |
| node_bad_05_alley_drag | node_bad_05_alley_drag | 坏结局5 |

---

## 注意事项

1. 所有原有节点的 `nextNode` 和 `choices[].nextNode` 都需要更新为新编号
2. 所有坏结局的 `checkpointNodeId` 需要更新为新编号
3. `story.json` 中的 `startNode` 保持 `node_01_mother_chide` 不变
4. 新增节点需要与原有节点风格一致（中文叙述、体力值消耗、环境音配置）
5. `node_03_qiufeng_meet` 中的调查点内容与原有 `node_03_friend_room` 基本相同，但叙述更侧重与邱枫的互动摩擦
