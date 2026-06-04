/**
 * @module shell-configs
 * 烟花弹配置工具模块。提供烟花弹配置的查询和随机选择等工具函数。
 *
 * 烟花类型的注册已迁移至插件系统（src/simulation/plugins/shells/），
 * 新增烟花类型只需在 plugins/shells/ 目录下添加插件文件即可。
 */

import { shellNameSelector } from '@/store/selectors';
import type { ShellConfig } from './shell-utils';
import {
	getShellNames,
	getShellTypes,
	getShellFactory,
	getFastShellBlacklist,
} from './shell-registry';

/**
 * 随机选择一个烟花弹类型名称。
 * 50% 概率选择菊花，50% 概率从所有类型中随机选择。
 * @returns 烟花弹类型名称字符串
 */
function randomShellName(): string {
	const names = getShellNames();
	return Math.random() < 0.5 ? 'Crysanthemum' : names[(Math.random() * (names.length - 1) + 1) | 0];
}

/**
 * 根据当前全局配置中选定的烟花弹类型名称生成对应配置。
 * @param size - 烟花弹尺寸
 * @returns 对应类型的烟花弹配置对象
 */
function shellFromConfig(size: number): ShellConfig {
	const factory = getShellFactory(shellNameSelector());
	if (!factory) throw new Error(`Shell type "${shellNameSelector()}" not found in registry.`);
	return factory(size);
}

/**
 * 获取随机快速烟花弹工厂函数。
 * 排除持续时间较长的类型，确保快速连续发射时视觉效果紧凑。
 * @returns 烟花弹配置工厂函数
 */
function randomFastShell(): (size: number) => ShellConfig {
	const shellTypes = getShellTypes();
	const blacklist = getFastShellBlacklist();
	const isRandom = shellNameSelector() === 'Random';
	let shellName: string = isRandom ? randomShellName() : shellNameSelector();
	if (isRandom) {
		while (blacklist.includes(shellName)) {
			shellName = randomShellName();
		}
	}
	return shellTypes[shellName];
}

export { shellFromConfig, randomFastShell, randomShellName };
