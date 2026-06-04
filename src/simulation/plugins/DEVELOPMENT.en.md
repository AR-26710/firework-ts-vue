# Firework Plugin Development Guide

This document explains how to develop new shell type and launch sequence plugins for the firework simulator.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Quick Start](#quick-start)
- [Developing Shell Type Plugins](#developing-shell-type-plugins)
  - [ShellConfig Parameter Reference](#shellconfig-parameter-reference)
  - [Color System](#color-system)
  - [Glitter Types](#glitter-types)
  - [Special Effect Flags](#special-effect-flags)
  - [Complete Examples](#complete-examples)
- [Developing Launch Sequence Plugins](#developing-launch-sequence-plugins)
  - [Sequence Execute Function](#sequence-execute-function)
  - [Random Weight and Scheduling](#random-weight-and-scheduling)
  - [Cooldown Mechanism](#cooldown-mechanism)
  - [Launch Position and Size Utilities](#launch-position-and-size-utilities)
  - [Complete Examples](#complete-examples-1)
- [Adding i18n Translations](#adding-i18n-translations)
- [Updating Tests](#updating-tests)
- [Development Checklist](#development-checklist)
- [FAQ](#faq)

---

## Architecture Overview

```
plugins/
├── index.ts                 # Plugin system entry, initialization and public API
├── plugin-manager.ts        # Plugin manager (register/init/unload/lifecycle)
├── types.ts                 # Plugin interface definitions (FireworkPlugin / ShellPluginEntry / SequencePluginEntry)
├── shell-plugin-helper.ts   # Shell plugin development utilities
├── shells/                  # Shell type plugin directory
│   ├── index.ts             # Auto-discovery entry (import.meta.glob)
│   ├── crackle.ts           # Example: Crackle
│   ├── crysanthemum.ts      # Example: Chrysanthemum
│   └── ...
└── sequences/               # Launch sequence plugin directory
    ├── index.ts             # Auto-discovery entry (import.meta.glob)
    ├── single.ts            # Example: Single
    ├── double.ts            # Example: Double
    └── ...
```

**Core Mechanism**: Vite's `import.meta.glob` automatically scans `.ts` files in the `shells/` and `sequences/` directories, extracts the `default export` `FireworkPlugin` objects, and registers them. **Adding a new plugin only requires adding a file in the corresponding directory — no core code changes needed.**

**Registration Order**:
1. Non-Random shell type plugins
2. Random shell type plugin (depends on other types being registered first)
3. Launch sequence plugins

---

## Quick Start

### Minimal Shell Type Plugin

Create a `.ts` file in the `shells/` directory:

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
	description: 'My custom shell type',
	shells: [{ name: 'MyType', factory: myShell }],
} satisfies FireworkPlugin;
```

### Minimal Launch Sequence Plugin

Create a `.ts` file in the `sequences/` directory:

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
	description: 'My custom launch sequence',
	sequences: [{
		name: 'My Sequence',
		execute: seqMySequence,
		randomWeight: 0.2,
	}],
} satisfies FireworkPlugin;
```

---

## Developing Shell Type Plugins

### ShellConfig Parameter Reference

`ShellConfig` is the core configuration interface for shells, defined in `shell-utils.ts`:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `shellSize` | `number` | ✅ | — | Base size, affects spread range and star lifetime |
| `spreadSize` | `number` | ✅ | — | Explosion spread radius (pixels), typically `300 + size * 100` |
| `starLife` | `number` | ✅ | — | Star base lifetime (ms), typically `900 + size * 200` |
| `color` | `string \| string[]` | ✅ | — | Primary color, supports single color or dual-color array |
| `glitter` | `string` | ✅ | — | Glitter type (see glitter types table below) |
| `starLifeVariation` | `number` | ❌ | `0.125` | Star lifetime random variation ratio |
| `starDensity` | `number` | ❌ | `1` | Star density coefficient, affects star count |
| `starCount` | `number` | ❌ | Auto-calculated | Star count; if unspecified, auto-calculated from `spreadSize` and `starDensity` |
| `glitterColor` | `string` | ❌ | Primary color | Glitter color |
| `secondColor` | `string \| null` | ❌ | `null` | Secondary color, used for star color transition effects |
| `pistil` | `boolean` | ❌ | `false` | Whether to show pistil (inner small firework) |
| `pistilColor` | `string \| false` | ❌ | `false` | Pistil color |
| `streamers` | `boolean` | ❌ | `false` | Whether to show trailing streamer effects |
| `ring` | `boolean` | ❌ | `false` | Whether this is a ring-shaped firework |
| `crossette` | `boolean` | ❌ | `false` | Cross-shaped split on star death |
| `floral` | `boolean` | ❌ | `false` | Flower-shaped bloom on star death |
| `fallingLeaves` | `boolean` | ❌ | `false` | Drifting leaves effect on star death |
| `crackle` | `boolean` | ❌ | `false` | Small burst on star death |
| `horsetail` | `boolean` | ❌ | `false` | Stars follow comet trajectory downward |
| `strobe` | `boolean` | ❌ | `false` | Enable strobe flickering effect |
| `strobeColor` | `string \| null` | ❌ | `null` | Strobe color |
| `customColors` | `Record<string, string>` | ❌ | — | Custom color mapping, only affects this shell type |
| `useSystemColors` | `boolean` | ❌ | `true` | Whether to use system built-in colors. Set to `false` to only use `customColors` |

### Color System

Available colors are defined in the `COLOR` object in `@/core/constants`:

| Color Name | Hex Value |
|------------|-----------|
| `COLOR.Red` | `#ff0043` |
| `COLOR.Green` | `#14fc56` |
| `COLOR.Blue` | `#1e7fff` |
| `COLOR.Purple` | `#e60aff` |
| `COLOR.Gold` | `#ffbf36` |
| `COLOR.White` | `#ffffff` |

Special value:
- `INVISIBLE` (`'_INVISIBLE_'`): Invisible color, used to hide the primary color body and only show glitter/secondary color

Color utility functions (import from `@/core/constants`):

```ts
randomColor()                          // Random color
randomColor({ limitWhite: true })      // Limit white probability (60% chance to re-roll)
randomColor({ notSame: true })         // Avoid same as last
randomColor({ notColor: COLOR.White }) // Exclude specific color
whiteOrGold()                          // 50% gold / 50% white
```

Pistil color utility (import from `../shell-plugin-helper`):

```ts
makePistilColor(shellColor)        // Auto-generate pistil color based on primary color
makePistilColor(shellColor, pool)  // Support custom color pool
```

### Custom Color System

Custom colors can be defined when creating new shell types without modifying files in `@/core/constants`.

**Core Concepts**:

- `customColors`: Custom color mapping in format `{ name: hex code }`, only affects the current shell type
- `useSystemColors`: Boolean controlling whether to include system built-in colors (default `true`)
- Color priority: when enabled, custom colors merge with system colors; when disabled, only custom colors are used

**Color pool utility functions** (import from `@/core/constants`):

```ts
import { createColorPool } from '@/core/constants';

// Create a pool with only custom colors (system colors disabled)
const pool = createColorPool(
	{ Pink: '#ff69b4', Cyan: '#00ffff', Lime: '#39ff14' },
	false  // useSystemColors = false
);

// Create a pool merging system and custom colors
const pool2 = createColorPool({ Coral: '#ff6b6b' }, true);  // default, can be omitted

// Pick random colors from the pool
const color = randomColor(undefined, pool.codes);
const color2 = randomColor({ limitWhite: true }, pool.codes);
```

**Custom color example** (see `neon.ts`):

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
	description: 'Neon shell type (custom colors only)',
	shells: [{ name: 'Neon', factory: neonShell }],
} satisfies FireworkPlugin;
```

**Notes**:
- Custom colors are automatically registered in the global rendering table when the shell bursts, without affecting other shell types
- If `useSystemColors: false` is not set, custom colors will be merged with system built-in colors
- `makePistilColor` and `whiteOrGold` support passing a `ColorPool` parameter to adapt to custom colors

### Glitter Types

The `glitter` field controls star trail glitter effects. Different types have different spark frequency, speed, and lifetime:

| Value | Effect Description | Typical Usage |
|-------|-------------------|---------------|
| `''` | No glitter | Peony, Floral and other solid-color spheres |
| `'light'` | Light glitter | Chrysanthemum, Crackle, Strobe |
| `'medium'` | Medium glitter | Horsetail, Falling Leaves |
| `'heavy'` | Heavy glitter | Palm, Brocade |
| `'thick'` | Thick glitter | Palm (thick trail) |
| `'streamer'` | Streamer glitter | Chrysanthemum trailing streamers |
| `'willow'` | Willow glitter | Willow, Kamuro |

### Special Effect Flags

These boolean flags change star behavior on death:

| Flag | Death Effect | Sound |
|------|-------------|-------|
| `crossette` | Cross-shaped split into multiple small stars | Small crackle sound |
| `crackle` | Small burst + golden sparks | Crackle sound |
| `floral` | Flower-shaped bloom | None |
| `fallingLeaves` | Drifting leaves + golden glitter trail | None |

Other effect flags:
- `ring`: Stars distributed along a ring instead of spherical spread
- `horsetail`: Stars follow comet trajectory downward, creating a waterfall effect
- `strobe`: Stars flicker on and off
- `streamers`: Add additional white streamer trails

### Complete Examples

Refer to existing plugin implementation patterns:

**Simple** (fixed configuration) — see `willow.ts`:

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
	description: 'Willow shell type',
	shells: [{ name: 'Willow', factory: willowShell, fastBlacklisted: true }],
} satisfies FireworkPlugin;
```

**Complex** (random variants) — see `crysanthemum.ts`:

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
	description: 'Chrysanthemum shell type',
	shells: [{ name: 'Crysanthemum', factory: crysanthemumShell }],
} satisfies FireworkPlugin;
```

**Variant based on existing type** — see `ghost.ts`:

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
	description: 'Ghost shell type',
	shells: [{ name: 'Ghost', factory: ghostShell }],
} satisfies FireworkPlugin;
```

---

## Developing Launch Sequence Plugins

### Sequence Execute Function

The core of a sequence is the `execute` function, responsible for creating and launching shells, and returning the delay time (in ms) until the next scheduling call.

```ts
function seqMySequence(): number {
	// 1. Create shell
	// 2. Call shell.launch(x, height) to launch
	// 3. Return delay time (ms)
	return 2000;
}
```

**Key conventions**:
- `x`: Horizontal position, 0~1 normalized coordinate (0 = leftmost, 1 = rightmost)
- `height`: Vertical height, 0~1 normalized coordinate (0 = lowest, 1 = highest)
- Use `setTimeout` for delays between multiple shells
- Return value is the wait time for the dispatcher to call this sequence again

### Random Weight and Scheduling

When the user selects "Random" launch sequence, the dispatcher selects a sequence as follows:

1. Get all sequences with `randomWeight` set, sorted by weight in ascending order
2. Generate a random number `rand` (0~1)
3. Check `rand < entry.randomWeight` sequentially; if matched, execute
4. After matching, check cooldown and prerequisite conditions

**Weight setting guidelines**:

| Weight Range | Applicable Scenario | Existing Examples |
|-------------|---------------------|-------------------|
| `0.05 ~ 0.1` | Rare, spectacular sequences | Small Barrage `0.08` |
| `0.1 ~ 0.2` | Less frequent sequences | Wave `0.12`, Cross Burst `0.15` |
| `0.2 ~ 0.5` | Medium frequency sequences | — |
| `0.5 ~ 1.0` | Common sequences | Single `0.6`, Double `0.8`, Triple `1.0` |

**Note**: Weights are not probabilities but thresholds. The dispatcher checks `rand < weight` in ascending order, so lower-weight sequences are checked first. If no weight is matched, the dispatcher returns 0 (immediate retry).

### Cooldown Mechanism

For sequences with intense visual effects or high performance cost, set `cooldown` (cooldown time in ms) to prevent frequent invocation within a short period:

```ts
sequences: [{
	name: 'Small Barrage',
	execute: seqSmallBarrage,
	randomWeight: 0.08,
	cooldown: 15000,  // Won't be randomly selected again within 15 seconds
}],
```

### Launch Position and Size Utilities

Position utility functions imported from `../../shell-utils`:

```ts
getRandomShellSize()                // Get random size + position (recommended)
getRandomShellPositionH()           // Random horizontal position (within 0.18~0.82 safe bounds)
getRandomShellPositionV()           // Random vertical height (within 0~0.75 safe range)
fitShellPositionInBoundsH(position) // Constrain arbitrary horizontal position to safe bounds
fitShellPositionInBoundsV(position) // Constrain arbitrary vertical position to safe range
```

Config utilities imported from `../../shell-configs`:

```ts
shellFromConfig(size)    // Generate config based on current user-selected shell type
randomFastShell()        // Get random fast shell factory (excluding blacklisted types)
```

Registry queries imported from `../../shell-registry`:

```ts
getShellFactory(name)   // Get shell factory function by name
getShellNames()         // Get all registered shell type names
```

State selectors imported from `@/store/selectors`:

```ts
shellSizeSelector()      // Get current user-configured shell size
shellNameSelector()      // Get current user-selected shell type name
```

Device detection imported from `@/core/constants`:

```ts
isDesktop()   // Whether desktop device (viewport > 800px)
isMobile()    // Whether mobile device (viewport <= 640px)
isHeader()    // Whether Header mode (desktop + height < 300px)
```

### Complete Examples

**Simple sequence** (single) — see `single.ts`:

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
	description: 'Single shell sequence',
	sequences: [{
		name: 'Single',
		execute: seqSingle,
		randomWeight: 0.6,
		randomCondition: () => !isHeader(),
	}],
} satisfies FireworkPlugin;
```

**Complex sequence** (multi-shell orchestration) — see `small-barrage.ts`:

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
	description: 'Small barrage shell sequence',
	sequences: [{
		name: 'Small Barrage',
		execute: seqSmallBarrage,
		randomWeight: 0.08,
		cooldown: 15000,
	}],
} satisfies FireworkPlugin;
```

---

## Adding i18n Translations

After adding a new plugin, you must add corresponding translation labels in both language packs, otherwise the UI will display the raw English name.

Edit `src/i18n/locales/zh-CN.ts`:

```ts
shellLabels: {
	// ... existing translations
	MyType: '我的类型',           // ← new shell type translation
},
launchSequenceLabels: {
	// ... existing translations
	'My Sequence': '我的序列',    // ← new launch sequence translation
},
```

Edit `src/i18n/locales/en.ts`:

```ts
shellLabels: {
	// ... existing translations
	MyType: 'My Type',            // ← new shell type translation
},
launchSequenceLabels: {
	// ... existing translations
	'My Sequence': 'My Sequence', // ← new launch sequence translation
},
```

If you added a new launch sequence, also update the description in `launchSequence.body` in the help text to describe the new sequence's effect.

---

## Updating Tests

The integration test file `src/tests/plugin-integration.test.ts` has hardcoded count assertions that need updating after adding new plugins:

1. **Shell type count**: Update `expect(names.length).toBe(N)` and add `expect(names).toContain('NewType')`
2. **Fast shell blacklist**: If the new type has `fastBlacklisted: true`, update blacklist assertions
3. **Launch sequence count**: Update `expect(names.length).toBe(N)` and add `expect(names).toContain('New Sequence')`
4. **Total plugin count**: Update `expect(pluginManager.size).toBe(N)` (shell type plugins + sequence plugins)

---

## Development Checklist

When adding a new shell type plugin:

- [ ] Create a `.ts` file in the `shells/` directory
- [ ] Implement the `factory` function returning a valid `ShellConfig`
- [ ] Use `satisfies FireworkPlugin` for type safety
- [ ] Use `shell-` prefix for the plugin `id`
- [ ] Set `fastBlacklisted: true` if the firework lasts too long
- [ ] Add translations in `zh-CN.ts` and `en.ts` under `shellLabels`
- [ ] Update count assertions in integration tests

When adding a new launch sequence plugin:

- [ ] Create a `.ts` file in the `sequences/` directory
- [ ] Implement the `execute` function returning a reasonable delay time
- [ ] Use `satisfies FireworkPlugin` for type safety
- [ ] Use `sequence-` prefix for the plugin `id`
- [ ] Set an appropriate `randomWeight`
- [ ] If needed, set `cooldown` and `randomCondition`
- [ ] Use `fitShellPositionInBoundsH()` to constrain launch positions
- [ ] Add translations in `zh-CN.ts` and `en.ts` under `launchSequenceLabels`
- [ ] Update the description in `launchSequence.body` in help text
- [ ] Update count assertions in integration tests

---

## FAQ

### Q: Do I need to modify core code after adding a new plugin?

No. The plugin system uses `import.meta.glob` to auto-discover files in the directories. Just add a `.ts` file in the `shells/` or `sequences/` directory and it will be automatically registered.

### Q: What are the requirements for a shell type's `name`?

- Use English identifiers, capitalized first letter, e.g. `'Crysanthemum'`, `'Falling Leaves'`
- Names must be globally unique; duplicate registration throws an error
- Names serve as i18n translation keys and UI dropdown option values
- If the name contains spaces, wrap it in quotes in i18n translations: `'Falling Leaves': '落叶'`

### Q: When should I set `fastBlacklisted`?

When a shell type has a long star lifetime (typically > 2000ms), set `fastBlacklisted: true`. These types are unsuitable for the rapid consecutive launching in finale mode (one every 170ms), as it would cause too many particles on screen simultaneously, resulting in severe lag.

Currently blacklisted types: Falling Leaves, Floral, Willow, Kamuro, Brocade.

### Q: How is the launch sequence delay calculated?

Basic formula: `base delay + random jitter + star lifetime`

```ts
return 900 + Math.random() * 600 + shell.starLife;
```

- `900ms`: Minimum interval ensuring visual pauses
- `Math.random() * 600`: 0~600ms random jitter to avoid mechanical feel
- `shell.starLife`: Wait for the current firework to mostly die out before the next round

If the sequence uses `setTimeout` to delay-launch multiple shells, the returned delay should cover all shells' launch times + the longest lifetime.

### Q: How to get the user-selected shell type in a sequence?

```ts
import { shellNameSelector } from '@/store/selectors';
import { getShellFactory } from '../../shell-registry';
import { randomFastShell } from '../../shell-configs';

const isRandom = shellNameSelector() === 'Random';
const shellType = isRandom
	? randomFastShell()                        // Random mode: random fast type
	: getShellFactory(shellNameSelector())!;   // Specified type: get factory function
const shell = new Shell(shellType(size));
```

### Q: How to adapt for different devices?

```ts
import { isDesktop, isMobile } from '@/core/constants';

const count = isDesktop() ? 11 : 5;  // More on desktop, fewer on mobile
```

### Q: How to adapt for different quality levels?

```ts
import { isLowQuality, isHighQuality } from '@/core/state';

let starDensity = 1.25;
if (isLowQuality) starDensity *= 0.8;   // Fewer particles on low quality
if (isHighQuality) starDensity = 1.5;   // More particles on high quality
```

### Q: What are the naming conventions for plugin `id`?

- Shell type plugins: `shell-` prefix + lowercase kebab-case, e.g. `shell-crysanthemum`, `shell-falling-leaves`
- Launch sequence plugins: `sequence-` prefix + lowercase kebab-case, e.g. `sequence-single`, `sequence-small-barrage`
- IDs must be globally unique; duplicate registration throws an error

### Q: Can I define both shell types and launch sequences in one plugin?

Yes. The `FireworkPlugin` interface supports both `shells` and `sequences` fields, but it's recommended to define them separately for single responsibility. See the combined plugin test case in `plugin-integration.test.ts`.
