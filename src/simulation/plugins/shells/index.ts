/**
 * @module simulation/plugins/shells/index
 * @description 烟花类型插件自动发现与加载。
 * 使用 Vite 的 import.meta.glob 实现插件的动态发现，
 * 新增烟花类型只需在 shells/ 目录下添加插件文件即可自动集成。
 */

import type { FireworkPlugin } from '../types';

/**
 * 使用 import.meta.glob 自动发现 shells/ 目录下的所有插件模块。
 * eager: true 表示在构建时同步加载所有模块。
 * 排除 index.ts 自身。
 */
const shellModules = import.meta.glob(['./*.ts', '!./index.ts'], { eager: true });

/**
 * 从自动发现的模块中提取所有烟花类型插件。
 * 每个模块的 default export 应为 FireworkPlugin 对象。
 */
export const shellPlugins: FireworkPlugin[] = Object.values(shellModules)
	.map((mod: unknown) => {
		if (mod && typeof mod === 'object' && mod !== null && 'default' in mod) {
			const plugin = (mod as Record<string, unknown>).default;
			if (plugin && typeof plugin === 'object' && 'id' in (plugin as object)) {
				return plugin as FireworkPlugin;
			}
		}
		return null;
	})
	.filter((plugin): plugin is FireworkPlugin => plugin !== null);
