/**
 * @module simulation/plugins/sequences/triple
 * @description 三连发烟花序列插件。
 */

import { shellSizeSelector } from '@/store/selectors';
import { Shell } from '../../shells';
import { randomFastShell } from '../../shell-configs';
import type { FireworkPlugin } from '../types';

/**
 * 发射三连发烟花。
 * 中央先发射一枚大尺寸快速烟花，左右两侧各延迟约 1 秒后发射一枚小尺寸烟花，
 * 形成三连发的视觉效果。
 *
 * @returns {number} 下一次序列调用的延迟时间（毫秒），固定返回 4000
 */
function seqTriple(): number {
	const shellType = randomFastShell();
	const baseSize = shellSizeSelector();
	const smallSize = Math.max(0, baseSize - 1.25);

	const offset = Math.random() * 0.08 - 0.04;
	const shell1 = new Shell(shellType(baseSize));
	shell1.launch(0.5 + offset, 0.7);

	const leftDelay = 1000 + Math.random() * 400;
	const rightDelay = 1000 + Math.random() * 400;

	setTimeout(() => {
		const offset = Math.random() * 0.08 - 0.04;
		const shell2 = new Shell(shellType(smallSize));
		shell2.launch(0.2 + offset, 0.1);
	}, leftDelay);

	setTimeout(() => {
		const offset = Math.random() * 0.08 - 0.04;
		const shell3 = new Shell(shellType(smallSize));
		shell3.launch(0.8 + offset, 0.1);
	}, rightDelay);

	return 4000;
}

const triplePlugin: FireworkPlugin = {
	id: 'sequence-triple',
	description: '三连发烟花序列',
	sequences: [
		{
			name: 'Triple',
			execute: seqTriple,
			randomWeight: 1.0,
		},
	],
};

export { seqTriple };
export default triplePlugin;
