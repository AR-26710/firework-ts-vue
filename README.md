# 烟花模拟器

基于 Canvas 的网页烟花模拟器，支持多种烟花类型、音效、文字烟花、插件化架构等功能。

二开自 Caleb Miller 的 [Firework Simulator v2](https://codepen.io/MillerTime/pen/XgpNwb)，在原版基础上使用 vue 与 ts 进行重构并增加了文字烟花、插件系统、中文本地化等功能。

## 功能

### 烟花类型

支持 11 种烟花类型 + 随机模式，采用插件化架构，新增类型只需在 `plugins/shells/` 目录下添加文件即可自动注册：

| 类型 | 说明                          |
| -- | --------------------------- |
| 随机 | 50% 概率菊花，50% 随机选择其他类型       |
| 菊花 | 最常见，均匀扩散，可附带闪光/花心/双色/拖尾     |
| 噼啪 | 消亡时小型爆裂 + 金色火花，75% 金色，可附带花心 |
| 交叉 | 星体消亡时十字分裂，可附带花心             |
| 落叶 | 飘落叶片 + 金色闪光拖尾，不可见主色         |
| 花卉 | 星体消亡时花朵形绽放，65% 随机色          |
| 幽灵 | 基于菊花，不可见主色 + 随机副色若隐若现，拖尾流线  |
| 马尾 | 瀑布般下垂效果 + 中等闪光，白色时附带频闪      |
| 棕榈 | 粗壮拖尾效果，50% 厚闪光 / 50% 重闪光    |
| 圆环 | 星体沿圆环分布，75% 花心，30% 流线       |
| 频闪 | 星体明灭闪烁，可附带花心                |
| 垂柳 | 极长寿命 + 下垂拖尾，不可见主色 + 柳树闪光    |

### 发射序列

采用插件化架构，新增序列只需在 `plugins/sequences/` 目录下添加文件即可自动注册：

| 序列    | 说明                          | 权重   | 冷却时间 |
| ----- | --------------------------- | ---- | ---- |
| 随机    | 按权重概率混合各种序列                 | —    | —    |
| 单发    | 每次一枚烟花（Header 模式不参与随机）      | 0.6  | —    |
| 双发    | 左右对称（0.3/0.7 位置，延迟 100ms）   | 0.8  | —    |
| 三连发   | 中央大 + 两侧小（延迟约 1 秒）          | 1.0  | —    |
| 金字塔阵型 | 从两侧向中央递进（桌面 7+1 发，移动 4+1 发） | 0.1  | —    |
| 小型弹幕  | 扇形对称展开（桌面 11 发，移动 5 发）      | 0.08 | 15 秒 |

### 文字烟花

- 输入文字后发射到天空，文字由粒子组成
- 自动检测 CJK 字符，调整间距和渲染分辨率（CJK: 0.18 × scaleFactor，非 CJK: 0.12 × scaleFactor）
- 支持"每次显示字数"设置（1\~20 字），超出部分自动分批依次发射
- 支持文字随机颜色模式
- 支持文字随机位置模式（每个字符在屏幕随机位置爆炸）
- 支持发射顺序打乱（随机位置模式下，可打乱字符发射顺序）
- 支持单簇显示全部文字（所有文字在一簇烟花中同时显示）

### 显示设置

- **烟花尺寸**：3" / 4" / 6" / 8" / 12" / 16"（6 档）
- **画质**：低 / 中 / 高（影响粒子数量和渲染细节）
- **天空光照**：无 / 微光 / 正常（爆炸时照亮背景）
- **缩放**：50% / 62% / 75% / 90% / 100% / 150% / 200%（7 档）
- **全屏模式**：浏览器全屏
- **长曝光**：实验性效果，保留长条光线（拖尾渐隐透明度极低 0.0025）
- **隐藏控制**：隐藏顶部半透明控件
- **隐藏提示**：隐藏所有操作提示信息

### 行为设置

- **自动发射**：自动编排烟花序列
- **终幕模式**：密集连续发射（32 轮快速发射，每轮间隔 170ms，结束后 6 秒冷却）
- **发射序列**：选择烟花的发射编排方式

### 音效系统

基于 Web Audio API，包含 5 种音效类型，动态调节音量和播放速率：

| 音效类型 | 文件               | 基础音量 | 播放速率范围     |
| ---- | ---------------- | ---- | ---------- |
| 升空   | lift1/2/3.mp3    | 1.0  | 0.85\~0.95 |
| 爆炸   | burst1/2.mp3     | 1.0  | 0.8\~0.9   |
| 小型爆炸 | burst-sm-1/2.mp3 | 0.25 | 0.8\~1.0   |
| 噼啪   | crackle1.mp3     | 0.2  | 1.0        |
| 小型噼啪 | crackle-sm-1.mp3 | 0.3  | 1.0        |

- 音量和播放速率随烟花尺寸动态调整
- 模拟速度低于 0.95 时自动静音
- 小型爆炸音效有 20ms 节流保护

### 国际化

- 默认语言为中文（zh-CN），支持中文和英文界面切换
- 基于 vue-i18n 实现，语言包动态懒加载
- 自动检测浏览器语言（zh 开头 → zh-CN，en 开头 → en）
- 语言偏好持久化到 localStorage

### 交互方式

**鼠标/触摸**：

- 点击画布发射烟花
- 底部拖拽调节模拟速度
- 顶部按钮区域（y < 50px）：左上角暂停，中间声音，右上偏左快捷键帮助，最右设置
- 支持多点触控追踪
- 触摸后 500ms 内忽略鼠标事件（防止重复触发）

**键盘快捷键**：

| 按键            | 功能        | 分类   |
| ------------- | --------- | ---- |
| `Space` / `P` | 暂停/继续     | 播放控制 |
| `S`           | 切换声音      | 播放控制 |
| `F`           | 切换全屏      | 播放控制 |
| `A`           | 切换自动发射    | 发射控制 |
| `W`           | 切换终幕模式    | 发射控制 |
| `←` / `→`     | 调整发射序列    | 发射控制 |
| `↑` / `↓`     | 按顺序切换烟花类型 | 画面效果 |
| `L`           | 切换长曝光     | 画面效果 |
| `H`           | 切换隐藏控制    | 画面效果 |
| `T`           | 切换隐藏提示    | 画面效果 |
| `+` / `-`     | 调整模拟速度    | 画面效果 |
| `E`           | 切换文字烟花    | 文字烟花 |
| `R`           | 切换文字随机颜色  | 文字烟花 |
| `G`           | 切换文字随机位置  | 文字烟花 |
| `D`           | 切换发射顺序打乱  | 文字烟花 |
| `C`           | 切换单簇显示    | 文字烟花 |
| `O`           | 切换设置菜单    | 界面   |
| `/`           | 显示快捷键帮助   | 界面   |

部分快捷键有前置条件：`W` 需开启自动发射，`←`/`→` 需开启自动发射且非终幕模式，`R`/`G`/`C` 需开启文字烟花，`D` 需同时开启文字烟花和随机位置。

### 设备适配

- 移动端（viewport ≤ 640px）：默认缩放 0.9，默认尺寸 2"，弹幕数量减半
- 桌面端（viewport > 800px）：默认缩放 1.0，默认尺寸 3"
- Header 模式（桌面 + 高度 < 300px）：默认缩放 0.75，默认尺寸 1.2"，隐藏控件
- 高端设备自动选择高画质（视口 ≤ 1024 需 4 核，> 1024 需 8 核）
- 高 DPI 屏幕适配
- 画布最大分辨率限制为 8K（7680 × 4320）

## 技术栈

- TypeScript
- Vue 3
- Vite
- Canvas 2D
- SCSS
- Web Audio API
- vue-i18n
- @iconify/vue
- Vitest
- ESLint + Prettier
- Husky

## 架构

```
src/
├── main.ts                    # 应用入口
├── game-loop.ts               # 主循环（舞台初始化、resize、输入绑定）
├── env.d.ts                   # 环境类型声明
├── audio/
│   └── sound-manager.ts       # 音效管理器 (Web Audio API)
├── core/
│   ├── constants.ts           # 全局常量（设备检测、画质、颜色系统）
│   ├── math.ts                # 数学工具库（距离、角度、向量分解、随机）
│   ├── stage.ts               # Canvas 舞台封装 (含 Ticker 帧调度器)
│   ├── stages.ts              # 双层 Canvas 实例 (trails + main)
│   ├── state.ts               # 可变全局状态（模拟速度、舞台尺寸、画质）
│   └── fscreen.ts             # 全屏 API 跨浏览器兼容封装
├── i18n/
│   ├── index.ts               # i18n 初始化（动态懒加载、浏览器语言检测）
│   └── locales/
│       ├── en.ts              # 英文语言包
│       └── zh-CN.ts           # 中文语言包
├── input/
│   ├── keyboard-handler.ts    # 键盘事件处理
│   ├── pointer-handler.ts     # 鼠标/触摸指针事件处理
│   └── shortcuts.ts           # 集中式快捷键注册表
├── physics/
│   └── updater.ts             # 物理引擎 (空气阻力、重力、旋转、火花生成、生命周期)
├── renderer/
│   └── renderer.ts            # Canvas 渲染器 (双层画布绘制、天空光照、lighten 混合)
├── simulation/
│   ├── particles/             # 粒子系统
│   │   ├── star.ts            # 星体粒子
│   │   ├── spark.ts           # 火花粒子
│   │   ├── burst-flash.ts     # 爆炸闪光
│   │   ├── effects.ts         # 粒子效果
│   │   ├── types.ts           # 粒子类型定义
│   │   └── utils.ts           # 粒子工具函数
│   ├── plugins/               # 插件系统 (自动发现)
│   │   ├── index.ts           # 插件系统入口与初始化
│   │   ├── plugin-manager.ts  # 插件管理器 (注册/初始化/卸载/生命周期)
│   │   ├── types.ts           # 插件接口定义 (FireworkPlugin/ShellPluginEntry/SequencePluginEntry)
│   │   ├── shell-plugin-helper.ts # 烟花插件工具 (花心颜色生成)
│   │   ├── shells/            # 烟花类型插件目录
│   │   │   ├── index.ts       # 自动发现入口 (import.meta.glob)
│   │   │   ├── crackle.ts
│   │   │   ├── crossette.ts
│   │   │   ├── crysanthemum.ts
│   │   │   ├── falling-leaves.ts
│   │   │   ├── floral.ts
│   │   │   ├── ghost.ts
│   │   │   ├── horsetail.ts
│   │   │   ├── palm.ts
│   │   │   ├── random.ts
│   │   │   ├── ring.ts
│   │   │   ├── strobe.ts
│   │   │   └── willow.ts
│   │   └── sequences/         # 发射序列插件目录
│   │       ├── index.ts       # 自动发现入口 (import.meta.glob)
│   │       ├── double.ts
│   │       ├── pyramid.ts
│   │       ├── random.ts
│   │       ├── single.ts
│   │       ├── small-barrage.ts
│   │       └── triple.ts
│   ├── sequences/             # 序列调度
│   │   ├── dispatcher.ts      # 主序列调度器 (首次/终幕/指定/随机)
│   │   ├── sequence-registry.ts # 序列注册表 (权重选择/冷却检查)
│   │   └── types.ts           # 序列类型定义
│   ├── shell-configs.ts       # 烟花弹配置查询和随机选择
│   ├── shell-launch.ts        # 烟花弹发射逻辑 (含文字烟花分批发射)
│   ├── shell-registry.ts      # 烟花弹类型注册表
│   ├── shell-utils.ts         # 烟花弹工具 (ShellConfig 接口、CJK 检测、位置约束)
│   └── shells.ts              # Shell 类 (升空 + 爆炸核心逻辑)
├── store/
│   ├── store.ts               # 集中式状态管理 (观察者模式 + localStorage 持久化)
│   ├── actions.ts             # 状态操作函数
│   └── selectors.ts           # 状态选择器
├── styles/
│   ├── style.scss             # 主样式入口
│   ├── _base.scss             # 基础样式
│   ├── _variables.scss        # SCSS 变量
│   └── _utils.scss            # 工具样式
├── tests/
│   ├── plugin-integration.test.ts  # 插件集成测试
│   ├── plugin-manager.test.ts      # 插件管理器测试
│   ├── sequence-registry.test.ts   # 序列注册表测试
│   ├── shell-registry.test.ts      # 烟花注册表测试
│   └── setup.ts                    # 测试配置
└── ui/
    ├── App.vue                # Vue 根组件 (Canvas 容器 + 子组件编排)
    ├── vue-store.ts           # Vue 响应式状态桥接 (reactive + store 订阅)
    ├── help-content.ts        # 帮助文本内容映射
    └── components/
        ├── Controls.vue       # 顶部控制栏 (暂停/声音/帮助/设置)
        ├── LoadingInit.vue    # 加载初始化组件
        ├── TextInputBar.vue   # 文字烟花输入栏
        ├── Toast.vue          # Toast 提示组件
        ├── form/              # 表单组件
        │   ├── FormCheckbox.vue
        │   ├── FormNumberInput.vue
        │   └── FormSelect.vue
        ├── help/              # 帮助组件
        │   ├── HelpModal.vue
        │   └── ShortcutsHelp.vue
        └── settings/         # 设置面板
            ├── Settings.vue
            ├── BehaviorTab.vue
            ├── DisplayTab.vue
            ├── LanguageTab.vue
            └── TextFireworkTab.vue
```

### 插件系统

项目采用插件化架构管理烟花类型和发射序列，核心设计：

- **自动发现**：通过 Vite 的 `import.meta.glob` 自动扫描插件目录，新增插件只需添加文件
- **注册表模式**：`shell-registry.ts` 和 `sequence-registry.ts` 提供声明式注册
- **插件管理器**：`plugin-manager.ts` 管理插件生命周期（注册/初始化/卸载）
- **零侵入扩展**：新增烟花类型或发射序列无需修改任何核心代码
- **注册顺序**：先非 Random 烟花 → Random 烟花 → 发射序列，确保 Random 能获取完整类型列表

### 双层 Canvas 渲染

项目使用双层 Canvas 架构实现烟花渲染：

- **trails-canvas**：拖尾渐隐层，每帧以半透明黑色覆盖实现渐隐效果（正常模式透明度 0.175 × speed，长曝光模式 0.0025）
- **main-canvas**：当前帧明亮粒子层，使用 `lighten` 混合模式绘制星体和火花

### 状态管理

采用观察者模式 + localStorage 持久化的集中式状态管理：

- **StoreState**：包含 `paused`、`soundEnabled`、`settingOpen`、`openHelpTopic`、`fullscreen` 和 `config`
- **StoreConfig**：所有用户可调配置项（画质、烟花类型、尺寸、自动发射、终幕、天空光照、缩放、文字烟花等）
- **持久化**：localStorage 键名 `cm_fireworks_data`，schema 版本 `1.7`
- **Vue 桥接**：`vue-store.ts` 通过 `reactive` + store 订阅实现 Vue 响应式

## 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建
pnpm build

# 预览构建产物
pnpm preview

# 运行测试
pnpm test

# 运行测试（监听模式）
pnpm test:watch

# 类型检查
pnpm typecheck

# 代码检查
pnpm lint

# 代码检查（自动修复）
pnpm lint:fix

# 格式化代码
pnpm format

# 检查代码格式
pnpm format:check
```

## 许可证

[MIT License](LICENSE)

## 致谢

- 感谢 [Caleb Miller](https://cmiller.tech/) 的倾情打造
- 二开版本基于 [Firework Simulator v2](https://codepen.io/MillerTime/pen/XgpNwb)

