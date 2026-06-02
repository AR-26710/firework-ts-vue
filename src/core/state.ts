/**
 * 可变全局状态模块
 *
 * 提供烟花模拟器的全局可变状态，包括模拟速度、舞台尺寸和质量等级。
 * 所有状态变量均为模块内部变量，通过导出的 setter 函数进行跨模块修改，
 * 以确保状态变更的可追踪性。
 */

/** 模拟速度倍率，默认为 1（正常速度） */
let simSpeed = 1;
export { simSpeed };

/**
 * 设置模拟速度倍率
 *
 * @param val - 模拟速度倍率，1 表示正常速度
 */
export function setSimSpeed(val: number) {
	simSpeed = val;
}

/** 舞台宽度（像素），默认为 0 */
let stageW = 0,
	/** 舞台高度（像素），默认为 0 */
	stageH = 0;
export { stageW, stageH };

/**
 * 设置舞台尺寸
 *
 * @param w - 舞台宽度（像素）
 * @param h - 舞台高度（像素）
 */
export function setStageDimensions(w: number, h: number) {
	stageW = w;
	stageH = h;
}

/** 质量等级数值，1=低质量，2=正常质量，3=高质量，默认为 1 */
let quality = 1;
/** 是否为低质量模式（quality === 1），默认为 false */
let isLowQuality = false;
/** 是否为正常质量模式（quality === 2），默认为 true */
let isNormalQuality = true;
/** 是否为高质量模式（quality === 3），默认为 false */
let isHighQuality = false;
export { quality, isLowQuality, isNormalQuality, isHighQuality };

/**
 * 设置质量等级，同时更新所有质量布尔标志
 *
 * @param val - 质量等级：1=低质量，2=正常质量，3=高质量
 */
export function setQuality(val: number) {
	quality = val;
	isLowQuality = val === 1;
	isNormalQuality = val === 2;
	isHighQuality = val === 3;
}
