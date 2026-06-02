/**
 * @module simulation/plugins/sequences/small-barrage
 * @description 小型弹幕烟花序列插件。
 */

import { isDesktop, PI_HALF } from '@/core/constants';
import { shellSizeSelector, shellNameSelector } from '@/store/selectors';
import { Shell } from '../../shells';
import { getShellFactory } from '../../shell-registry';
import { randomFastShell } from '../../shell-configs';
import type { FireworkPlugin } from '../types';

/**
 * 发射小型弹幕烟花序列。
 * 以画面中央为起点，向左右两侧对称扩展发射烟花，形成扇形弹幕效果。
 * 发射高度使用余弦函数计算，产生波浪状的高度分布。
 * 桌面端发射 11 枚，移动端发射 5 枚。具有冷却机制（默认 15 秒），
 * 防止该序列被过于频繁地调用。
 *
 * @returns {number} 下一次序列调用的延迟时间（毫秒）
 */
function seqSmallBarrage(): number {
	const barrageCount = isDesktop() ? 11 : 5;
	const specialIndex = isDesktop() ? 3 : 1;
	const shellSize = Math.max(0, shellSizeSelector() - 2);
	const randomMainShellName = Math.random() < 0.78 ? 'Crysanthemum' : 'Ring';
	const randomSpecialShell = randomFastShell();

	function launchShell(x: number, useSpecial: boolean) {
		const isRandom = shellNameSelector() === 'Random';
		const shellType = isRandom
			? useSpecial
				? randomSpecialShell
				: getShellFactory(randomMainShellName)!
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
			const useSpecial = count === specialIndex;
			setTimeout(() => {
				launchShell(0.5 + offset, useSpecial);
			}, delay);
			setTimeout(() => {
				launchShell(0.5 - offset, useSpecial);
			}, delay + delayOffset);
			count += 2;
		}
		delay += 200;
	}

	return 3400 + barrageCount * 120;
}

const smallBarragePlugin: FireworkPlugin = {
	id: 'sequence-small-barrage',
	description: '小型弹幕烟花序列',
	sequences: [
		{
			name: 'Small Barrage',
			execute: seqSmallBarrage,
			randomWeight: 0.08,
			cooldown: 15000,
		},
	],
};

export { seqSmallBarrage };
export default smallBarragePlugin;
