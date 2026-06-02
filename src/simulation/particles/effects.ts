/**
 * @module particles/effects
 * @description 烟花粒子特效模块，提供十字裂变、花束、落叶、噼啪等烟花特效。
 */
import { PI_2, PI_HALF, COLOR, INVISIBLE } from '@/core/constants';
import { quality, isHighQuality } from '@/core/state';
import { soundManager } from '@/audio/sound-manager';
import type { StarInstance } from './types';
import { Star } from './star';
import { Spark } from './spark';
import { BurstFlash } from './burst-flash';
import { createParticleArc, createBurst } from './utils';

/**
 * 十字裂变特效。
 * 当星形粒子死亡时，在其位置沿四个方向（十字形）分裂出新的星形粒子，
 * 模拟烟花弹分裂成多个小火花的效果。
 *
 * @param star - 触发裂变效果的星形粒子实例
 */
function crossetteEffect(star: StarInstance) {
	const startAngle = Math.random() * PI_HALF;
	createParticleArc(startAngle, PI_2, 4, 0.5, (angle) => {
		Star.add(star.x, star.y, star.color, angle, Math.random() * 0.6 + 0.75, 600);
	});
}

/**
 * 花束特效。
 * 当星形粒子死亡时，在其位置产生球形爆裂，创建大量新的星形粒子，
 * 并附带爆裂闪光和音效，模拟烟花绽放成花束的效果。
 * 粒子数量受画质设置影响。
 *
 * @param star - 触发花束效果的星形粒子实例
 */
function floralEffect(star: StarInstance) {
	const count = 12 + 6 * quality;
	createBurst(count, (angle, speedMult) => {
		Star.add(
			star.x,
			star.y,
			star.color,
			angle,
			speedMult * 2.4,
			1000 + Math.random() * 300,
			star.speedX,
			star.speedY
		);
	});
	BurstFlash.add(star.x, star.y, 46);
	soundManager.playSound('burstSmall');
}

/**
 * 落叶特效。
 * 当星形粒子死亡时，在其位置产生球形爆裂，创建不可见的星形粒子，
 * 这些粒子会持续发射金色火花，模拟烟花如落叶般飘散并拖曳金色尾迹的效果。
 * 附带爆裂闪光和音效。
 *
 * @param star - 触发落叶效果的星形粒子实例
 */
function fallingLeavesEffect(star: StarInstance) {
	createBurst(7, (angle, speedMult) => {
		const newStar = Star.add(
			star.x,
			star.y,
			INVISIBLE,
			angle,
			speedMult * 2.4,
			2400 + Math.random() * 600,
			star.speedX,
			star.speedY
		);

		newStar.sparkColor = COLOR.Gold;
		newStar.sparkFreq = 144 / quality;
		newStar.sparkSpeed = 0.28;
		newStar.sparkLife = 750;
		newStar.sparkLifeVariation = 3.2;
	});
	BurstFlash.add(star.x, star.y, 46);
	soundManager.playSound('burstSmall');
}

/**
 * 噼啪特效。
 * 当星形粒子死亡时，在其位置沿全圆弧发射金色火花粒子，
 * 模拟烟花噼啪作响并迸发小火花的效果。
 * 火花数量受画质设置影响。
 *
 * @param star - 触发噼啪效果的星形粒子实例
 */
function crackleEffect(star: StarInstance) {
	const count = isHighQuality ? 32 : 16;
	createParticleArc(0, PI_2, count, 1.8, (angle) => {
		Spark.add(
			star.x,
			star.y,
			COLOR.Gold,
			angle,
			Math.pow(Math.random(), 0.45) * 2.4,
			300 + Math.random() * 200
		);
	});
}

export { crossetteEffect, floralEffect, fallingLeavesEffect, crackleEffect };
