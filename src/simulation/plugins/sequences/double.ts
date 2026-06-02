/**
 * @module simulation/plugins/sequences/double
 * @description 双发烟花序列插件。
 */

import { Shell } from '../../shells';
import { shellFromConfig } from '../../shell-configs';
import { getRandomShellSize } from '../../shell-utils';
import type { FireworkPlugin } from '../types';

/**
 * 同时发射两枚随机烟花弹。
 * 两枚烟花分别从画面左右两侧（约 0.3 和 0.7 位置）发射，
 * 第二枚延迟 100ms 发射以产生错落感。延迟取两枚星体寿命的较大值。
 *
 * @returns {number} 下一次序列调用的延迟时间（毫秒）
 */
function seqDouble(): number {
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

const doublePlugin: FireworkPlugin = {
	id: 'sequence-double',
	description: '双发烟花序列',
	sequences: [
		{
			name: 'Double',
			execute: seqDouble,
			randomWeight: 0.8,
		},
	],
};

export { seqDouble };
export default doublePlugin;
