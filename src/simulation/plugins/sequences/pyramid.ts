/**
 * @module simulation/plugins/sequences/pyramid
 * @description 金字塔阵型烟花序列插件。
 */

import { isDesktop } from '@/core/constants';
import { shellSizeSelector, shellNameSelector } from '@/store/selectors';
import { Shell } from '../../shells';
import { getShellFactory } from '../../shell-registry';
import { randomFastShell } from '../../shell-configs';
import type { FireworkPlugin } from '../types';

/**
 * 发射金字塔阵型烟花。
 * 从两侧向中央依次发射，形成金字塔形状的烟花排列。
 * 中央最后一发使用大尺寸特殊烟花，两侧使用小尺寸常规烟花。
 * 桌面端每侧 7 发，移动端每侧 4 发。
 *
 * @returns {number} 下一次序列调用的延迟时间（毫秒）
 */
function seqPyramid(): number {
	const barrageCountHalf = isDesktop() ? 7 : 4;
	const largeSize = shellSizeSelector();
	const smallSize = Math.max(0, largeSize - 3);
	const randomMainShellName = Math.random() < 0.78 ? 'Crysanthemum' : 'Ring';

	function launchShell(x: number, useSpecial: boolean) {
		const isRandom = shellNameSelector() === 'Random';
		const shellType = isRandom
			? useSpecial
				? randomFastShell()
				: getShellFactory(randomMainShellName)!
			: getShellFactory(shellNameSelector())!;
		const shell = new Shell(shellType(useSpecial ? largeSize : smallSize));
		const height = x <= 0.5 ? x / 0.5 : (1 - x) / 0.5;
		shell.launch(x, useSpecial ? 0.75 : height * 0.42);
	}

	let count = 0;
	let delay = 0;
	while (count <= barrageCountHalf) {
		if (count === barrageCountHalf) {
			setTimeout(() => {
				launchShell(0.5, true);
			}, delay);
		} else {
			const offset = (count / barrageCountHalf) * 0.5;
			const delayOffset = Math.random() * 30 + 30;
			setTimeout(() => {
				launchShell(offset, false);
			}, delay);
			setTimeout(() => {
				launchShell(1 - offset, false);
			}, delay + delayOffset);
		}

		count++;
		delay += 200;
	}

	return 3400 + barrageCountHalf * 250;
}

const pyramidPlugin: FireworkPlugin = {
	id: 'sequence-pyramid',
	description: '金字塔阵型烟花序列',
	sequences: [
		{
			name: 'Pyramid',
			execute: seqPyramid,
			randomWeight: 0.1,
		},
	],
};

export { seqPyramid };
export default pyramidPlugin;
