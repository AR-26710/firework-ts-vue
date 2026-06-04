/**
 * @module core/device
 * @description 设备检测模块。提供设备类型（移动端、桌面端、头部模式）和
 * 高端设备判断的静态与响应式功能。
 */

/**
 * 是否为移动设备。当视口宽度小于等于 640px 时判定为移动设备。
 * 在模块加载时计算，不随窗口大小变化更新。
 */
const IS_MOBILE = window.innerWidth <= 640;

/**
 * 是否为桌面设备。当视口宽度大于 800px 时判定为桌面设备。
 * 在模块加载时计算，不随窗口大小变化更新。
 */
const IS_DESKTOP = window.innerWidth > 800;

/**
 * 是否为顶部横幅（Header）模式。当桌面设备且视口高度小于 300px 时判定为横幅模式。
 * 在模块加载时计算，不随窗口大小变化更新。
 */
const IS_HEADER = IS_DESKTOP && window.innerHeight < 300;

/**
 * 是否为高端设备。根据 CPU 逻辑核心数判断：
 * - 视口宽度 ≤ 1024px 时，至少需要 4 个核心；
 * - 视口宽度 > 1024px 时，至少需要 8 个核心。
 * 若无法获取核心数则默认为非高端设备。
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
 * 检测当前是否为移动设备（响应式，随窗口大小变化更新）。
 */
function isMobile(): boolean {
	return window.innerWidth <= 640;
}

/**
 * 检测当前是否为桌面设备（响应式，随窗口大小变化更新）。
 */
function isDesktop(): boolean {
	return window.innerWidth > 800;
}

/**
 * 检测当前是否为横幅模式（响应式，随窗口大小变化更新）。
 */
function isHeader(): boolean {
	return isDesktop() && window.innerHeight < 300;
}

/**
 * 根据当前设备类型获取默认缩放因子。
 * - 移动设备返回 0.9；
 * - 横幅模式返回 0.75；
 * - 其他情况返回 1。
 */
function getDefaultScaleFactor(): number {
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
	getDefaultScaleFactor,
};
