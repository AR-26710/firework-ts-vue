/**
 * @module physics/star-updater
 * @description 星体物理更新模块。负责每帧更新所有星体（Star）的位置、
 * 速度、旋转、火花生成、颜色过渡、频闪效果及生命周期管理。
 */

import { GRAVITY, INVISIBLE, PI_2, getAllColorCodesWithInvis } from '@/core/constants';
import { Star } from '@/simulation/particles/star';
import { Spark } from '@/simulation/particles/spark';
import { getCurrentFrame } from './global';

/**
 * 更新所有星体的物理状态。
 *
 * @param speed - 应用了模拟速度倍率和帧延迟因子的综合速度系数
 * @param timeStep - 经过模拟速度缩放后的时间步长（毫秒）
 */
export function updateStars(speed: number, timeStep: number): void {
	const currentFrame = getCurrentFrame();
	const starDrag = 1 - (1 - Star.airDrag) * speed;
	const starDragHeavy = 1 - (1 - Star.airDragHeavy) * speed;
	const gAcc = (timeStep / 1000) * GRAVITY;

	getAllColorCodesWithInvis().forEach((color) => {
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
	});
}
