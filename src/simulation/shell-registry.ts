/**
 * @module simulation/shell-registry
 * @description 烟花弹类型注册表。提供声明式注册烟花弹类型的机制，
 * 新增烟花类型只需调用 registerShell 即可，无需修改其他模块。
 */

import type { ShellConfig } from './shell-utils';

/**
 * 烟花弹类型注册项。
 */
interface ShellRegistryEntry {
	/** 烟花弹类型名称（英文标识，如 'Crysanthemum'） */
	name: string;
	/** 烟花弹配置工厂函数 */
	factory: (size?: number) => ShellConfig;
	/** 是否为快速烟花弹黑名单类型（持续时间过长，不适合快速连续发射） */
	fastBlacklisted?: boolean;
}

/**
 * 烟花弹类型注册表内部存储。
 * 键名为烟花弹类型名称，值为注册项。
 */
const entries = new Map<string, ShellRegistryEntry>();

/**
 * 注册一个烟花弹类型。
 * 注册后该类型会自动出现在 UI 选项和随机选择池中。
 *
 * @param entry - 烟花弹类型注册项
 * @throws 如果名称已注册则抛出错误
 *
 * @example
 * ```ts
 * registerShell({
 *   name: 'MyShell',
 *   factory: (size = 1) => ({ shellSize: size, ... }),
 *   fastBlacklisted: false
 * });
 * ```
 */
function registerShell(entry: ShellRegistryEntry): void {
	if (entries.has(entry.name)) {
		throw new Error(`Shell type "${entry.name}" is already registered.`);
	}
	entries.set(entry.name, entry);
}

/**
 * 批量注册烟花弹类型。
 *
 * @param entries - 烟花弹类型注册项数组
 */
function registerShells(entries: ShellRegistryEntry[]): void {
	entries.forEach(registerShell);
}

/**
 * 获取所有已注册的烟花弹类型名称列表。
 * 包含 'Random' 在内，顺序与注册顺序一致。
 *
 * @returns 烟花弹类型名称数组
 */
function getShellNames(): string[] {
	const names = Array.from(entries.keys());
	// 'Random' 始终排在首位
	const randomIdx = names.indexOf('Random');
	if (randomIdx > 0) {
		names.splice(randomIdx, 1);
		names.unshift('Random');
	}
	return names;
}

/**
 * 获取所有已注册的烟花弹类型工厂函数映射表。
 * 键名为类型名称，值为对应的配置工厂函数。
 *
 * @returns 烟花弹类型工厂映射表
 */
function getShellTypes(): Record<string, (size?: number) => ShellConfig> {
	const result: Record<string, (size?: number) => ShellConfig> = {};
	entries.forEach((entry, name) => {
		result[name] = entry.factory;
	});
	return result;
}

/**
 * 获取指定名称的烟花弹类型工厂函数。
 *
 * @param name - 烟花弹类型名称
 * @returns 配置工厂函数，若未找到则返回 undefined
 */
function getShellFactory(name: string): ((size?: number) => ShellConfig) | undefined {
	return entries.get(name)?.factory;
}

/**
 * 获取快速烟花弹黑名单。
 * 这些类型因效果持续时间过长而不适合快速连续发射。
 *
 * @returns 黑名单类型名称数组
 */
function getFastShellBlacklist(): string[] {
	const blacklist: string[] = [];
	entries.forEach((entry, name) => {
		if (entry.fastBlacklisted) {
			blacklist.push(name);
		}
	});
	return blacklist;
}

export {
	registerShell,
	registerShells,
	getShellNames,
	getShellTypes,
	getShellFactory,
	getFastShellBlacklist,
};

export type { ShellRegistryEntry };
