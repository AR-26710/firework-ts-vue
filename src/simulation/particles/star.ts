/**
 * @module particles/star
 * @description 星形粒子管理模块，使用对象池模式管理 StarInstance 实例。
 */
import { PI_2 } from '@/core/constants';
import type { StarInstance } from './types';
import { createParticleCollection } from './utils';

/**
 * 星形粒子管理对象。
 * 使用对象池模式管理 StarInstance 实例，提供星形粒子的创建和回收功能。
 * 星形粒子是烟花爆炸后的主要粒子类型，按颜色分组存储以便批量渲染。
 * 具有普通和重型两种空气阻力系数，支持继承父粒子速度。
 */
const Star = {
	/** 星形粒子绘制宽度（像素） */
	drawWidth: 3,
	/** 普通星形粒子的空气阻力系数 */
	airDrag: 0.98,
	/** 重型星形粒子的空气阻力系数（阻力更小，下落更快） */
	airDragHeavy: 0.992,

	/** 当前活跃的星形粒子集合，按颜色分组 */
	active: createParticleCollection() as Record<string, StarInstance[]>,
	/** 对象池，用于回收和复用星形粒子实例 */
	_pool: [] as StarInstance[],

	/**
	 * 创建新的星形粒子实例。
	 * @returns 初始化后的星形粒子实例
	 */
	_new(): StarInstance {
		return {
			visible: true,
			heavy: false,
			x: 0,
			y: 0,
			prevX: 0,
			prevY: 0,
			color: '',
			speedX: 0,
			speedY: 0,
			life: 0,
			fullLife: 0,
			spinAngle: 0,
			spinSpeed: 0,
			spinRadius: 0,
			sparkFreq: 0,
			sparkSpeed: 0,
			sparkTimer: 0,
			sparkColor: '',
			sparkLife: 0,
			sparkLifeVariation: 0,
			strobe: false,
		};
	},

	/**
	 * 添加一个星形粒子实例。
	 * 优先从对象池中获取实例进行复用，若池为空则创建新实例。
	 * 根据角度和速度计算初始速度分量，并支持叠加额外的速度偏移。
	 *
	 * @param x - 初始 X 坐标
	 * @param y - 初始 Y 坐标
	 * @param color - 粒子颜色代码
	 * @param angle - 发射角度（弧度）
	 * @param speed - 发射速度
	 * @param life - 生命值（毫秒）
	 * @param speedOffX - X 方向速度偏移（可选），用于继承父粒子速度
	 * @param speedOffY - Y 方向速度偏移（可选），用于继承父粒子速度
	 * @returns 创建或复用的星形粒子实例
	 */
	add(
		x: number,
		y: number,
		color: string,
		angle: number,
		speed: number,
		life: number,
		speedOffX?: number,
		speedOffY?: number
	): StarInstance {
		const instance = this._pool.pop() || this._new();

		instance.visible = true;
		instance.heavy = false;
		instance.x = x;
		instance.y = y;
		instance.prevX = x;
		instance.prevY = y;
		instance.color = color;
		instance.speedX = Math.sin(angle) * speed + (speedOffX || 0);
		instance.speedY = Math.cos(angle) * speed + (speedOffY || 0);
		instance.life = life;
		instance.fullLife = life;
		instance.spinAngle = Math.random() * PI_2;
		instance.spinSpeed = 0.8;
		instance.spinRadius = 0;
		instance.sparkFreq = 0;
		instance.sparkSpeed = 1;
		instance.sparkTimer = 0;
		instance.sparkColor = color;
		instance.sparkLife = 750;
		instance.sparkLifeVariation = 0.25;
		instance.strobe = false;

		this.active[color].push(instance);
		return instance;
	},

	/**
	 * 将星形粒子实例回收到对象池中，以便后续复用。
	 * 回收时会触发粒子的 onDeath 回调，并清除死亡回调和颜色过渡相关属性。
	 *
	 * @param instance - 要回收的星形粒子实例
	 */
	returnInstance(instance: StarInstance) {
		instance.onDeath?.(instance);
		instance.onDeath = null;
		instance.secondColor = null;
		instance.transitionTime = 0;
		instance.colorChanged = false;
		this._pool.push(instance);
	},
};

export { Star };
