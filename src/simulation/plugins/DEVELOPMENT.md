# 烟花插件开发指南

本文档介绍如何为烟花模拟器开发新的烟花类型和发射序列插件。

## 目录

- [架构概览](#架构概览)
- [快速开始](#快速开始)
- [开发烟花类型插件](#开发烟花类型插件)
  - [ShellConfig 参数详解](#shellconfig-参数详解)
  - [颜色系统](#颜色系统)
  - [闪光类型](#闪光类型)
  - [特殊效果标志](#特殊效果标志)
  - [完整示例](#完整示例)
- [开发发射序列插件](#开发发射序列插件)
  - [序列执行函数](#序列执行函数)
  - [随机权重与调度](#随机权重与调度)
  - [冷却机制](#冷却机制)
  - [发射位置与尺寸工具](#发射位置与尺寸工具)
  - [完整示例](#完整示例-1)
- [添加国际化翻译](#添加国际化翻译)
- [更新测试](#更新测试)
- [开发检查清单](#开发检查清单)
- [常见问题](#常见问题)

---

## 架构概览

```
plugins/
├── index.ts                 # 插件系统入口，初始化与公共 API
├── plugin-manager.ts        # 插件管理器（注册/初始化/卸载/生命周期）
├── types.ts                 # 插件接口定义（FireworkPlugin / ShellPluginEntry / SequencePluginEntry）
├── shell-plugin-helper.ts   # 烟花插件开发辅助工具
├── shells/                  # 烟花类型插件目录
│   ├── index.ts             # 自动发现入口（import.meta.glob）
│   ├── crackle.ts           # 示例：噼啪
│   ├── crysanthemum.ts      # 示例：菊花
│   └── ...
└── sequences/               # 发射序列插件目录
    ├── index.ts             # 自动发现入口（import.meta.glob）
    ├── single.ts            # 示例：单发
    ├── double.ts            # 示例：双发
    └── ...
```

**核心机制**：通过 Vite 的 `import.meta.glob` 自动扫描 `shells/` 和 `sequences/` 目录下的 `.ts` 文件，提取 `default export` 的 `FireworkPlugin` 对象并注册。**新增插件只需在对应目录下添加文件，无需修改任何核心代码。**

**注册顺序**：
1. 非 Random 烟花类型插件
2. Random 烟花类型插件（依赖其他类型已注册）
3. 发射序列插件

---

## 快速开始

### 最小烟花类型插件

在 `shells/` 目录下创建 `.ts` 文件：

```ts
import type { FireworkPlugin } from '../types';
import { COLOR, randomColor } from '@/core/constants';
import type { ShellConfig } from '../../shell-utils';

const myShell = (size: number = 1): ShellConfig => ({
	shellSize: size,
	spreadSize: 300 + size * 100,
	starLife: 900 + size * 200,
	color: randomColor(),
	glitter: 'light',
	glitterColor: COLOR.White,
});

export default {
	id: 'shell-my-type',
	description: '我的自定义烟花类型',
	shells: [{ name: 'MyType', factory: myShell }],
} satisfies FireworkPlugin;
```

### 最小发射序列插件

在 `sequences/` 目录下创建 `.ts` 文件：

```ts
import type { FireworkPlugin } from '../types';
import { Shell } from '../../shells';
import { shellFromConfig } from '../../shell-configs';
import { getRandomShellSize } from '../../shell-utils';

function seqMySequence(): number {
	const size = getRandomShellSize();
	const shell = new Shell(shellFromConfig(size.size));
	shell.launch(size.x, size.height);
	return 900 + Math.random() * 600 + shell.starLife;
}

export default {
	id: 'sequence-my-sequence',
	description: '我的自定义发射序列',
	sequences: [{
		name: 'My Sequence',
		execute: seqMySequence,
		randomWeight: 0.2,
	}],
} satisfies FireworkPlugin;
```

---

## 开发烟花类型插件

### ShellConfig 参数详解

`ShellConfig` 是烟花弹的核心配置接口，定义在 `shell-utils.ts` 中：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `shellSize` | `number` | ✅ | — | 基础尺寸，影响扩散范围和星体寿命 |
| `spreadSize` | `number` | ✅ | — | 爆炸扩散半径（像素），通常 `300 + size * 100` |
| `starLife` | `number` | ✅ | — | 星体基础寿命（毫秒），通常 `900 + size * 200` |
| `color` | `string \| string[]` | ✅ | — | 主颜色，支持单色或双色数组 |
| `glitter` | `string` | ✅ | — | 闪光类型（见下方闪光类型表） |
| `starLifeVariation` | `number` | ❌ | `0.125` | 星体寿命随机变化比例 |
| `starDensity` | `number` | ❌ | `1` | 星体密度系数，影响星体数量 |
| `starCount` | `number` | ❌ | 自动计算 | 星体数量，若未指定则根据 `spreadSize` 和 `starDensity` 自动计算 |
| `glitterColor` | `string` | ❌ | 主颜色 | 闪光颜色 |
| `secondColor` | `string \| null` | ❌ | `null` | 副颜色，用于星体颜色过渡效果 |
| `pistil` | `boolean` | ❌ | `false` | 是否显示花心（内层小烟花） |
| `pistilColor` | `string \| false` | ❌ | `false` | 花心颜色 |
| `streamers` | `boolean` | ❌ | `false` | 是否显示拖尾流线效果 |
| `ring` | `boolean` | ❌ | `false` | 是否为环形烟花 |
| `crossette` | `boolean` | ❌ | `false` | 星体消亡时十字分裂 |
| `floral` | `boolean` | ❌ | `false` | 星体消亡时花朵形绽放 |
| `fallingLeaves` | `boolean` | ❌ | `false` | 星体消亡时飘落叶片效果 |
| `crackle` | `boolean` | ❌ | `false` | 星体消亡时小型爆裂 |
| `horsetail` | `boolean` | ❌ | `false` | 星体跟随彗星轨迹下落 |
| `strobe` | `boolean` | ❌ | `false` | 启用频闪效果 |
| `strobeColor` | `string \| null` | ❌ | `null` | 频闪颜色 |
| `customColors` | `Record<string, string>` | ❌ | — | 自定义颜色映射表，仅作用于当前烟花类型 |
| `useSystemColors` | `boolean` | ❌ | `true` | 是否使用系统内置颜色。设为 `false` 时仅使用 `customColors` |

### 颜色系统

可用颜色定义在 `@/core/constants` 的 `COLOR` 对象中：

| 颜色名 | 十六进制值 |
|--------|-----------|
| `COLOR.Red` | `#ff0043` |
| `COLOR.Green` | `#14fc56` |
| `COLOR.Blue` | `#1e7fff` |
| `COLOR.Purple` | `#e60aff` |
| `COLOR.Gold` | `#ffbf36` |
| `COLOR.White` | `#ffffff` |

特殊值：
- `INVISIBLE`（`'_INVISIBLE_'`）：不可见颜色，用于隐藏主色体，仅显示闪光/副色

颜色工具函数（从 `@/core/constants` 导入）：

```ts
randomColor()                          // 随机颜色
randomColor({ limitWhite: true })      // 限制白色出现概率（60% 概率重抽）
randomColor({ notSame: true })         // 避免与上次相同
randomColor({ notColor: COLOR.White }) // 排除特定颜色
whiteOrGold()                          // 50% 金色 / 50% 白色
```

花心颜色工具（从 `../shell-plugin-helper` 导入）：

```ts
makePistilColor(shellColor)        // 根据主颜色自动生成花心颜色
makePistilColor(shellColor, pool)  // 支持自定义颜色池
```

### 自定义颜色系统

支持在新建烟花类型时定义自定义颜色，无需修改 `@/core/constants` 目录下的文件。

**核心概念**：

- `customColors`：自定义颜色映射表，格式为 `{ 颜色名: 十六进制代码 }`，仅作用于当前烟花类型
- `useSystemColors`：布尔值，控制是否使用系统内置颜色（默认 `true`）
- 颜色优先级：启用系统颜色时，自定义颜色与系统颜色合并使用；禁用时，仅使用自定义颜色

**颜色池工具函数**（从 `@/core/constants` 导入）：

```ts
import { createColorPool } from '@/core/constants';

// 创建仅包含自定义颜色的颜色池（禁用系统颜色）
const pool = createColorPool(
	{ Pink: '#ff69b4', Cyan: '#00ffff', Lime: '#39ff14' },
	false  // useSystemColors = false
);

// 创建合并系统颜色和自定义颜色的颜色池
const pool2 = createColorPool({ Coral: '#ff6b6b' }, true);  // 默认值，可省略

// 在颜色池中随机选取颜色
const color = randomColor(undefined, pool.codes);
const color2 = randomColor({ limitWhite: true }, pool.codes);
```

**自定义颜色示例**（参见 `neon.ts`）：

```ts
import type { FireworkPlugin } from '../types';
import { randomColor, createColorPool } from '@/core/constants';
import type { ShellConfig } from '../../shell-utils';
import { makePistilColor } from '../shell-plugin-helper';

const NEON_COLORS = {
	Pink: '#ff69b4',
	Cyan: '#00ffff',
	Lime: '#39ff14',
	Orange: '#ff6600',
	Magenta: '#ff00ff',
	Yellow: '#ffff00',
};

const neonShell = (size: number = 1): ShellConfig => {
	const pool = createColorPool(NEON_COLORS, false);

	const singleColor = Math.random() < 0.6;
	const color = singleColor
		? randomColor({ limitWhite: true }, pool.codes)
		: [randomColor(undefined, pool.codes), randomColor({ notSame: true }, pool.codes)];

	const pistil = singleColor && Math.random() < 0.5;
	const pistilColor = pistil
		? makePistilColor(typeof color === 'string' ? color : color[0], pool)
		: undefined;

	return {
		shellSize: size,
		spreadSize: 280 + size * 100,
		starLife: 850 + size * 200,
		starDensity: 1.2,
		color,
		glitter: Math.random() < 0.4 ? 'light' : '',
		glitterColor: '#ffffff',
		pistil,
		pistilColor: pistilColor || false,
		streamers: Math.random() < 0.25,
		customColors: NEON_COLORS,
		useSystemColors: false,
	};
};

export default {
	id: 'shell-neon',
	description: '霓虹烟花类型（仅使用自定义颜色）',
	shells: [{ name: 'Neon', factory: neonShell }],
} satisfies FireworkPlugin;
```

**注意事项**：
- 自定义颜色会在烟花爆炸时自动注册到全局渲染表，不影响其他烟花类型
- 如果不设置 `useSystemColors: false`，自定义颜色将与系统内置颜色合并使用
- `makePistilColor` 和 `whiteOrGold` 支持传入 `ColorPool` 参数以适配自定义颜色

### 闪光类型

`glitter` 字段控制星体拖尾闪光效果，不同类型有不同的火花频率、速度和寿命：

| 值 | 效果描述 | 典型用途 |
|----|---------|---------|
| `''` | 无闪光 | 牡丹、花卉等纯色球形 |
| `'light'` | 轻微闪光 | 菊花、噼啪、频闪 |
| `'medium'` | 中等闪光 | 马尾、落叶 |
| `'heavy'` | 重闪光 | 棕榈、锦冠 |
| `'thick'` | 厚闪光 | 棕榈（粗壮拖尾） |
| `'streamer'` | 流线闪光 | 菊花拖尾流线 |
| `'willow'` | 柳型闪光 | 垂柳、冠 |

### 特殊效果标志

这些布尔标志会改变星体消亡时的行为：

| 标志 | 消亡效果 | 音效 |
|------|---------|------|
| `crossette` | 十字分裂为多个小星体 | 小型噼啪声 |
| `crackle` | 小型爆裂 + 金色火花 | 噼啪声 |
| `floral` | 花朵形绽放 | 无 |
| `fallingLeaves` | 飘落叶片 + 金色闪光拖尾 | 无 |

其他效果标志：
- `ring`：星体沿圆环分布而非球形扩散
- `horsetail`：星体跟随彗星轨迹下落，形成瀑布效果
- `strobe`：星体明灭闪烁
- `streamers`：额外添加白色流线拖尾

### 完整示例

参考现有插件的实现模式：

**简单型**（固定配置）— 参见 `willow.ts`：

```ts
import type { FireworkPlugin } from '../types';
import { COLOR, INVISIBLE } from '@/core/constants';
import type { ShellConfig } from '../../shell-utils';

const willowShell = (size: number = 1): ShellConfig => ({
	shellSize: size,
	spreadSize: 300 + size * 100,
	starDensity: 0.6,
	starLife: 3000 + size * 300,
	glitter: 'willow',
	glitterColor: COLOR.Gold,
	color: INVISIBLE,
});

export default {
	id: 'shell-willow',
	description: '柳树烟花类型',
	shells: [{ name: 'Willow', factory: willowShell, fastBlacklisted: true }],
} satisfies FireworkPlugin;
```

**复杂型**（随机变体）— 参见 `crysanthemum.ts`：

```ts
import type { FireworkPlugin } from '../types';
import { COLOR, randomColor, whiteOrGold } from '@/core/constants';
import { isLowQuality, isHighQuality } from '@/core/state';
import type { ShellConfig } from '../../shell-utils';
import { makePistilColor } from '../shell-plugin-helper';

const crysanthemumShell = (size: number = 1): ShellConfig => {
	const glitter = Math.random() < 0.25;
	const singleColor = Math.random() < 0.72;
	const color = singleColor
		? randomColor({ limitWhite: true })
		: [randomColor(), randomColor({ notSame: true })];
	const pistil = singleColor && Math.random() < 0.42;
	const pistilColor = pistil && makePistilColor(color as string);
	let starDensity = glitter ? 1.1 : 1.25;
	if (isLowQuality) starDensity *= 0.8;
	if (isHighQuality) starDensity = 1.2;
	return {
		shellSize: size,
		spreadSize: 300 + size * 100,
		starLife: 900 + size * 200,
		starDensity,
		color,
		glitter: glitter ? 'light' : '',
		glitterColor: whiteOrGold(),
		pistil,
		pistilColor,
	};
};

export default {
	id: 'shell-crysanthemum',
	description: '菊花烟花类型',
	shells: [{ name: 'Crysanthemum', factory: crysanthemumShell }],
} satisfies FireworkPlugin;
```

**基于已有类型变体** — 参见 `ghost.ts`：

```ts
import type { FireworkPlugin } from '../types';
import { COLOR, INVISIBLE, randomColor } from '@/core/constants';
import type { ShellConfig } from '../../shell-utils';
import { crysanthemumShell } from './crysanthemum';

const ghostShell = (size: number = 1): ShellConfig => {
	const shell = crysanthemumShell(size);
	shell.starLife *= 1.5;
	shell.streamers = true;
	shell.color = INVISIBLE;
	shell.secondColor = randomColor({ notColor: COLOR.White });
	shell.glitter = '';
	return shell;
};

export default {
	id: 'shell-ghost',
	description: '幽灵烟花类型',
	shells: [{ name: 'Ghost', factory: ghostShell }],
} satisfies FireworkPlugin;
```

---

## 开发发射序列插件

### 序列执行函数

序列的核心是 `execute` 函数，负责创建并发射烟花弹，返回下一次调度的延迟时间（毫秒）。

```ts
function seqMySequence(): number {
	// 1. 创建烟花弹
	// 2. 调用 shell.launch(x, height) 发射
	// 3. 返回延迟时间（毫秒）
	return 2000;
}
```

**关键约定**：
- `x`：水平位置，0~1 归一化坐标（0 = 最左，1 = 最右）
- `height`：垂直高度，0~1 归一化坐标（0 = 最低，1 = 最高）
- 使用 `setTimeout` 实现多发烟花之间的延迟
- 返回值是调度器下次调用此序列的等待时间

### 随机权重与调度

当用户选择"随机"发射序列时，调度器按以下逻辑选择序列：

1. 获取所有设置了 `randomWeight` 的序列，按权重升序排列
2. 生成随机数 `rand`（0~1）
3. 依次判断 `rand < entry.randomWeight`，命中则执行
4. 命中后检查冷却条件和前置条件

**权重设置建议**：

| 权重范围 | 适用场景 | 现有示例 |
|---------|---------|---------|
| `0.05 ~ 0.1` | 罕见、华丽的序列 | 小型弹幕 `0.08` |
| `0.1 ~ 0.2` | 较少出现的序列 | 波浪 `0.12`、十字爆发 `0.15` |
| `0.2 ~ 0.5` | 中等频率的序列 | — |
| `0.5 ~ 1.0` | 常见序列 | 单发 `0.6`、双发 `0.8`、三连发 `1.0` |

**注意**：权重不是概率，而是阈值。调度器按升序依次判断 `rand < weight`，因此较小权重的序列会先被判断。如果所有权重都未命中，调度器返回 0（立即重试）。

### 冷却机制

对于视觉效果强烈或性能消耗较大的序列，应设置 `cooldown`（冷却时间，毫秒），防止短时间内被频繁调用：

```ts
sequences: [{
	name: 'Small Barrage',
	execute: seqSmallBarrage,
	randomWeight: 0.08,
	cooldown: 15000,  // 15 秒内不会再次被随机选中
}],
```

### 发射位置与尺寸工具

从 `../../shell-utils` 导入的位置工具函数：

```ts
getRandomShellSize()                // 获取随机尺寸 + 位置（推荐使用）
getRandomShellPositionH()           // 随机水平位置（0.18~0.82 安全边界内）
getRandomShellPositionV()           // 随机垂直高度（0~0.75 安全范围内）
fitShellPositionInBoundsH(position) // 将任意水平位置约束到安全边界
fitShellPositionInBoundsV(position) // 将任意垂直位置约束到安全范围
```

从 `../../shell-configs` 导入的配置工具：

```ts
shellFromConfig(size)    // 根据当前用户选择的烟花类型生成配置
randomFastShell()        // 获取随机快速烟花工厂（排除黑名单类型）
```

从 `../../shell-registry` 导入的注册表查询：

```ts
getShellFactory(name)   // 获取指定名称的烟花工厂函数
getShellNames()         // 获取所有已注册的烟花类型名称
```

从 `@/store/selectors` 导入的状态选择器：

```ts
shellSizeSelector()      // 获取当前用户设置的烟花尺寸
shellNameSelector()      // 获取当前用户选择的烟花类型名称
```

从 `@/core/constants` 导入的设备检测：

```ts
isDesktop()   // 是否为桌面设备（viewport > 800px）
isMobile()    // 是否为移动设备（viewport <= 640px）
isHeader()    // 是否为 Header 模式（桌面 + 高度 < 300px）
```

### 完整示例

**简单序列**（单发）— 参见 `single.ts`：

```ts
import { isHeader } from '@/core/constants';
import { Shell } from '../../shells';
import { shellFromConfig } from '../../shell-configs';
import { getRandomShellSize } from '../../shell-utils';
import type { FireworkPlugin } from '../types';

function seqSingle(): number {
	const size = getRandomShellSize();
	const shell = new Shell(shellFromConfig(size.size));
	shell.launch(size.x, size.height);

	let extraDelay = shell.starLife;
	if (shell.fallingLeaves) {
		extraDelay = 4600;
	}

	return 900 + Math.random() * 600 + extraDelay;
}

export default {
	id: 'sequence-single',
	description: '单发烟花序列',
	sequences: [{
		name: 'Single',
		execute: seqSingle,
		randomWeight: 0.6,
		randomCondition: () => !isHeader(),
	}],
} satisfies FireworkPlugin;
```

**复杂序列**（多发编排）— 参见 `small-barrage.ts`：

```ts
import { isDesktop, PI_HALF } from '@/core/constants';
import { shellSizeSelector, shellNameSelector } from '@/store/selectors';
import { Shell } from '../../shells';
import { getShellFactory } from '../../shell-registry';
import { randomFastShell } from '../../shell-configs';
import type { FireworkPlugin } from '../types';

function seqSmallBarrage(): number {
	const barrageCount = isDesktop() ? 11 : 5;
	const shellSize = Math.max(0, shellSizeSelector() - 2);

	function launchShell(x: number, useSpecial: boolean) {
		const isRandom = shellNameSelector() === 'Random';
		const shellType = isRandom
			? randomFastShell()
			: getShellFactory(shellNameSelector())!;
		const shell = new Shell(shellType(shellSize));
		const height = (Math.cos(x * 5 * Math.PI + PI_HALF) + 1) / 2;
		shell.launch(x, height * 0.75);
	}

	let count = 0;
	let delay = 0;
	while (count < barrageCount) {
		if (count === 0) {
			launchShell(0.5, false);
			count += 1;
		} else {
			const offset = (count + 1) / barrageCount / 2;
			const delayOffset = Math.random() * 30 + 30;
			setTimeout(() => launchShell(0.5 + offset, false), delay);
			setTimeout(() => launchShell(0.5 - offset, false), delay + delayOffset);
			count += 2;
		}
		delay += 200;
	}

	return 3400 + barrageCount * 120;
}

export default {
	id: 'sequence-small-barrage',
	description: '小型弹幕烟花序列',
	sequences: [{
		name: 'Small Barrage',
		execute: seqSmallBarrage,
		randomWeight: 0.08,
		cooldown: 15000,
	}],
} satisfies FireworkPlugin;
```

---

## 添加国际化翻译

新增插件后，必须在两个语言包中添加对应的翻译标签，否则 UI 中会显示原始英文名。

编辑 `src/i18n/locales/zh-CN.ts`：

```ts
shellLabels: {
	// ... 已有翻译
	MyType: '我的类型',           // ← 新增烟花类型翻译
},
launchSequenceLabels: {
	// ... 已有翻译
	'My Sequence': '我的序列',    // ← 新增发射序列翻译
},
```

编辑 `src/i18n/locales/en.ts`：

```ts
shellLabels: {
	// ... 已有翻译
	MyType: 'My Type',            // ← 新增烟花类型翻译
},
launchSequenceLabels: {
	// ... 已有翻译
	'My Sequence': 'My Sequence', // ← 新增发射序列翻译
},
```

如果新增了发射序列，还需更新帮助文本中 `launchSequence.body` 的描述，说明新序列的效果。

---

## 更新测试

集成测试文件 `src/tests/plugin-integration.test.ts` 中有硬编码的数量断言，新增插件后需要更新：

1. **烟花类型数量**：更新 `expect(names.length).toBe(N)` 和 `expect(names).toContain('NewType')`
2. **快速烟花黑名单**：如果新类型设置了 `fastBlacklisted: true`，更新黑名单断言
3. **发射序列数量**：更新 `expect(names.length).toBe(N)` 和 `expect(names).toContain('New Sequence')`
4. **插件总数**：更新 `expect(pluginManager.size).toBe(N)`（烟花类型插件数 + 序列插件数）

---

## 开发检查清单

新增烟花类型插件时：

- [ ] 在 `shells/` 目录下创建 `.ts` 文件
- [ ] 实现 `factory` 函数，返回有效的 `ShellConfig`
- [ ] 使用 `satisfies FireworkPlugin` 确保类型安全
- [ ] 插件 `id` 使用 `shell-` 前缀
- [ ] 如果烟花持续时间过长，设置 `fastBlacklisted: true`
- [ ] 在 `zh-CN.ts` 和 `en.ts` 的 `shellLabels` 中添加翻译
- [ ] 更新集成测试中的数量断言

新增发射序列插件时：

- [ ] 在 `sequences/` 目录下创建 `.ts` 文件
- [ ] 实现 `execute` 函数，返回合理的延迟时间
- [ ] 使用 `satisfies FireworkPlugin` 确保类型安全
- [ ] 插件 `id` 使用 `sequence-` 前缀
- [ ] 设置合理的 `randomWeight`
- [ ] 如有需要，设置 `cooldown` 和 `randomCondition`
- [ ] 使用 `fitShellPositionInBoundsH()` 约束发射位置
- [ ] 在 `zh-CN.ts` 和 `en.ts` 的 `launchSequenceLabels` 中添加翻译
- [ ] 更新帮助文本中 `launchSequence.body` 的描述
- [ ] 更新集成测试中的数量断言

---

## 常见问题

### Q: 新增插件后需要修改核心代码吗？

不需要。插件系统通过 `import.meta.glob` 自动发现目录下的文件，只需在 `shells/` 或 `sequences/` 目录下添加 `.ts` 文件即可自动注册。

### Q: 烟花类型的 `name` 有什么要求？

- 使用英文标识，首字母大写，如 `'Crysanthemum'`、`'Falling Leaves'`
- 名称必须全局唯一，重复注册会抛出错误
- 名称会作为 i18n 翻译的键，以及 UI 下拉选项的值
- 如果名称包含空格，在 i18n 翻译中需要用引号包裹：`'Falling Leaves': '落叶'`

### Q: 什么时候应该设置 `fastBlacklisted`？

当烟花类型的星体寿命很长（通常 > 2000ms）时，应设置 `fastBlacklisted: true`。这些类型不适合终幕模式的快速连续发射（每 170ms 一发），否则会导致屏幕上同时存在大量粒子，造成严重卡顿。

当前黑名单类型：Falling Leaves、Floral、Willow、Kamuro、Brocade。

### Q: 发射序列的延迟时间怎么计算？

基本公式：`基础延迟 + 随机抖动 + 星体寿命`

```ts
return 900 + Math.random() * 600 + shell.starLife;
```

- `900ms`：最小间隔，确保视觉上有停顿
- `Math.random() * 600`：0~600ms 随机抖动，避免机械感
- `shell.starLife`：等待当前烟花基本消亡后再发下一轮

如果序列中使用了 `setTimeout` 延迟发射多发烟花，返回的延迟应覆盖所有烟花的发射时间 + 最长寿命。

### Q: 如何在序列中获取用户选择的烟花类型？

```ts
import { shellNameSelector } from '@/store/selectors';
import { getShellFactory } from '../../shell-registry';
import { randomFastShell } from '../../shell-configs';

const isRandom = shellNameSelector() === 'Random';
const shellType = isRandom
	? randomFastShell()                        // 随机模式：随机快速类型
	: getShellFactory(shellNameSelector())!;   // 指定类型：获取工厂函数
const shell = new Shell(shellType(size));
```

### Q: 如何适配不同设备？

```ts
import { isDesktop, isMobile } from '@/core/constants';

const count = isDesktop() ? 11 : 5;  // 桌面端多发，移动端少发
```

### Q: 如何适配不同画质？

```ts
import { isLowQuality, isHighQuality } from '@/core/state';

let starDensity = 1.25;
if (isLowQuality) starDensity *= 0.8;   // 低画质减少粒子
if (isHighQuality) starDensity = 1.5;   // 高画质增加粒子
```

### Q: 插件的 `id` 命名规范是什么？

- 烟花类型插件：`shell-` 前缀 + 小写短横线命名，如 `shell-crysanthemum`、`shell-falling-leaves`
- 发射序列插件：`sequence-` 前缀 + 小写短横线命名，如 `sequence-single`、`sequence-small-barrage`
- ID 必须全局唯一，重复注册会抛出错误

### Q: 可以在一个插件中同时定义烟花类型和发射序列吗？

可以。`FireworkPlugin` 接口同时支持 `shells` 和 `sequences` 字段，但建议分开定义以保持职责单一。参考 `plugin-integration.test.ts` 中的组合插件测试用例。
