/**
 * @module particles/burst-flash
 * @description 爆裂闪光管理模块，使用对象池模式管理 BurstFlashInstance 实例。
 */
import type { BurstFlashInstance } from './types';

/**
 * 爆裂闪光管理对象。
 * 使用对象池模式管理 BurstFlashInstance 实例，
 * 提供爆裂闪光的创建和回收功能，避免频繁的内存分配。
 */
const BurstFlash = {
	/** 当前活跃的爆裂闪光实例列表 */
	active: [] as BurstFlashInstance[],
	/** 对象池，用于回收和复用爆裂闪光实例 */
	_pool: [] as BurstFlashInstance[],

	/**
	 * 创建新的爆裂闪光实例。
	 * @returns 初始化后的爆裂闪光实例
	 */
	_new(): BurstFlashInstance {
		return { x: 0, y: 0, radius: 0 };
	},

	/**
	 * 添加一个爆裂闪光实例。
	 * 优先从对象池中获取实例进行复用，若池为空则创建新实例。
	 *
	 * @param x - 闪光中心 X 坐标
	 * @param y - 闪光中心 Y 坐标
	 * @param radius - 闪光半径
	 * @returns 创建或复用的爆裂闪光实例
	 */
	add(x: number, y: number, radius: number): BurstFlashInstance {
		const instance = this._pool.pop() || this._new();

		instance.x = x;
		instance.y = y;
		instance.radius = radius;

		this.active.push(instance);
		return instance;
	},

	/**
	 * 将爆裂闪光实例回收到对象池中，以便后续复用。
	 *
	 * @param instance - 要回收的爆裂闪光实例
	 */
	returnInstance(instance: BurstFlashInstance) {
		this._pool.push(instance);
	},
};

export { BurstFlash };
