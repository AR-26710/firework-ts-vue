/**
 * @module renderer/sky-renderer
 * @description 天空背景渲染模块。根据当前活跃星体的颜色和数量动态计算
 * 并更新天空背景色，实现烟花照亮天空的视觉效果。
 */

import { getAllColorCodes, getColorTuple } from '@/core/constants';
import { skyLightingSelector } from '@/store/selectors';
import { Star } from '@/simulation/particles/star';
import { getStageContainer } from '@/services/resize';

/** 当前渲染的天空颜色（RGB），用于平滑过渡 */
const currentSkyColor = { r: 0, g: 0, b: 0 };

/** 目标天空颜色（RGB），由活跃星体颜色计算得出 */
const targetSkyColor = { r: 0, g: 0, b: 0 };

/**
 * 根据当前活跃星体的颜色和数量更新天空背景色。
 * 统计所有颜色的活跃星体数量，按比例混合为目标颜色，
 * 再根据天空光照强度和星体总数计算最终饱和度，
 * 最后以插值方式平滑过渡当前天空颜色。
 *
 * @param speed - 当前模拟速度倍率，用于控制颜色过渡的插值步长
 */
export function colorSky(speed: number): void {
	const maxSkySaturation = skyLightingSelector() * 15;
	const maxStarCount = 500;
	let totalStarCount = 0;
	targetSkyColor.r = 0;
	targetSkyColor.g = 0;
	targetSkyColor.b = 0;
	getAllColorCodes().forEach((color) => {
		const tuple = getColorTuple(color);
		const count = Star.active[color]?.length || 0;
		totalStarCount += count;
		targetSkyColor.r += tuple.r * count;
		targetSkyColor.g += tuple.g * count;
		targetSkyColor.b += tuple.b * count;
	});

	const intensity = Math.pow(Math.min(1, totalStarCount / maxStarCount), 0.3);
	const maxColorComponent = Math.max(1, targetSkyColor.r, targetSkyColor.g, targetSkyColor.b);
	targetSkyColor.r = (targetSkyColor.r / maxColorComponent) * maxSkySaturation * intensity;
	targetSkyColor.g = (targetSkyColor.g / maxColorComponent) * maxSkySaturation * intensity;
	targetSkyColor.b = (targetSkyColor.b / maxColorComponent) * maxSkySaturation * intensity;

	const colorChange = 10;
	currentSkyColor.r += ((targetSkyColor.r - currentSkyColor.r) / colorChange) * speed;
	currentSkyColor.g += ((targetSkyColor.g - currentSkyColor.g) / colorChange) * speed;
	currentSkyColor.b += ((targetSkyColor.b - currentSkyColor.b) / colorChange) * speed;

	const canvasContainer = getStageContainer()?.querySelector('.canvas-container') as HTMLElement;
	if (canvasContainer) {
		canvasContainer.style.backgroundColor = `rgb(${currentSkyColor.r | 0}, ${currentSkyColor.g | 0}, ${currentSkyColor.b | 0})`;
	}
}
