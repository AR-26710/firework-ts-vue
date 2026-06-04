/**
 * @module physics/spark-updater
 * @description 火花物理更新模块。负责每帧更新所有火花（Spark）的位置、
 * 速度、空气阻力、重力及生命周期管理。
 */

import { GRAVITY, getAllColorCodesWithInvis } from '@/core/constants';
import { Spark } from '@/simulation/particles/spark';

/**
 * 更新所有火花的物理状态。
 *
 * @param speed - 应用了模拟速度倍率和帧延迟因子的综合速度系数
 * @param timeStep - 经过模拟速度缩放后的时间步长（毫秒）
 */
export function updateSparks(speed: number, timeStep: number): void {
	const sparkDrag = 1 - (1 - Spark.airDrag) * speed;
	const gAcc = (timeStep / 1000) * GRAVITY;

	getAllColorCodesWithInvis().forEach((color) => {
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
}
