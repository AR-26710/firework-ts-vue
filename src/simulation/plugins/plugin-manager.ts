/**
 * @module simulation/plugins/plugin-manager
 * @description 插件管理器。负责插件的注册、加载、初始化和生命周期管理，
 * 支持动态发现和加载新插件。
 */

import type { FireworkPlugin, PluginInfo, PluginState } from './types';
import { registerShells } from '../shell-registry';
import { registerSequences } from '../sequences/sequence-registry';

/**
 * 插件管理器类。提供插件的注册、加载、查询和卸载功能。
 * 单例模式，通过 `pluginManager` 导出使用。
 */
class PluginManager {
	/** 已注册的插件映射表，键为插件 ID */
	private plugins = new Map<string, PluginInfo>();

	/**
	 * 注册一个插件。
	 * 注册后插件的 shells 和 sequences 会自动注册到对应的注册表中。
	 *
	 * @param plugin - 要注册的插件
	 * @throws 如果插件 ID 已存在则抛出错误
	 */
	register(plugin: FireworkPlugin): void {
		if (this.plugins.has(plugin.id)) {
			throw new Error(`Plugin "${plugin.id}" is already registered.`);
		}

		const info: PluginInfo = {
			plugin,
			state: 'registered',
			registeredAt: Date.now(),
		};
		this.plugins.set(plugin.id, info);

		// 注册烟花类型
		if (plugin.shells?.length) {
			registerShells(plugin.shells);
		}

		// 注册发射序列
		if (plugin.sequences?.length) {
			registerSequences(plugin.sequences);
		}

		// 调用初始化钩子
		if (plugin.onInit) {
			plugin.onInit();
			info.state = 'initialized';
		} else {
			info.state = 'initialized';
		}
	}

	/**
	 * 批量注册插件。
	 *
	 * @param plugins - 插件数组
	 */
	registerAll(plugins: FireworkPlugin[]): void {
		plugins.forEach((p) => this.register(p));
	}

	/**
	 * 卸载一个插件。
	 * 调用插件的 onDestroy 钩子，并从管理器中移除。
	 * 注意：已注册到 shell/sequence 注册表中的条目不会被移除（注册表暂不支持注销）。
	 *
	 * @param id - 插件 ID
	 * @returns 是否成功卸载
	 */
	unregister(id: string): boolean {
		const info = this.plugins.get(id);
		if (!info) return false;

		if (info.plugin.onDestroy) {
			info.plugin.onDestroy();
		}
		info.state = 'destroyed';
		this.plugins.delete(id);
		return true;
	}

	/**
	 * 获取指定插件的信息。
	 *
	 * @param id - 插件 ID
	 * @returns 插件信息，若未找到则返回 undefined
	 */
	getPlugin(id: string): PluginInfo | undefined {
		return this.plugins.get(id);
	}

	/**
	 * 获取所有已注册插件的信息。
	 *
	 * @returns 插件信息数组
	 */
	getAllPlugins(): PluginInfo[] {
		return Array.from(this.plugins.values());
	}

	/**
	 * 获取所有已注册插件的 ID 列表。
	 *
	 * @returns 插件 ID 数组
	 */
	getPluginIds(): string[] {
		return Array.from(this.plugins.keys());
	}

	/**
	 * 检查指定插件是否已注册。
	 *
	 * @param id - 插件 ID
	 * @returns 是否已注册
	 */
	has(id: string): boolean {
		return this.plugins.has(id);
	}

	/**
	 * 获取指定插件的状态。
	 *
	 * @param id - 插件 ID
	 * @returns 插件状态，若未找到则返回 'unregistered'
	 */
	getState(id: string): PluginState {
		return this.plugins.get(id)?.state ?? 'unregistered';
	}

	/**
	 * 获取已注册插件的数量。
	 */
	get size(): number {
		return this.plugins.size;
	}
}

/** 全局插件管理器单例 */
const pluginManager = new PluginManager();

export { PluginManager, pluginManager };
