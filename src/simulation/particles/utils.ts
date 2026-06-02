/**
 * @module particles/utils
 * @description 烟花粒子系统工具函数模块，提供粒子弧线分布、球形爆裂分布和粒子集合创建功能。
 */
import { PI_2, PI_HALF, COLOR_CODES_W_INVIS } from '@/core/constants';
import type { StarInstance, SparkInstance } from './types';

/**
 * 沿弧线创建粒子。
 * 在指定的起始角度和弧长范围内，均匀分布指定数量的粒子，
 * 并通过粒子工厂函数创建每个粒子，支持随机偏移。
 *
 * @param start - 起始角度（弧度）
 * @param arcLength - 弧线长度（弧度）
 * @param count - 要创建的粒子数量
 * @param randomness - 随机偏移系数（0 表示无随机，1 表示完全随机）
 * @param particleFactory - 粒子工厂函数，接收角度参数用于创建粒子
 */
function createParticleArc(
	start: number,
	arcLength: number,
	count: number,
	randomness: number,
	particleFactory: (angle: number) => void
) {
	const angleDelta = arcLength / count;
	const end = start + arcLength - angleDelta * 0.5;

	if (end > start) {
		for (let angle = start; angle < end; angle = angle + angleDelta) {
			particleFactory(angle + Math.random() * angleDelta * randomness);
		}
	} else {
		for (let angle = start; angle > end; angle = angle + angleDelta) {
			particleFactory(angle + Math.random() * angleDelta * randomness);
		}
	}
}

/**
 * 创建球形爆裂粒子分布。
 * 将粒子按照球形表面均匀分布，通过同心环的方式从中心向外扩展，
 * 每个环上的粒子数量根据环的半径按比例缩放，模拟真实的球形爆裂效果。
 *
 * @param count - 粒子总数
 * @param particleFactory - 粒子工厂函数，接收角度和速度倍率参数用于创建粒子
 * @param startAngle - 起始角度（弧度），默认为 0
 * @param arcLength - 弧线长度（弧度），默认为 2π（完整圆）
 */
function createBurst(
	count: number,
	particleFactory: (angle: number, speedMult: number) => void,
	startAngle: number = 0,
	arcLength: number = PI_2
) {
	const R = 0.5 * Math.sqrt(count / Math.PI);
	const C = 2 * R * Math.PI;
	const C_HALF = C / 2;

	for (let i = 0; i <= C_HALF; i++) {
		const ringAngle = (i / C_HALF) * PI_HALF;
		const ringSize = Math.cos(ringAngle);
		const partsPerFullRing = C * ringSize;
		const partsPerArc = partsPerFullRing * (arcLength / PI_2);

		const angleInc = PI_2 / partsPerFullRing;
		const angleOffset = Math.random() * angleInc + startAngle;
		const maxRandomAngleOffset = angleInc * 0.33;

		for (let j = 0; j < partsPerArc; j++) {
			const randomAngleOffset = Math.random() * maxRandomAngleOffset;
			const angle = angleInc * j + angleOffset + randomAngleOffset;
			particleFactory(angle, ringSize);
		}
	}
}

/**
 * 创建按颜色键分类的粒子集合。
 * 为每种颜色代码（包括不可见颜色）创建一个空数组，
 * 用于按颜色分组管理粒子实例，便于批量渲染。
 *
 * @returns 以颜色代码为键、粒子数组为值的集合对象
 */
function createParticleCollection(): Record<string, (StarInstance | SparkInstance)[]> {
	const collection: Record<string, (StarInstance | SparkInstance)[]> = {};
	COLOR_CODES_W_INVIS.forEach((color) => {
		collection[color] = [];
	});
	return collection;
}

export { createParticleArc, createBurst, createParticleCollection };
