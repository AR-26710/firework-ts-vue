/**
 * @module shell-configs
 * 烟花弹配置工具模块。提供烟花弹配置的查询和随机选择等工具函数。
 *
 * 烟花类型的注册已迁移至插件系统（src/simulation/plugins/shells/），
 * 新增烟花类型只需在 plugins/shells/ 目录下添加插件文件即可。
 */

import { shellNameSelector } from '@/store/selectors';
import type { ShellConfig } from './shell-utils';
import { Shell } from './shells';
import { getRandomShellSize } from './shell-utils';
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

/**
 * 发射一枚随机快速烟花弹。
 * 使用 randomFastShell 类型创建烟花，发射后基于星体寿命计算延迟。
 * 用于终章（finale）模式的快速连续发射。
 *
 * @returns {number} 下一次序列调用的延迟时间（毫秒）
 */
function seqRandomFastShell(): number {
	const shellType = randomFastShell();
	const size = getRandomShellSize();
	const shell = new Shell(shellType(size.size));
	shell.launch(size.x, size.height);

	const extraDelay = shell.starLife;

	return 900 + Math.random() * 600 + extraDelay;
}

/**
 * 同时发射两枚随机烟花弹。
 * 两枚烟花分别从画面左右两侧（约 0.3 和 0.7 位置）发射，
 * 第二枚延迟 100ms 发射以产生错落感。延迟取两枚星体寿命的较大值。
 * 用于首次序列的 Header 模式。
 *
 * @returns {number} 下一次序列调用的延迟时间（毫秒）
 */
function seqTwoRandom(): number {
	const size1 = getRandomShellSize();
	const size2 = getRandomShellSize();
	const shell1 = new Shell(shellFromConfig(size1.size));
	const shell2 = new Shell(shellFromConfig(size2.size));
	const leftOffset = Math.random() * 0.2 - 0.1;
	const rightOffset = Math.random() * 0.2 - 0.1;
	shell1.launch(0.3 + leftOffset, size1.height);
	setTimeout(() => {
		shell2.launch(0.7 + rightOffset, size2.height);
	}, 100);

	let extraDelay = Math.max(shell1.starLife, shell2.starLife);
	if (shell1.fallingLeaves || shell2.fallingLeaves) {
		extraDelay = 4600;
	}

	return 900 + Math.random() * 600 + extraDelay;
}

export { shellFromConfig, randomFastShell, randomShellName, seqRandomFastShell, seqTwoRandom };
