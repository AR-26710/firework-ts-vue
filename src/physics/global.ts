/**
 * @module physics/global-updater
 * @description 全局状态更新模块。负责每帧更新帧计数器、速度条透明度
 * 以及自动发射计时器。
 */

import { store } from '@/store/store';
import { getIsUpdatingSpeed } from '@/input/pointer-handler';
import { getSpeedBarOpacityRef } from '@/input/shortcuts';
import { startSequence } from '@/simulation/sequences/dispatcher';

/** 当前帧计数器，用于标记粒子是否已在当前帧更新过，避免重复处理 */
let currentFrame = 0;

/** 速度条透明度值，控制速度调节条在界面上的显示与淡出效果 */
let speedBarOpacity = 0;

/** 自动发射计时器，倒计时归零时触发下一次烟花自动发射序列 */
let autoLaunchTime = 0;

/**
 * 获取当前帧计数。
 */
export function getCurrentFrame(): number {
	return currentFrame;
}

/**
 * 获取当前速度条透明度。
 */
export function getSpeedBarOpacity(): number {
	return speedBarOpacity;
}

/**
 * 更新全局状态，每帧调用一次。
 * 递增帧计数器、处理速度条透明度的淡出与键盘覆盖、以及自动发射计时器的倒计时。
 *
 * @param timeStep - 经过模拟速度缩放后的时间步长（毫秒），用于物理计算
 * @param lag      - 帧间延迟因子，用于平滑插值计算
 */
export function updateGlobals(timeStep: number, lag: number): void {
	currentFrame++;

	if (!getIsUpdatingSpeed()) {
		speedBarOpacity -= lag / 30;
		if (speedBarOpacity < 0) {
			speedBarOpacity = 0;
		}
	}

	// 键盘操作设置的速度条透明度
	const kbRef = getSpeedBarOpacityRef();
	if (kbRef.value > 0) {
		speedBarOpacity = kbRef.value;
		kbRef.value = 0;
	}

	if (store.state.config.autoLaunch) {
		autoLaunchTime -= timeStep;
		if (autoLaunchTime <= 0) {
			autoLaunchTime = startSequence() * 1.25;
		}
	}
}
