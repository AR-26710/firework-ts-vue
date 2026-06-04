/**
 * @module renderer/renderer
 * @description 烟花渲染模块。负责将烟花模拟中的粒子（星体、火花、爆炸闪光）绘制到 Canvas 上。
 * 使用双层 Canvas 架构：trailsStage 用于绘制拖尾和闪光（带半透明覆盖实现渐隐效果），
 * mainStage 用于绘制当前帧的明亮粒子。
 * 天空背景渲染已提取至 renderer/sky-renderer。
 */

import { COLOR, SKY_LIGHT_NONE, getAllColorCodes } from '@/core/constants';
import { simSpeed, stageW, stageH, isLowQuality } from '@/core/state';
import { getMainStage, getTrailsStage } from '@/core/stages';
import { store } from '@/store/store';
import { skyLightingSelector, scaleFactorSelector } from '@/store/selectors';
import { Star } from '@/simulation/particles/star';
import { Spark } from '@/simulation/particles/spark';
import { BurstFlash } from '@/simulation/particles/burst-flash';
import { colorSky } from './sky-renderer';

/**
 * 主渲染函数。每帧调用，负责绘制所有烟花粒子效果。
 *
 * 渲染流程：
 * 1. 若天空光照开启，调用 colorSky 更新天空背景色
 * 2. 设置 Canvas 缩放比例（DPR × 缩放因子）
 * 3. 在 trailsStage 上绘制半透明黑色矩形实现拖尾渐隐效果（长曝光模式下使用极低透明度）
 * 4. 清空 mainStage
 * 5. 绘制爆炸闪光（BurstFlash），使用径向渐变模拟光晕
 * 6. 以 'lighten' 混合模式绘制星体（Star）拖尾和当前位置
 * 7. 绘制火花（Spark）拖尾
 * 8. 若速度条透明度大于 0，在画面底部绘制速度指示条
 * 9. 重置 Canvas 变换矩阵
 *
 * @param speed - 当前模拟速度倍率，影响拖尾渐隐速度和天空颜色过渡
 * @param speedBarOpacity - 速度指示条的透明度（0~1），为 0 时不绘制
 */
export function render(speed: number, speedBarOpacity: number) {
	const mainStage = getMainStage();
	const trailsStage = getTrailsStage();
	const { dpr } = mainStage;
	const width = stageW;
	const height = stageH;
	const trailsCtx = trailsStage.ctx;
	const mainCtx = mainStage.ctx;

	if (skyLightingSelector() !== SKY_LIGHT_NONE) {
		colorSky(speed);
	}

	const scaleFactor = scaleFactorSelector();
	trailsCtx.scale(dpr * scaleFactor, dpr * scaleFactor);
	mainCtx.scale(dpr * scaleFactor, dpr * scaleFactor);

	trailsCtx.globalCompositeOperation = 'source-over';
	trailsCtx.fillStyle = `rgba(0, 0, 0, ${store.state.config.longExposure ? 0.0025 : 0.175 * speed})`;
	trailsCtx.fillRect(0, 0, width, height);

	mainCtx.clearRect(0, 0, width, height);

	while (BurstFlash.active.length) {
		const bf = BurstFlash.active.pop()!;

		const burstGradient = trailsCtx.createRadialGradient(bf.x, bf.y, 0, bf.x, bf.y, bf.radius);
		burstGradient.addColorStop(0.024, 'rgba(255, 255, 255, 1)');
		burstGradient.addColorStop(0.125, 'rgba(255, 160, 20, 0.2)');
		burstGradient.addColorStop(0.32, 'rgba(255, 140, 20, 0.11)');
		burstGradient.addColorStop(1, 'rgba(255, 120, 20, 0)');
		trailsCtx.fillStyle = burstGradient;
		trailsCtx.fillRect(bf.x - bf.radius, bf.y - bf.radius, bf.radius * 2, bf.radius * 2);

		BurstFlash.returnInstance(bf);
	}

	trailsCtx.globalCompositeOperation = 'lighten';

	trailsCtx.lineWidth = Star.drawWidth;
	trailsCtx.lineCap = isLowQuality ? 'square' : 'round';
	mainCtx.strokeStyle = '#fff';
	mainCtx.lineWidth = 1;
	mainCtx.beginPath();
	getAllColorCodes().forEach((color) => {
		const stars = Star.active[color];
		trailsCtx.strokeStyle = color;
		trailsCtx.beginPath();
		stars.forEach((star) => {
			if (star.visible) {
				trailsCtx.moveTo(star.x, star.y);
				trailsCtx.lineTo(star.prevX, star.prevY);
				mainCtx.moveTo(star.x, star.y);
				mainCtx.lineTo(star.x - star.speedX * 1.6, star.y - star.speedY * 1.6);
			}
		});
		trailsCtx.stroke();
	});
	mainCtx.stroke();

	trailsCtx.lineWidth = Spark.drawWidth;
	trailsCtx.lineCap = 'butt';
	getAllColorCodes().forEach((color) => {
		const sparks = Spark.active[color];
		trailsCtx.strokeStyle = color;
		trailsCtx.beginPath();
		sparks.forEach((spark) => {
			trailsCtx.moveTo(spark.x, spark.y);
			trailsCtx.lineTo(spark.prevX, spark.prevY);
		});
		trailsCtx.stroke();
	});

	if (speedBarOpacity) {
		const speedBarHeight = 6;
		mainCtx.globalAlpha = speedBarOpacity;
		mainCtx.fillStyle = COLOR.Blue;
		mainCtx.fillRect(0, height - speedBarHeight, width * simSpeed, speedBarHeight);
		mainCtx.globalAlpha = 1;
	}

	trailsCtx.setTransform(1, 0, 0, 1, 0, 0);
	mainCtx.setTransform(1, 0, 0, 1, 0, 0);
}
