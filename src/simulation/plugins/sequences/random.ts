/**
 * @module simulation/plugins/sequences/random
 * @description 随机元序列插件。由调度器特殊处理，随机选择其他序列执行。
 */

import type { FireworkPlugin } from '../types';

/**
 * 随机元序列执行函数。
 * 返回 0，实际序列选择由调度器处理。
 *
 * @returns {number} 固定返回 0
 */
function seqRandom(): number {
	return 0;
}

const randomPlugin: FireworkPlugin = {
	id: 'sequence-random',
	description: '随机元序列，由调度器特殊处理',
	sequences: [
		{
			name: 'Random',
			execute: seqRandom,
		},
	],
};

export { seqRandom };
export default randomPlugin;
