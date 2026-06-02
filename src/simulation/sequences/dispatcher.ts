/**
 * @module simulation/sequences/dispatcher
 * @description 主序列调度器，根据当前状态和选择的发射序列执行合适的烟花发射序列。
 * 通过序列注册表实现可扩展的调度逻辑，新增序列无需修改此模块。
 *
 * 发射序列的注册已迁移至插件系统（src/simulation/plugins/sequences/），
 * 新增发射序列只需在 plugins/sequences/ 目录下添加插件文件即可。
 */

import { isHeader } from '@/core/constants';
import { finaleSelector, launchSequenceSelector, shellSizeSelector } from '@/store/selectors';
import { Shell } from '../shells';
import { getShellFactory } from '../shell-registry';
import { seqRandomFastShell, seqTwoRandom } from '../shell-configs';
import {
	getSequenceNames,
	executeSequence,
	isCooledDown,
	getRandomWeightedSequences,
} from './sequence-registry';

let isFirstSeq = true;
const finaleCount = 32;
let currentFinaleCount = 0;

/**
 * 主序列调度器。根据当前状态和选择的发射序列执行合适的烟花发射序列。
 *
 * 调度逻辑：
 * - 首次调用时，Header 模式下发射双发烟花，否则发射单枚菊花烟花
 * - 终章（finale）模式下，快速连续发射随机快速烟花，共 32 轮
 * - 如果选择了特定序列，则直接执行该序列
 * - 选择"随机"时，按权重概率选择序列
 *
 * @returns {number} 下一次序列调用的延迟时间（毫秒）
 */
function startSequence(): number {
	if (isFirstSeq) {
		isFirstSeq = false;
		if (isHeader()) {
			return seqTwoRandom();
		} else {
			const factory = getShellFactory('Crysanthemum');
			if (!factory) throw new Error('Crysanthemum shell type not found in registry.');
			const shell = new Shell(factory(shellSizeSelector()));
			shell.launch(0.5, 0.5);
			return 2400;
		}
	}

	if (finaleSelector()) {
		seqRandomFastShell();
		if (currentFinaleCount < finaleCount) {
			currentFinaleCount++;
			return 170;
		} else {
			currentFinaleCount = 0;
			return 6000;
		}
	}

	const selectedSequence = launchSequenceSelector();

	// 如果选择了特定序列，直接执行
	if (selectedSequence !== 'Random') {
		return executeSequence(selectedSequence);
	}

	// 随机模式：按权重概率选择序列
	// 权重按升序排列，依次判断 rand < weight，命中则执行
	const rand = Math.random();
	const weightedSequences = getRandomWeightedSequences();

	for (const entry of weightedSequences) {
		if (rand < entry.randomWeight!) {
			// 检查冷却条件
			if (!isCooledDown(entry.name)) continue;
			// 检查前置条件
			if (entry.randomCondition && !entry.randomCondition()) continue;
			return executeSequence(entry.name);
		}
	}

	return 0;
}

export { startSequence, getSequenceNames as launchSequenceNames };
