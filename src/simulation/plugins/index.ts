/**
 * @module simulation/plugins
 * @description 烟花插件系统入口。提供插件系统的初始化和公共 API。
 *
 * 使用方式：
 * - 在应用启动时调用 `initializePlugins()` 加载所有内置插件
 * - 通过 `pluginManager` 注册自定义插件
 * - 新增烟花类型或发射序列只需在对应目录下添加插件文件
 */

export type {
	FireworkPlugin,
	ShellPluginEntry,
	SequencePluginEntry,
	PluginState,
	PluginInfo,
} from './types';
export { pluginManager } from './plugin-manager';
export { makePistilColor } from './shell-plugin-helper';

import { pluginManager } from './plugin-manager';
import { shellPlugins } from './shells';
import { sequencePlugins } from './sequences';

/**
 * 初始化插件系统。
 * 加载所有通过 import.meta.glob 自动发现的内置插件，
 * 并按正确顺序注册到插件管理器中。
 *
 * 注册顺序：
 * 1. 烟花类型插件（Random 类型最后注册，因为它依赖其他类型）
 * 2. 发射序列插件
 *
 * 此函数应在应用启动时调用一次。
 */
function initializePlugins(): void {
	// 分离 Random 烟花插件，确保它最后注册（因为它依赖其他烟花类型）
	const randomShellPlugin = shellPlugins.find((p) => p.id === 'shell-random');
	const otherShellPlugins = shellPlugins.filter((p) => p.id !== 'shell-random');

	// 先注册非 Random 的烟花类型
	pluginManager.registerAll(otherShellPlugins);

	// 再注册 Random 烟花类型（依赖其他类型已注册）
	if (randomShellPlugin) {
		pluginManager.register(randomShellPlugin);
	}

	// 注册发射序列插件
	pluginManager.registerAll(sequencePlugins);
}

export { initializePlugins };
