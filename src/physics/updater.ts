/**
 * @module physics/updater
 * @description 物理更新模块入口。负责每帧协调全局状态更新、星体更新、
 * 火花更新以及渲染调用。具体更新逻辑已拆分至子模块。
 */

import { simSpeed } from '@/core/state';
import { isRunning } from '@/store/selectors';
import { render } from '@/renderer/renderer';
import { updateGlobals, getSpeedBarOpacity } from './global';
import { updateStars } from './star';
import { updateSparks } from './spark';

/**
 * 主物理更新函数，每帧调用一次。
 * 按顺序执行：全局状态更新 → 星体物理更新 → 火花物理更新 → 渲染。
 *
 * @param frameTime - 本帧原始时间步长（毫秒），由动画循环提供
 * @param lag       - 帧间延迟因子，用于平滑插值计算
 */
export function update(frameTime: number, lag: number) {
	if (!isRunning()) return;

	const timeStep = frameTime * simSpeed;
	const speed = simSpeed * lag;

	updateGlobals(timeStep, lag);
	updateStars(speed, timeStep);
	updateSparks(speed, timeStep);
	render(speed, getSpeedBarOpacity());
}
