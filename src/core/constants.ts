/**
 * @module core/constants
 * @description 烟花模拟项目的全局常量模块。
 * 包含设备检测、物理参数、画质等级、天空光照、颜色系统及颜色工具函数等核心常量定义。
 */

/**
 * 是否为移动设备。当视口宽度小于等于 640px 时判定为移动设备。
 * @type {boolean}
 * @example
 * if (IS_MOBILE) {
 *   // 使用移动端优化逻辑
 * }
 */
const IS_MOBILE = window.innerWidth <= 640;

/**
 * 是否为桌面设备。当视口宽度大于 800px 时判定为桌面设备。
 * @type {boolean}
 */
const IS_DESKTOP = window.innerWidth > 800;

/**
 * 是否为顶部横幅（Header）模式。当桌面设备且视口高度小于 300px 时判定为横幅模式。
 * @type {boolean}
 */
const IS_HEADER = IS_DESKTOP && window.innerHeight < 300;

/**
 * 检测当前是否为移动设备（响应式，随窗口大小变化更新）。
 * @returns {boolean} 如果当前视口宽度小于等于 640px 则返回 true
 */
function isMobile() {
	return window.innerWidth <= 640;
}

/**
 * 检测当前是否为桌面设备（响应式，随窗口大小变化更新）。
 * @returns {boolean} 如果当前视口宽度大于 800px 则返回 true
 */
function isDesktop() {
	return window.innerWidth > 800;
}

/**
 * 检测当前是否为横幅模式（响应式，随窗口大小变化更新）。
 * @returns {boolean} 如果桌面设备且视口高度小于 300px 则返回 true
 */
function isHeader() {
	return isDesktop() && window.innerHeight < 300;
}

/**
 * 是否为高端设备。根据 CPU 逻辑核心数判断：
 * - 视口宽度 ≤ 1024px 时，至少需要 4 个核心；
 * - 视口宽度 > 1024px 时，至少需要 8 个核心。
 * 若无法获取核心数则默认为非高端设备。
 * @type {boolean}
 */
const IS_HIGH_END_DEVICE = (() => {
	const hwConcurrency = navigator.hardwareConcurrency;
	if (!hwConcurrency) {
		return false;
	}
	const minCount = window.innerWidth <= 1024 ? 4 : 8;
	return hwConcurrency >= minCount;
})();

/**
 * 最大画布宽度（像素），对应 8K 分辨率宽度。
 * @type {number}
 */
const MAX_WIDTH = 7680;

/**
 * 最大画布高度（像素），对应 8K 分辨率高度。
 * @type {number}
 */
const MAX_HEIGHT = 4320;

/**
 * 重力加速度常量，用于烟花粒子的下落模拟。
 * @type {number}
 */
const GRAVITY = 0.9;

/**
 * 低画质等级。
 * @type {number}
 */
const QUALITY_LOW = 1;

/**
 * 普通画质等级。
 * @type {number}
 */
const QUALITY_NORMAL = 2;

/**
 * 高画质等级。
 * @type {number}
 */
const QUALITY_HIGH = 3;

/**
 * 无天空光照。
 * @type {number}
 */
const SKY_LIGHT_NONE = 0;

/**
 * 微弱天空光照。
 * @type {number}
 */
const SKY_LIGHT_DIM = 1;

/**
 * 正常天空光照。
 * @type {number}
 */
const SKY_LIGHT_NORMAL = 2;

/**
 * 烟花颜色映射表，键为颜色名称，值为十六进制颜色代码。
 * @type {Record<string, string>}
 * @example
 * COLOR.Red // '#ff0043'
 * COLOR.Gold // '#ffbf36'
 */
const COLOR: Record<string, string> = {
	Red: '#ff0043',
	Green: '#14fc56',
	Blue: '#1e7fff',
	Purple: '#e60aff',
	Gold: '#ffbf36',
	White: '#ffffff',
};

/**
 * 不可见颜色的特殊标识符，用于表示透明/隐藏的粒子。
 * @type {string}
 */
const INVISIBLE = '_INVISIBLE_';

/**
 * 圆周率的两倍（2π），常用于角度与弧度转换及旋转计算。
 * @type {number}
 */
const PI_2 = Math.PI * 2;

/**
 * 圆周率的一半（π/2），常用于直角相关的计算。
 * @type {number}
 */
const PI_HALF = Math.PI * 0.5;

/**
 * 颜色名称列表，由 {@link COLOR} 的键派生。
 * @type {string[]}
 * @example
 * COLOR_NAMES // ['Red', 'Green', 'Blue', 'Purple', 'Gold', 'White']
 */
const COLOR_NAMES = Object.keys(COLOR);

/**
 * 颜色十六进制代码列表，与 {@link COLOR_NAMES} 顺序对应。
 * @type {string[]}
 * @example
 * COLOR_CODES // ['#ff0043', '#14fc56', '#1e7fff', '#e60aff', '#ffbf36', '#ffffff']
 */
const COLOR_CODES = COLOR_NAMES.map((colorName) => COLOR[colorName]);

/**
 * 包含不可见标识的颜色代码列表，在 {@link COLOR_CODES} 基础上追加 {@link INVISIBLE}。
 * @type {string[]}
 */
const COLOR_CODES_W_INVIS = [...COLOR_CODES, INVISIBLE];

/**
 * 颜色代码到索引的映射表，用于快速查找颜色在 {@link COLOR_CODES_W_INVIS} 中的位置。
 * @type {Record<string, number>}
 * @example
 * COLOR_CODE_INDEXES['#ff0043'] // 0
 * COLOR_CODE_INDEXES['_INVISIBLE_'] // 6
 */
const COLOR_CODE_INDEXES: Record<string, number> = COLOR_CODES_W_INVIS.reduce(
	(obj, code, i) => {
		obj[code] = i;
		return obj;
	},
	{} as Record<string, number>
);

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
 * 颜色十六进制代码到 RGB 元组的映射表，由 {@link COLOR_CODES} 派生。
 * @type {Record<string, ColorTuple>}
 * @example
 * COLOR_TUPLES['#ff0043'] // { r: 255, g: 0, b: 67 }
 */
const COLOR_TUPLES: Record<string, ColorTuple> = {};
COLOR_CODES.forEach((hex) => {
	COLOR_TUPLES[hex] = {
		r: parseInt(hex.slice(1, 3), 16),
		g: parseInt(hex.slice(3, 5), 16),
		b: parseInt(hex.slice(5, 7), 16),
	};
});

/**
 * 从颜色代码列表中随机选取一个颜色。
 * @returns {string} 随机颜色的十六进制代码
 * @example
 * randomColorSimple() // '#14fc56'
 */
function randomColorSimple(): string {
	return COLOR_CODES[(Math.random() * COLOR_CODES.length) | 0];
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
 * @returns {string} 随机颜色的十六进制代码
 * @example
 * randomColor() // '#e60aff'
 * randomColor({ notSame: true }) // 保证不与上次相同
 * randomColor({ notColor: '#ffffff', limitWhite: true })
 */
function randomColor(options?: RandomColorOptions): string {
	const notSame = options && options.notSame;
	const notColor = options && options.notColor;
	const limitWhite = options && options.limitWhite;
	let color = randomColorSimple();

	if (limitWhite && color === COLOR.White && Math.random() < 0.6) {
		color = randomColorSimple();
	}

	if (notSame) {
		let attempts = 0;
		while (color === lastColor && attempts < COLOR_CODES.length) {
			color = randomColorSimple();
			attempts++;
		}
	} else if (notColor) {
		let attempts = 0;
		while (color === notColor && attempts < COLOR_CODES.length) {
			color = randomColorSimple();
			attempts++;
		}
	}

	lastColor = color;
	return color;
}

/**
 * 随机返回金色或白色，各 50% 概率。
 * @returns {string} 金色或白色的十六进制代码
 * @example
 * whiteOrGold() // '#ffbf36' 或 '#ffffff'
 */
function whiteOrGold(): string {
	return Math.random() < 0.5 ? COLOR.Gold : COLOR.White;
}

/**
 * 根据当前设备类型获取默认缩放因子。
 * - 移动设备返回 0.9；
 * - 横幅模式返回 0.75；
 * - 其他情况返回 1。
 * @returns {number} 默认缩放因子
 * @example
 * const scale = getDefaultScaleFactor() // 桌面端返回 1
 */
function getDefaultScaleFactor() {
	if (IS_MOBILE) return 0.9;
	if (IS_HEADER) return 0.75;
	return 1;
}

export {
	IS_MOBILE,
	IS_DESKTOP,
	IS_HEADER,
	IS_HIGH_END_DEVICE,
	isMobile,
	isDesktop,
	isHeader,
	MAX_WIDTH,
	MAX_HEIGHT,
	GRAVITY,
	getDefaultScaleFactor,
	QUALITY_LOW,
	QUALITY_NORMAL,
	QUALITY_HIGH,
	SKY_LIGHT_NONE,
	SKY_LIGHT_DIM,
	SKY_LIGHT_NORMAL,
	COLOR,
	INVISIBLE,
	PI_2,
	PI_HALF,
	COLOR_NAMES,
	COLOR_CODES,
	COLOR_CODES_W_INVIS,
	COLOR_CODE_INDEXES,
	COLOR_TUPLES,
	randomColorSimple,
	randomColor,
	whiteOrGold,
};
