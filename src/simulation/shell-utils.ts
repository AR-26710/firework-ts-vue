/**
 * @module shell-utils
 * 烟花弹工具模块，提供烟花弹配置接口定义、位置计算及尺寸生成等基础工具函数。
 */

import { shellSizeSelector } from '@/store/selectors';

/**
 * 烟花弹配置接口，定义烟花弹的所有视觉与行为参数。
 */
interface ShellConfig {
	/** 烟花弹基础尺寸，影响扩散范围和星体寿命 */
	shellSize: number;
	/** 烟花弹爆炸扩散半径（像素） */
	spreadSize: number;
	/** 星体（火花粒子）基础寿命（毫秒） */
	starLife: number;
	/** 星体寿命随机变化比例，默认 0.125 */
	starLifeVariation?: number;
	/** 星体密度系数，影响星体数量，默认 1 */
	starDensity?: number;
	/** 星体数量，若未指定则根据 spreadSize 和 starDensity 自动计算 */
	starCount?: number;
	/** 主颜色，支持单色字符串或双色数组 */
	color: string | string[];
	/** 副颜色，用于星体颜色过渡效果 */
	secondColor?: string | null;
	/** 闪光类型：'light' | 'medium' | 'heavy' | 'thick' | 'streamer' | 'willow' | '' */
	glitter: string;
	/** 闪光颜色 */
	glitterColor?: string;
	/** 是否显示花心（内层小烟花） */
	pistil?: boolean;
	/** 花心颜色，false 表示不使用花心颜色 */
	pistilColor?: string | false;
	/** 是否显示拖尾流线效果 */
	streamers?: boolean;
	/** 是否为环形烟花 */
	ring?: boolean;
	/** 是否为交叉分裂烟花（星体消亡时分裂为多个小星体） */
	crossette?: boolean;
	/** 是否为花卉效果（星体消亡时产生花朵形绽放） */
	floral?: boolean;
	/** 是否为落叶效果（星体消亡时产生飘落叶片效果） */
	fallingLeaves?: boolean;
	/** 是否为噼啪效果（星体消亡时产生小型爆裂） */
	crackle?: boolean;
	/** 是否为马尾效果（星体跟随彗星轨迹下落） */
	horsetail?: boolean;
	/** 是否启用频闪效果 */
	strobe?: boolean;
	/** 频闪颜色，null 表示不使用频闪颜色 */
	strobeColor?: string | null;
	/** 彗星（升空拖尾粒子）实例 */
	comet?: import('./particles/types').StarInstance;
	/** 文字烟花中要显示的字符 */
	textString?: string;
}

/**
 * 烟花弹尺寸计算结果，包含爆炸尺寸和发射位置信息。
 */
interface ShellSizeResult {
	/** 烟花弹爆炸扩散尺寸 */
	size: number;
	/** 发射水平位置（0~1 归一化坐标） */
	x: number;
	/** 发射高度（0~1 归一化坐标，0 为底部，1 为顶部） */
	height: number;
}

/**
 * 检测字符是否为 CJK（中日韩）全角文字。
 * 覆盖 CJK 统一表意文字、扩展区、兼容区、标点符号、全角形式、日文假名及韩文音节。
 * @param char - 待检测的单个字符
 * @returns 若为 CJK 字符返回 true，否则返回 false
 */
function isCJKChar(char: string): boolean {
	const code = char.charCodeAt(0);
	return (
		(code >= 0x4e00 && code <= 0x9fff) || // CJK 统一表意文字
		(code >= 0x3400 && code <= 0x4dbf) || // CJK 扩展 A
		(code >= 0x20000 && code <= 0x2a6df) || // CJK 扩展 B
		(code >= 0xf900 && code <= 0xfaff) || // CJK 兼容表意文字
		(code >= 0x2f800 && code <= 0x2fa1f) || // CJK 兼容补充
		(code >= 0x3000 && code <= 0x303f) || // CJK 标点符号
		(code >= 0xff00 && code <= 0xffef) || // 全角形式
		(code >= 0x3040 && code <= 0x309f) || // 日文平假名
		(code >= 0x30a0 && code <= 0x30ff) || // 日文片假名
		(code >= 0xac00 && code <= 0xd7af)
	); // 韩文音节
}

/**
 * 检测文本中是否包含 CJK 字符。
 * @param text - 待检测的文本字符串
 * @returns 若文本中包含至少一个 CJK 字符返回 true，否则返回 false
 */
function hasCJK(text: string): boolean {
	return [...text].some(isCJKChar);
}

/**
 * 将水平位置约束在安全边界内，避免烟花弹在屏幕边缘爆炸。
 * 将 [0, 1] 映射到 [0.18, 0.82] 的范围内。
 * @param position - 原始水平位置（0~1 归一化坐标）
 * @returns 约束后的水平位置（0.18~0.82）
 */
function fitShellPositionInBoundsH(position: number): number {
	const edge = 0.18;
	return (1 - edge * 2) * position + edge;
}

/**
 * 将垂直位置约束在安全范围内，限制烟花弹最大爆炸高度不超过屏幕 75%。
 * @param position - 原始垂直位置（0~1 归一化坐标）
 * @returns 约束后的垂直位置（0~0.75）
 */
function fitShellPositionInBoundsV(position: number): number {
	return position * 0.75;
}

/**
 * 获取随机水平发射位置（已约束在安全边界内）。
 * @returns 随机水平位置（0.18~0.82）
 */
function getRandomShellPositionH(): number {
	return fitShellPositionInBoundsH(Math.random());
}

/**
 * 获取随机垂直发射高度（已约束在安全范围内）。
 * @returns 随机垂直位置（0~0.75）
 */
function getRandomShellPositionV(): number {
	return fitShellPositionInBoundsV(Math.random());
}

/**
 * 获取随机烟花弹尺寸及发射位置。
 * 尺寸基于全局 shellSizeSelector 的基准值，加入随机方差；
 * 较大的烟花弹倾向于在更高的位置爆炸，且更靠近屏幕中心。
 * @returns 包含尺寸、水平位置和高度的 ShellSizeResult 对象
 */
function getRandomShellSize(): ShellSizeResult {
	const baseSize = shellSizeSelector();
	const maxVariance = Math.min(2.5, baseSize);
	const variance = Math.random() * maxVariance;
	const size = baseSize - variance;
	const height = maxVariance === 0 ? Math.random() : 1 - variance / maxVariance;
	const centerOffset = Math.random() * (1 - height * 0.65) * 0.5;
	const x = Math.random() < 0.5 ? 0.5 - centerOffset : 0.5 + centerOffset;
	return {
		size,
		x: fitShellPositionInBoundsH(x),
		height: fitShellPositionInBoundsV(height),
	};
}

export {
	isCJKChar,
	hasCJK,
	fitShellPositionInBoundsH,
	fitShellPositionInBoundsV,
	getRandomShellPositionH,
	getRandomShellPositionV,
	getRandomShellSize,
};

export type { ShellConfig, ShellSizeResult };
