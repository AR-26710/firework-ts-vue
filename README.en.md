# Firework Simulator

A Canvas-based web firework simulator with multiple shell types, sound effects, text fireworks, plugin architecture, and more.

Forked from Caleb Miller's [Firework Simulator v2](https://codepen.io/MillerTime/pen/XgpNwb), refactored with Vue and TypeScript, and enhanced with text fireworks, a plugin system, Chinese localization, and more.

## Features

### Shell Types

Supports 14 shell types + random mode, using a plugin architecture. Adding a new type only requires adding a file in the `plugins/shells/` directory for automatic registration:

| Type | Description |
| -- | -- |
| Random | 50% chance chrysanthemum, 50% random selection from other types |
| Chrysanthemum | Most common, even spread, optional glitter/pistil/dual-color/trail |
| Crackle | Small burst on death + golden sparks, 75% golden, optional pistil |
| Crossette | Cross-shaped split on star death, optional pistil |
| Falling Leaves | Drifting leaves + golden glitter trail, invisible primary color |
| Floral | Flower-shaped bloom on star death, 65% random color |
| Ghost | Based on chrysanthemum, invisible primary + random secondary color fading in/out, streamlined trail |
| Horsetail | Waterfall-like drooping effect + medium glitter, white includes strobe |
| Palm | Thick trail effect, 50% thick glitter / 50% heavy glitter |
| Ring | Stars distributed along a ring, 75% pistil, 30% streamline |
| Strobe | Stars flickering on and off, optional pistil |
| Willow | Extremely long life + drooping trail, invisible primary + willow glitter |
| Kamuro | Japanese crown style, extremely long life + dense golden willow glitter, golden waterfall effect |
| Peony | Classic spherical explosion, high-density solid sphere, no trail, pure color |
| Brocade | Dense golden heavy glitter + long life, brocade-like effect, optional pistil/secondary color |

For guidance on adding new shell types, see [`plugins/DEVELOPMENT.md`](src/simulation/plugins/DEVELOPMENT.md).

### Launch Sequences

Uses a plugin architecture. Adding a new sequence only requires adding a file in the `plugins/sequences/` directory for automatic registration:

| Sequence | Description | Weight | Cooldown |
| -- | -- | -- | -- |
| Random | Weighted probability mix of various sequences | — | — |
| Single | One firework per launch (Header mode excluded from random) | 0.6 | — |
| Double | Symmetric left-right (0.3/0.7 positions, 100ms delay) | 0.8 | — |
| Triple | Center large +两侧 small (~1s delay) | 1.0 | — |
| Pyramid | Progressive from sides to center (desktop 7+1, mobile 4+1) | 0.1 | — |
| Small Barrage | Fan-shaped symmetric spread (desktop 11, mobile 5) | 0.08 | 15s |
| Wave | Sequential launch from one side to the other, sine height distribution (desktop 7, mobile 4) | 0.12 | — |
| Cross Burst | Five shells in a cross pattern, center large + four directional small | 0.15 | — |

For guidance on adding new launch sequences, see [`plugins/DEVELOPMENT.md`](src/simulation/plugins/DEVELOPMENT.md).

### Text Fireworks

- Input text and launch it into the sky, text composed of particles
- Auto-detect CJK characters, adjusting spacing and rendering resolution (CJK: 0.18 × scaleFactor, non-CJK: 0.12 × scaleFactor)
- Support "characters per display" setting (1~20 chars), excess auto-batched
- Support text random color mode
- Support text random position mode (each character explodes at a random screen position)
- Support launch order shuffling (in random position mode, can shuffle character launch order)
- Support single cluster display (all text displayed in one cluster of fireworks simultaneously)

### Display Settings

- **Shell Size**: 3" / 4" / 6" / 8" / 12" / 16" (6 levels)
- **Quality**: Low / Medium / High (affects particle count and rendering detail)
- **Sky Glow**: None / Subtle / Normal (illuminates background on explosion)
- **Scale**: 50% / 62% / 75% / 90% / 100% / 150% / 200% (7 levels)
- **Fullscreen**: Browser fullscreen
- **Long Exposure**: Experimental effect, preserves long light trails (trail fade opacity extremely low at 0.0025)
- **Hide Controls**: Hide top semi-transparent controls
- **Hide Tips**: Hide all operation hints
- **Hide Cursor**: Hide mouse cursor on canvas (mutually exclusive with auto-hide cursor)
- **Auto-hide Cursor**: Auto-hide after 3s of inactivity, restore on movement (mutually exclusive with hide cursor)

### Behavior Settings

- **Auto Launch**: Automatically orchestrate firework sequences
- **Finale Mode**: Dense continuous launching (32 rapid rounds, 170ms interval, 6s cooldown after)
- **Launch Sequence**: Choose firework launch orchestration method

### Sound System

Based on Web Audio API, includes 5 sound types with dynamic volume and playback rate adjustment:

| Sound Type | File | Base Volume | Playback Rate Range |
| -- | -- | -- | -- |
| Lift | lift1/2/3.mp3 | 1.0 | 0.85~0.95 |
| Burst | burst1/2.mp3 | 1.0 | 0.8~0.9 |
| Small Burst | burst-sm-1/2.mp3 | 0.25 | 0.8~1.0 |
| Crackle | crackle1.mp3 | 0.2 | 1.0 |
| Small Crackle | crackle-sm-1.mp3 | 0.3 | 1.0 |

- Volume and playback rate dynamically adjust based on shell size
- Auto-mute when simulation speed is below 0.95
- Small burst sounds have 20ms throttle protection

### Internationalization

- Default language is Chinese (zh-CN), supports Chinese and English interface switching
- Implemented with vue-i18n, language packs dynamically lazy-loaded
- Auto-detect browser language (zh prefix → zh-CN, en prefix → en)
- Language preference persisted to localStorage

### Interaction

**Mouse/Touch**:

- Click canvas to launch fireworks
- Drag at bottom to adjust simulation speed
- Top button area (y < 50px): top-left pause, center sound, top-right-left shortcut help, far-right settings
- Multi-touch tracking support
- Ignore mouse events for 500ms after touch (prevent duplicate triggers)

**Keyboard Shortcuts**:

| Key | Function | Category |
| -- | -- | -- |
| `Space` / `P` | Pause/Resume | Playback |
| `S` | Toggle Sound | Playback |
| `F` | Toggle Fullscreen | Playback |
| `A` | Toggle Auto Launch | Launch |
| `W` | Toggle Finale Mode | Launch |
| `←` / `→` | Adjust Launch Sequence | Launch |
| `↑` / `↓` | Cycle Shell Type | Visual |
| `L` | Toggle Long Exposure | Visual |
| `H` | Toggle Hide Controls | Visual |
| `T` | Toggle Hide Tips | Visual |
| `X` | Toggle Hide Cursor | Visual |
| `Ctrl+X` | Toggle Auto-hide Cursor | Visual |
| `+` / `-` | Adjust Simulation Speed | Visual |
| `[` / `]` | Adjust Shell Size | Visual |
| `,` / `.` | Adjust View Scale | Visual |
| `E` | Toggle Text Fireworks | Text |
| `R` | Toggle Text Random Color | Text |
| `G` | Toggle Text Random Position | Text |
| `D` | Toggle Launch Order Shuffle | Text |
| `C` | Toggle Single Cluster Display | Text |
| `O` | Toggle Settings Menu | UI |
| `/` | Show Shortcut Help | UI |

Some shortcuts have prerequisites: `W` requires auto launch enabled, `←`/`→` requires auto launch and non-finale mode, `R`/`G`/`C` require text fireworks enabled, `D` requires both text fireworks and random position enabled. `X` and `Ctrl+X` are mutually exclusive: enabling hide cursor auto-disables auto-hide, and vice versa.

### Device Adaptation

- Mobile (viewport ≤ 640px): default scale 0.9, default size 2", barrage count halved
- Desktop (viewport > 800px): default scale 1.0, default size 3"
- Header mode (desktop + height < 300px): default scale 0.75, default size 1.2", hide controls
- High-end devices auto-select high quality (viewport ≤ 1024 requires 4 cores, > 1024 requires 8 cores)
- High DPI screen adaptation
- Canvas max resolution limited to 8K (7680 × 4320)

## Tech Stack

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

## Architecture

```
src/
├── main.ts                    # App entry
├── game-loop.ts               # Main loop (stage init, resize, input binding)
├── env.d.ts                   # Environment type declarations
├── audio/
│   └── sound-manager.ts       # Sound manager (Web Audio API)
├── core/
│   ├── constants.ts           # Global constants (device detection, quality, color system)
│   ├── math.ts                # Math utilities (distance, angle, vector decomposition, random)
│   ├── stage.ts               # Canvas stage wrapper (with Ticker frame scheduler)
│   ├── stages.ts              # Dual-layer Canvas instances (trails + main)
│   ├── state.ts               # Mutable global state (simulation speed, stage size, quality)
│   └── fscreen.ts             # Fullscreen API cross-browser compatibility wrapper
├── i18n/
│   ├── index.ts               # i18n init (dynamic lazy loading, browser language detection)
│   └── locales/
│       ├── en.ts              # English language pack
│       └── zh-CN.ts           # Chinese language pack
├── input/
│   ├── cursor-manager.ts      # Cursor hide management (manual/auto-hide, mutual exclusion)
│   ├── keyboard-handler.ts    # Keyboard event handling
│   ├── pointer-handler.ts     # Mouse/touch pointer event handling
│   └── shortcuts.ts           # Centralized shortcut registry
├── physics/
│   └── updater.ts             # Physics engine (air resistance, gravity, rotation, spark generation, lifecycle)
├── renderer/
│   └── renderer.ts            # Canvas renderer (dual-layer drawing, sky glow, lighten blending)
├── simulation/
│   ├── particles/             # Particle system
│   │   ├── star.ts            # Star particle
│   │   ├── spark.ts           # Spark particle
│   │   ├── burst-flash.ts     # Burst flash
│   │   ├── effects.ts         # Particle effects
│   │   ├── types.ts           # Particle type definitions
│   │   └── utils.ts           # Particle utility functions
│   ├── plugins/               # Plugin system (auto-discovery)
│   │   ├── index.ts           # Plugin system entry and initialization
│   │   ├── plugin-manager.ts  # Plugin manager (register/init/unload/lifecycle)
│   │   ├── types.ts           # Plugin interface definitions (FireworkPlugin/ShellPluginEntry/SequencePluginEntry)
│   │   ├── shell-plugin-helper.ts # Shell plugin utilities (pistil color generation)
│   │   ├── DEVELOPMENT.md     # Plugin development guide
│   │   ├── shells/            # Shell type plugin directory
│   │   │   ├── index.ts       # Auto-discovery entry (import.meta.glob)
│   │   │   ├── brocade.ts
│   │   │   ├── crackle.ts
│   │   │   ├── crossette.ts
│   │   │   ├── crysanthemum.ts
│   │   │   ├── falling-leaves.ts
│   │   │   ├── floral.ts
│   │   │   ├── ghost.ts
│   │   │   ├── horsetail.ts
│   │   │   ├── kamuro.ts
│   │   │   ├── palm.ts
│   │   │   ├── peony.ts
│   │   │   ├── random.ts
│   │   │   ├── ring.ts
│   │   │   ├── strobe.ts
│   │   │   └── willow.ts
│   │   └── sequences/         # Launch sequence plugin directory
│   │       ├── index.ts       # Auto-discovery entry (import.meta.glob)
│   │       ├── cross-burst.ts
│   │       ├── double.ts
│   │       ├── pyramid.ts
│   │       ├── random.ts
│   │       ├── single.ts
│   │       ├── small-barrage.ts
│   │       ├── triple.ts
│   │       └── wave.ts
│   ├── sequences/             # Sequence dispatching
│   │   ├── dispatcher.ts      # Main sequence dispatcher (first/finale/specified/random)
│   │   ├── sequence-registry.ts # Sequence registry (weighted selection/cooldown check)
│   │   └── types.ts           # Sequence type definitions
│   ├── shell-configs.ts       # Shell config lookup and random selection
│   ├── shell-launch.ts        # Shell launch logic (with text fireworks batch launching)
│   ├── shell-registry.ts      # Shell type registry
│   ├── shell-utils.ts         # Shell utilities (ShellConfig interface, CJK detection, position constraints)
│   └── shells.ts              # Shell class (ascent + explosion core logic)
├── store/
│   ├── store.ts               # Centralized state management (observer pattern + localStorage persistence)
│   ├── actions.ts             # State action functions
│   └── selectors.ts           # State selectors
├── styles/
│   ├── style.scss             # Main style entry
│   ├── _base.scss             # Base styles
│   ├── _variables.scss        # SCSS variables
│   └── _utils.scss            # Utility styles
├── tests/
│   ├── plugin-integration.test.ts  # Plugin integration tests
│   ├── plugin-manager.test.ts      # Plugin manager tests
│   ├── sequence-registry.test.ts   # Sequence registry tests
│   ├── shell-registry.test.ts      # Shell registry tests
│   └── setup.ts                    # Test configuration
└── ui/
    ├── App.vue                # Vue root component (Canvas container + child component orchestration)
    ├── vue-store.ts           # Vue reactive state bridge (reactive + store subscription)
    ├── help-content.ts        # Help text content mapping
    └── components/
        ├── Controls.vue       # Top control bar (pause/sound/help/settings)
        ├── LoadingInit.vue    # Loading initialization component
        ├── TextInputBar.vue   # Text fireworks input bar
        ├── Toast.vue          # Toast notification component
        ├── form/              # Form components
        │   ├── FormCheckbox.vue
        │   ├── FormNumberInput.vue
        │   └── FormSelect.vue
        ├── help/              # Help components
        │   ├── HelpModal.vue
        │   └── ShortcutsHelp.vue
        └── settings/          # Settings panel
            ├── Settings.vue
            ├── BehaviorTab.vue
            ├── DisplayTab.vue
            ├── LanguageTab.vue
            └── TextFireworkTab.vue
```

### Plugin System

The project uses a plugin architecture for managing shell types and launch sequences. Core design:

- **Auto-discovery**: Vite's `import.meta.glob` automatically scans plugin directories; adding a plugin only requires adding a file
- **Registry Pattern**: `shell-registry.ts` and `sequence-registry.ts` provide declarative registration
- **Plugin Manager**: `plugin-manager.ts` manages plugin lifecycle (register/init/unload)
- **Zero-invasion Extension**: Adding new shell types or launch sequences requires no core code changes
- **Registration Order**: Non-Random shells first → Random shell → Launch sequences, ensuring Random can access the complete type list
- **Development Guide**: Detailed plugin development docs at [`plugins/DEVELOPMENT.md`](src/simulation/plugins/DEVELOPMENT.md)

### Dual-Layer Canvas Rendering

The project uses a dual-layer Canvas architecture for firework rendering:

- **trails-canvas**: Trail fade layer, each frame overlaid with semi-transparent black for fade effect (normal mode opacity 0.175 × speed, long exposure mode 0.0025)
- **main-canvas**: Current frame bright particle layer, draws stars and sparks using `lighten` blend mode

### State Management

Centralized state management using observer pattern + localStorage persistence:

- **StoreState**: Contains `paused`, `soundEnabled`, `settingOpen`, `openHelpTopic`, `fullscreen`, and `config`
- **StoreConfig**: All user-adjustable configuration items (quality, shell type, size, auto launch, finale, sky glow, scale, hide cursor, auto-hide cursor, text fireworks, etc.)
- **Persistence**: localStorage key `cm_fireworks_data`, schema version `1.7`
- **Vue Bridge**: `vue-store.ts` implements Vue reactivity via `reactive` + store subscription

## Development

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build
pnpm build

# Preview build output
pnpm preview

# Run tests
pnpm test

# Run tests (watch mode)
pnpm test:watch

# Type check
pnpm typecheck

# Lint
pnpm lint

# Lint (auto-fix)
pnpm lint:fix

# Format code
pnpm format

# Check code format
pnpm format:check

# Generate icons
pnpm generate-icons

# Git hooks
pnpm prepare
```

## License

[MIT License](LICENSE)

## Acknowledgements

- Thanks to [Caleb Miller](https://cmiller.tech/) for the original creation
- Fork based on [Firework Simulator v2](https://codepen.io/MillerTime/pen/XgpNwb)
