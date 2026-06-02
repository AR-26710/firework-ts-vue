/**
 * @module particles/spark
 * @description 火花粒子管理模块，使用对象池模式管理 SparkInstance 实例。
 */
import type { SparkInstance } from './types';
import { createParticleCollection } from './utils';

/**
 * 火花粒子管理对象。
 * 使用对象池模式管理 SparkInstance 实例，提供火花粒子的创建和回收功能。
 * 火花粒子是短生命周期的辅助粒子，通常由星形粒子发射，
 * 按颜色分组存储以便批量渲染，绘制宽度为 0 表示使用最小尺寸。
 */
const Spark = {
	/** 火花粒子绘制宽度（像素），0 表示使用最小尺寸 */
	drawWidth: 0,
	/** 火花粒子的空气阻力系数 */
	airDrag: 0.9,

	/** 当前活跃的火花粒子集合，按颜色分组 */
	active: createParticleCollection() as Record<string, SparkInstance[]>,
	/** 对象池，用于回收和复用火花粒子实例 */
	_pool: [] as SparkInstance[],

	/**
	 * 创建新的火花粒子实例。
	 * @returns 初始化后的火花粒子实例
	 */
	_new(): SparkInstance {
		return { x: 0, y: 0, prevX: 0, prevY: 0, color: '', speedX: 0, speedY: 0, life: 0 };
	},

	/**
	 * 添加一个火花粒子实例。
	 * 优先从对象池中获取实例进行复用，若池为空则创建新实例。
	 * 根据角度和速度计算初始速度分量。
	 *
	 * @param x - 初始 X 坐标
	 * @param y - 初始 Y 坐标
	 * @param color - 火花颜色代码
	 * @param angle - 发射角度（弧度）
	 * @param speed - 发射速度
	 * @param life - 生命值（毫秒）
	 * @returns 创建或复用的火花粒子实例
	 */
	add(
		x: number,
		y: number,
		color: string,
		angle: number,
		speed: number,
		life: number
	): SparkInstance {
		const instance = this._pool.pop() || this._new();

		instance.x = x;
		instance.y = y;
		instance.prevX = x;
		instance.prevY = y;
		instance.color = color;
		instance.speedX = Math.sin(angle) * speed;
		instance.speedY = Math.cos(angle) * speed;
		instance.life = life;

		this.active[color].push(instance);
		return instance;
	},

	/**
	 * 将火花粒子实例回收到对象池中，以便后续复用。
	 *
	 * @param instance - 要回收的火花粒子实例
	 */
	returnInstance(instance: SparkInstance) {
		this._pool.push(instance);
	},
};

export { Spark };
