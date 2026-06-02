/**
 * @module physics/updater
 * @description 物理更新模块，负责每帧更新烟花模拟的全局状态、所有星体（Star）和火花（Spark）的物理属性，
 * 包括位置、速度、空气阻力、重力、旋转、火花生成、颜色过渡、频闪效果以及生命周期管理，
 * 并在更新完成后调用渲染函数进行绘制。
 */

import { GRAVITY, INVISIBLE, PI_2, COLOR_CODES_W_INVIS } from '@/core/constants';
import { simSpeed } from '@/core/state';
import { store } from '@/store/store';
import { isRunning } from '@/store/selectors';
import { Star } from '@/simulation/particles/star';
import { Spark } from '@/simulation/particles/spark';
import { startSequence } from '@/simulation/sequences/dispatcher';
import { render } from '@/renderer/renderer';
import { getIsUpdatingSpeed } from '@/input/pointer-handler';
import { getSpeedBarOpacityRef } from '@/input/shortcuts';

/** 当前帧计数器，用于标记粒子是否已在当前帧更新过，避免重复处理 */
let currentFrame = 0;

/** 速度条透明度值，控制速度调节条在界面上的显示与淡出效果 */
let speedBarOpacity = 0;

/** 自动发射计时器，倒计时归零时触发下一次烟花自动发射序列 */
let autoLaunchTime = 0;

/**
 * 更新全局状态，每帧调用一次。
 * 递增帧计数器、处理速度条透明度的淡出与键盘覆盖、以及自动发射计时器的倒计时。
 *
 * @param timeStep - 经过模拟速度缩放后的时间步长（毫秒），用于物理计算
 * @param lag      - 帧间延迟因子，用于平滑插值计算
 */
function updateGlobals(timeStep: number, lag: number) {
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

/**
 * 主物理更新函数，每帧调用一次。
 * 更新所有星体（Star）和火花（Spark）的物理状态，包括：
 * - 位置与速度的更新（含空气阻力与重力）
 * - 旋转运动（spinRadius / spinAngle）
 * - 火花生成（sparkFreq / sparkTimer）
 * - 颜色过渡（secondColor / transitionTime）
 * - 频闪效果（strobe）
 * - 生命周期管理与死亡回收
 *
 * 更新完成后调用渲染函数进行绘制。
 *
 * @param frameTime - 本帧原始时间步长（毫秒），由动画循环提供
 * @param lag       - 帧间延迟因子，用于平滑插值计算
 */
export function update(frameTime: number, lag: number) {
	if (!isRunning()) return;

	const timeStep = frameTime * simSpeed;
	const speed = simSpeed * lag;

	updateGlobals(timeStep, lag);

	const starDrag = 1 - (1 - Star.airDrag) * speed;
	const starDragHeavy = 1 - (1 - Star.airDragHeavy) * speed;
	const sparkDrag = 1 - (1 - Spark.airDrag) * speed;
	const gAcc = (timeStep / 1000) * GRAVITY;
	COLOR_CODES_W_INVIS.forEach((color) => {
		const stars = Star.active[color];
		for (let i = stars.length - 1; i >= 0; i = i - 1) {
			const star = stars[i];
			if (star.updateFrame === currentFrame) {
				continue;
			}
			star.updateFrame = currentFrame;

			star.life -= timeStep;
			if (star.life <= 0) {
				stars[i] = stars[stars.length - 1];
				stars.pop();
				Star.returnInstance(star);
			} else {
				const burnRate = Math.pow(star.life / star.fullLife, 0.5);
				const burnRateInverse = 1 - burnRate;

				star.prevX = star.x;
				star.prevY = star.y;
				star.x += star.speedX * speed;
				star.y += star.speedY * speed;
				if (!star.heavy) {
					star.speedX *= starDrag;
					star.speedY *= starDrag;
				} else {
					star.speedX *= starDragHeavy;
					star.speedY *= starDragHeavy;
				}
				star.speedY += gAcc;

				if (star.spinRadius) {
					star.spinAngle += star.spinSpeed * speed;
					star.x += Math.sin(star.spinAngle) * star.spinRadius * speed;
					star.y += Math.cos(star.spinAngle) * star.spinRadius * speed;
				}

				if (star.sparkFreq) {
					star.sparkTimer -= timeStep;
					while (star.sparkTimer < 0) {
						star.sparkTimer += star.sparkFreq * 0.75 + star.sparkFreq * burnRateInverse * 4;
						Spark.add(
							star.x,
							star.y,
							star.sparkColor,
							Math.random() * PI_2,
							Math.random() * star.sparkSpeed * burnRate,
							star.sparkLife * 0.8 + Math.random() * star.sparkLifeVariation * star.sparkLife
						);
					}
				}

				if (star.life < (star.transitionTime || 0)) {
					if (star.secondColor && !star.colorChanged) {
						star.colorChanged = true;
						star.color = star.secondColor;
						stars[i] = stars[stars.length - 1];
						stars.pop();
						Star.active[star.secondColor].push(star);
						if (star.secondColor === INVISIBLE) {
							star.sparkFreq = 0;
						}
					}

					if (star.strobe) {
						star.visible = Math.floor(star.life / (star.strobeFreq || 40)) % 3 === 0;
					}
				}
			}
		}

		const sparks = Spark.active[color];
		for (let i = sparks.length - 1; i >= 0; i = i - 1) {
			const spark = sparks[i];
			spark.life -= timeStep;
			if (spark.life <= 0) {
				sparks[i] = sparks[sparks.length - 1];
				sparks.pop();
				Spark.returnInstance(spark);
			} else {
				spark.prevX = spark.x;
				spark.prevY = spark.y;
				spark.x += spark.speedX * speed;
				spark.y += spark.speedY * speed;
				spark.speedX *= sparkDrag;
				spark.speedY *= sparkDrag;
				spark.speedY += gAcc;
			}
		}
	});

	render(speed, speedBarOpacity);
}
