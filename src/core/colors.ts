/**
 * @module core/color-system
 * @description 烟花颜色系统模块。
 * 提供颜色池管理、自定义颜色注册、随机颜色选取等功能。
 * 从 constants 模块导入系统内置颜色常量，提供动态颜色扩展能力。
 */

import { COLOR, COLOR_CODES, COLOR_TUPLES, INVISIBLE } from './constants';

/**
 * RGB 颜色元组接口，表示一个颜色的红、绿、蓝通道值。
 * @interface ColorTuple
 * @property {number} r - 红色通道值（0-255）
 * @property {number} g - 绿色通道值（0-255）
 * @property {number} b - 蓝色通道值（0-255）
 */
interface ColorTuple {
	r: number;
	g: number;
	b: number;
}

/**
 * 颜色池接口，用于自定义颜色选择范围。
 * @interface ColorPool
 * @property {string[]} names - 颜色名称列表
 * @property {string[]} codes - 颜色十六进制代码列表
 * @property {Record<string, string>} map - 颜色名称到十六进制代码的映射
 * @property {Record<string, ColorTuple>} tuples - 颜色代码到 RGB 元组的映射
 */
interface ColorPool {
	names: string[];
	codes: string[];
	map: Record<string, string>;
	tuples: Record<string, ColorTuple>;
}

// ========================
// 动态颜色注册表
// ========================

/**
 * 全局自定义颜色注册表，存储用户定义的自定义颜色。
 * 用于渲染器识别并绘制自定义颜色。
 * @type {Record<string, string>}
 */
const _customColorRegistry: Record<string, string> = {};

/**
 * 自定义颜色的 RGB 元组缓存。
 * @type {Record<string, ColorTuple>}
 */
const _customColorTuples: Record<string, ColorTuple> = {};

// ========================
// 颜色代码缓存
// ========================

/** 缓存的所有颜色代码列表（系统内置 + 自定义注册） */
let _cachedAllColorCodes: string[] | null = null;
/** 缓存的所有颜色代码列表（含不可见标识） */
let _cachedAllColorCodesWithInvis: string[] | null = null;

/** 使颜色代码缓存失效，下次访问时重新计算 */
function _invalidateColorCache(): void {
	_cachedAllColorCodes = null;
	_cachedAllColorCodesWithInvis = null;
}

/**
 * 将十六进制颜色代码解析为 RGB 元组。
 * @param {string} hex - 十六进制颜色代码（如 '#ff0043'）
 * @returns {ColorTuple} RGB 元组
 */
function _parseHexToTuple(hex: string): ColorTuple {
	return {
		r: parseInt(hex.slice(1, 3), 16),
		g: parseInt(hex.slice(3, 5), 16),
		b: parseInt(hex.slice(5, 7), 16),
	};
}

/**
 * 注册自定义颜色到全局渲染注册表。
 * 注册后，渲染器可识别并绘制该颜色。如果颜色已存在则跳过。
 * @param {string} name - 颜色名称
 * @param {string} hex - 十六进制颜色代码
 */
function registerCustomColorForRendering(name: string, hex: string): void {
	if (!_customColorRegistry[name]) {
		_customColorRegistry[name] = hex;
		_customColorTuples[hex] = _parseHexToTuple(hex);
		_invalidateColorCache();
	}
}

/**
 * 批量注册自定义颜色到全局渲染注册表。
 * @param {Record<string, string>} colors - 颜色名称到十六进制代码的映射
 */
function registerCustomColorsForRendering(colors: Record<string, string>): void {
	for (const [name, hex] of Object.entries(colors)) {
		registerCustomColorForRendering(name, hex);
	}
}

/**
 * 获取所有已注册的颜色代码（系统内置 + 自定义注册）。
 * 结果会被缓存，仅在自定义颜色注册变更时重新计算。
 * @returns {string[]} 颜色代码列表
 */
function getAllColorCodes(): string[] {
	if (_cachedAllColorCodes) return _cachedAllColorCodes;
	const allCodes = [...COLOR_CODES];
	for (const hex of Object.values(_customColorRegistry)) {
		if (!allCodes.includes(hex)) {
			allCodes.push(hex);
		}
	}
	_cachedAllColorCodes = allCodes;
	return allCodes;
}

/**
 * 获取所有已注册的颜色代码（含不可见标识）。
 * 结果会被缓存，仅在自定义颜色注册变更时重新计算。
 * @returns {string[]} 颜色代码列表（含 INVISIBLE）
 */
function getAllColorCodesWithInvis(): string[] {
	if (_cachedAllColorCodesWithInvis) return _cachedAllColorCodesWithInvis;
	_cachedAllColorCodesWithInvis = [...getAllColorCodes(), INVISIBLE];
	return _cachedAllColorCodesWithInvis;
}

/**
 * 获取指定颜色的 RGB 元组（系统内置或自定义注册）。
 * @param {string} hex - 十六进制颜色代码
 * @returns {ColorTuple} RGB 元组，若未找到则返回黑色
 */
function getColorTuple(hex: string): ColorTuple {
	return COLOR_TUPLES[hex] || _customColorTuples[hex] || { r: 0, g: 0, b: 0 };
}

/**
 * 创建颜色池，将系统内置颜色与自定义颜色合并。
 * 当 useSystemColors 为 false 时，仅使用自定义颜色。
 * @param {Record<string, string>} [customColors] - 自定义颜色映射
 * @param {boolean} [useSystemColors=true] - 是否包含系统内置颜色
 * @returns {ColorPool} 颜色池对象
 */
function createColorPool(
	customColors?: Record<string, string>,
	useSystemColors: boolean = true
): ColorPool {
	const map: Record<string, string> = {};
	if (useSystemColors) {
		Object.assign(map, COLOR);
	}
	if (customColors) {
		Object.assign(map, customColors);
	}
	const names = Object.keys(map);
	const codes = names.map((n) => map[n]);
	const tuples: Record<string, ColorTuple> = {};
	codes.forEach((hex) => {
		tuples[hex] = _parseHexToTuple(hex);
	});
	return { names, codes, map, tuples };
}

/**
 * 从颜色代码列表中随机选取一个颜色。
 * @param {string[]} [colorCodes] - 可选的颜色代码列表，默认使用系统内置颜色
 * @returns {string} 随机颜色的十六进制代码
 * @example
 * randomColorSimple() // '#14fc56'
 */
function randomColorSimple(colorCodes?: string[]): string {
	const codes = colorCodes || COLOR_CODES;
	return codes[(Math.random() * codes.length) | 0];
}

let lastColor: string | undefined;

/**
 * 随机颜色选项接口。
 * @interface RandomColorOptions
 * @property {boolean} [notSame] - 是否避免与上次选取的颜色相同
 * @property {string} [notColor] - 需要排除的特定颜色代码
 * @property {boolean} [limitWhite] - 是否限制白色出现的概率（白色有 60% 概率被重新随机）
 */
interface RandomColorOptions {
	notSame?: boolean;
	notColor?: string;
	limitWhite?: boolean;
}

/**
 * 根据选项生成随机颜色代码。
 * 支持避免重复颜色、排除特定颜色以及限制白色出现概率。
 * @param {RandomColorOptions} [options] - 随机颜色选项
 * @param {boolean} [options.notSame] - 是否避免与上次选取的颜色相同
 * @param {string} [options.notColor] - 需要排除的特定颜色代码
 * @param {boolean} [options.limitWhite] - 是否限制白色出现的概率
 * @param {string[]} [colorCodes] - 可选的颜色代码列表，默认使用系统内置颜色
 * @returns {string} 随机颜色的十六进制代码
 * @example
 * randomColor() // '#e60aff'
 * randomColor({ notSame: true }) // 保证不与上次相同
 * randomColor({ notColor: '#ffffff', limitWhite: true })
 */
function randomColor(options?: RandomColorOptions, colorCodes?: string[]): string {
	const notSame = options && options.notSame;
	const notColor = options && options.notColor;
	const limitWhite = options && options.limitWhite;
	const codes = colorCodes || COLOR_CODES;
	let color = randomColorSimple(codes);

	if (limitWhite && color === COLOR.White && Math.random() < 0.6) {
		color = randomColorSimple(codes);
	}

	if (notSame) {
		let attempts = 0;
		while (color === lastColor && attempts < codes.length) {
			color = randomColorSimple(codes);
			attempts++;
		}
	} else if (notColor) {
		let attempts = 0;
		while (color === notColor && attempts < codes.length) {
			color = randomColorSimple(codes);
			attempts++;
		}
	}

	lastColor = color;
	return color;
}

/**
 * 随机返回金色或白色，各 50% 概率。
 * 当提供自定义颜色池时，从自定义颜色中随机选取。
 * @param {ColorPool} [pool] - 可选的颜色池，不提供时使用系统内置颜色
 * @returns {string} 金色或白色的十六进制代码（无颜色池时），或随机自定义颜色代码
 * @example
 * whiteOrGold() // '#ffbf36' 或 '#ffffff'
 */
function whiteOrGold(pool?: ColorPool): string {
	if (pool && pool.codes.length > 0) {
		return randomColorSimple(pool.codes);
	}
	return Math.random() < 0.5 ? COLOR.Gold : COLOR.White;
}

export type { ColorTuple, ColorPool };

export {
	registerCustomColorForRendering,
	registerCustomColorsForRendering,
	getAllColorCodes,
	getAllColorCodesWithInvis,
	getColorTuple,
	createColorPool,
	randomColorSimple,
	randomColor,
	whiteOrGold,
};
