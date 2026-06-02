/**
 * @module simulation/plugins/sequences/single
 * @description 单发烟花序列插件。
 */

import { isHeader } from '@/core/constants';
import { Shell } from '../../shells';
import { shellFromConfig } from '../../shell-configs';
import { getRandomShellSize } from '../../shell-utils';
import type { FireworkPlugin } from '../types';

/**
 * 发射一枚随机配置的烟花弹。
 * 根据随机尺寸创建 Shell 并发射，延迟时间基于星体寿命计算，
 * 若烟花包含落叶效果则使用固定额外延迟。
 *
 * @returns {number} 下一次序列调用的延迟时间（毫秒）
 */
function seqSingle(): number {
	const size = getRandomShellSize();
	const shell = new Shell(shellFromConfig(size.size));
	shell.launch(size.x, size.height);

	let extraDelay = shell.starLife;
	if (shell.fallingLeaves) {
		extraDelay = 4600;
	}

	return 900 + Math.random() * 600 + extraDelay;
}

const singlePlugin: FireworkPlugin = {
	id: 'sequence-single',
	description: '单发烟花序列',
	sequences: [
		{
			name: 'Single',
			execute: seqSingle,
			randomWeight: 0.6,
			randomCondition: () => !isHeader(),
		},
	],
};

export { seqSingle };
export default singlePlugin;
