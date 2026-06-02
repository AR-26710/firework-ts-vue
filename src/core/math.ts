// OLD VERSION DO NOT USE
// Older pens still rely on this.

/**
 * Math.js
 * -----------
 * Handy math/trig reference.
 *
 * Author: Caleb Miller
 *         caleb@caleb-miller.com
 */

/**
 * 数学工具模块，提供常用的数学计算方法，包括角度/弧度转换、距离计算、
 * 向量分解、随机数生成和数值钳制等功能。
 *
 * @module Maths
 */
export const Maths = (function MathsFactory(Math: Math) {
	const Maths = {} as {
		toDeg: number;
		toRad: number;
		halfPI: number;
		twoPI: number;
		dist: (width: number, height: number) => number;
		pointDist: (x1: number, y1: number, x2: number, y2: number) => number;
		angle: (width: number, height: number) => number;
		pointAngle: (x1: number, y1: number, x2: number, y2: number) => number;
		splitVector: (speed: number, angle: number) => { x: number; y: number };
		random: (min: number, max: number) => number;
		randomInt: (min: number, max: number) => number;
		randomChoice: (...args: unknown[]) => unknown;
		clamp: (num: number, min: number, max: number) => number;
	};

	/**
	 * 弧度转角度的换算常量，值为 180 / π ≈ 57.2958。
	 * 使用方式：角度 = 弧度 × toDeg
	 *
	 * @example
	 * const degrees = Math.PI * Maths.toDeg; // 180
	 */
	Maths.toDeg = 180 / Math.PI;

	/**
	 * 角度转弧度的换算常量，值为 π / 180 ≈ 0.01745。
	 * 使用方式：弧度 = 角度 × toRad
	 *
	 * @example
	 * const radians = 90 * Maths.toRad; // ≈ 1.5708 (π/2)
	 */
	Maths.toRad = Math.PI / 180;

	/**
	 * 二分之π常量，值为 π / 2 ≈ 1.5708。
	 * 表示 90 度对应的弧度值。
	 *
	 * @example
	 * const rightAngle = Maths.halfPI; // ≈ 1.5708
	 */
	Maths.halfPI = Math.PI / 2;

	/**
	 * 二倍π常量，值为 2π ≈ 6.2832。
	 * 表示一个完整圆周对应的弧度值。
	 *
	 * @example
	 * const fullCircle = Maths.twoPI; // ≈ 6.2832
	 */
	Maths.twoPI = Math.PI * 2;

	/**
	 * 使用勾股定理计算直角三角形的斜边长度（即两点在水平和垂直方向上的距离的合成距离）。
	 *
	 * @param width - 水平方向的距离（直角边之一）
	 * @param height - 垂直方向的距离（直角边之一）
	 * @returns 斜边长度，即 √(width² + height²)
	 *
	 * @example
	 * Maths.dist(3, 4); // 5
	 * Maths.dist(1, 1); // ≈ 1.4142
	 */
	Maths.dist = (width, height) => {
		return Math.sqrt(width * width + height * height);
	};

	/**
	 * 计算二维平面上两点之间的欧几里得距离。
	 *
	 * @param x1 - 第一个点的 x 坐标
	 * @param y1 - 第一个点的 y 坐标
	 * @param x2 - 第二个点的 x 坐标
	 * @param y2 - 第二个点的 y 坐标
	 * @returns 两点之间的距离，即 √((x2-x1)² + (y2-y1)²)
	 *
	 * @example
	 * Maths.pointDist(0, 0, 3, 4); // 5
	 * Maths.pointDist(1, 1, 4, 5); // 5
	 */
	Maths.pointDist = (x1, y1, x2, y2) => {
		const distX = x2 - x1;
		const distY = y2 - y1;
		return Math.sqrt(distX * distX + distY * distY);
	};

	/**
	 * 计算二维向量的角度（以弧度为单位）。
	 * 返回值以正上方（y 轴负方向）为 0 弧度，顺时针递增。
	 * 等价于 π/2 + atan2(height, width)。
	 *
	 * @param width - 向量的水平分量
	 * @param height - 向量的垂直分量
	 * @returns 向量的角度，单位为弧度，范围 [0, 2π)
	 *
	 * @example
	 * Maths.angle(0, -1);  // ≈ 0（正上方）
	 * Maths.angle(1, 0);   // ≈ π/2（正右方）
	 * Maths.angle(0, 1);   // ≈ π（正下方）
	 */
	Maths.angle = (width, height) => Maths.halfPI + Math.atan2(height, width);

	/**
	 * 计算二维平面上从点 (x1, y1) 到点 (x2, y2) 的方向角度（以弧度为单位）。
	 * 返回值以正上方为 0 弧度，顺时针递增。
	 * 等价于 π/2 + atan2(y2-y1, x2-x1)。
	 *
	 * @param x1 - 起始点的 x 坐标
	 * @param y1 - 起始点的 y 坐标
	 * @param x2 - 目标点的 x 坐标
	 * @param y2 - 目标点的 y 坐标
	 * @returns 从起始点指向目标点的角度，单位为弧度
	 *
	 * @example
	 * Maths.pointAngle(0, 0, 0, -1); // ≈ 0（正上方）
	 * Maths.pointAngle(0, 0, 1, 0);  // ≈ π/2（正右方）
	 */
	Maths.pointAngle = (x1, y1, x2, y2) => Maths.halfPI + Math.atan2(y2 - y1, x2 - x1);

	/**
	 * 将一个速度向量按指定角度分解为 x 和 y 方向的分量。
	 * 角度以正上方为 0 弧度，顺时针递增（与 {@link angle} 和 {@link pointAngle} 的约定一致）。
	 *
	 * @param speed - 速度大小（标量）
	 * @param angle - 方向角度，单位为弧度
	 * @returns 包含 x 和 y 分量的对象，其中 y 分量取反以适配屏幕坐标系（y 轴向下为正）
	 *
	 * @example
	 * Maths.splitVector(10, 0);          // { x: 0, y: -10 }（向上）
	 * Maths.splitVector(10, Math.PI / 2); // { x: 10, y: 0 }（向右）
	 */
	Maths.splitVector = (speed, angle) => ({
		x: Math.sin(angle) * speed,
		y: -Math.cos(angle) * speed,
	});

	/**
	 * 生成一个在 [min, max) 范围内的随机浮点数。
	 * 包含 min，不包含 max。
	 *
	 * @param min - 随机数范围的下界（包含）
	 * @param max - 随机数范围的上界（不包含）
	 * @returns 在 [min, max) 范围内的随机浮点数
	 *
	 * @example
	 * Maths.random(0, 1);  // 可能返回 0.5、0.123 等
	 * Maths.random(5, 10); // 可能返回 7.89 等
	 */
	Maths.random = (min, max) => Math.random() * (max - min) + min;

	/**
	 * 生成一个在 [min, max] 范围内的随机整数。
	 * 包含 min 和 max。
	 *
	 * @param min - 随机整数范围的下界（包含）
	 * @param max - 随机整数范围的上界（包含）
	 * @returns 在 [min, max] 范围内的随机整数
	 *
	 * @example
	 * Maths.randomInt(1, 6);  // 可能返回 1、2、3、4、5、6（模拟骰子）
	 * Maths.randomInt(0, 10); // 可能返回 0 到 10 之间的任意整数
	 */
	Maths.randomInt = (min, max) => ((Math.random() * (max - min + 1)) | 0) + min;

	/**
	 * 从提供的参数中随机选择一个元素返回。
	 * 如果只传入一个参数且该参数为数组，则从数组中随机选择一个元素；
	 * 否则从所有传入的参数中随机选择一个。
	 *
	 * @param args - 可选值列表，或单个数组
	 * @returns 随机选中的元素
	 *
	 * @example
	 * Maths.randomChoice('a', 'b', 'c');     // 可能返回 'a'、'b' 或 'c'
	 * Maths.randomChoice([10, 20, 30, 40]);  // 可能返回 10、20、30 或 40
	 */
	Maths.randomChoice = function randomChoice(...args: unknown[]): unknown {
		if (args.length === 1 && Array.isArray(args[0])) {
			const choices = args[0];
			return choices[(Math.random() * choices.length) | 0];
		}
		return args[(Math.random() * args.length) | 0];
	};

	/**
	 * 将一个数值钳制（限制）在指定的最小值和最大值之间。
	 * 如果数值小于最小值则返回最小值，大于最大值则返回最大值，否则返回原值。
	 *
	 * @param num - 需要钳制的数值
	 * @param min - 允许的最小值
	 * @param max - 允许的最大值
	 * @returns 钳制后的数值，范围在 [min, max] 之间
	 *
	 * @example
	 * Maths.clamp(5, 0, 10);   // 5（在范围内，返回原值）
	 * Maths.clamp(-3, 0, 10);  // 0（小于最小值，返回最小值）
	 * Maths.clamp(15, 0, 10);  // 10（大于最大值，返回最大值）
	 */
	Maths.clamp = function clamp(num, min, max) {
		return Math.min(Math.max(num, min), max);
	};

	return Maths;
})(Math);
