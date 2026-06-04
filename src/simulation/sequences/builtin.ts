/**
 * @module sequences/builtin-sequences
 * 内置序列执行函数。提供直接创建并发射烟花弹的序列函数，
 * 返回延迟时间用于序列调度。
 */

import { Shell } from '../shells';
import { getRandomShellSize } from '../shell-utils';
import { randomFastShell, shellFromConfig } from '../shell-configs';

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

export { seqRandomFastShell, seqTwoRandom };
