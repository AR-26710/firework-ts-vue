/**
 * @module particles/types
 * @description 烟花粒子系统类型定义模块，包含所有粒子实例的接口定义。
 */

/**
 * 星形粒子实例接口。
 * 表示烟花爆炸后的主要粒子，具有完整的物理属性、生命周期、
 * 旋转效果、火花发射、闪烁效果和颜色过渡等特性。
 */
export interface StarInstance {
	/** 是否可见，用于闪烁效果中控制粒子的显隐 */
	visible: boolean;
	/** 是否为重型粒子，重型粒子受空气阻力影响更小，下落更快 */
	heavy: boolean;
	/** 粒子当前 X 坐标 */
	x: number;
	/** 粒子当前 Y 坐标 */
	y: number;
	/** 粒子上一帧 X 坐标，用于绘制拖尾效果 */
	prevX: number;
	/** 粒子上一帧 Y 坐标，用于绘制拖尾效果 */
	prevY: number;
	/** 粒子颜色代码 */
	color: string;
	/** X 方向速度分量 */
	speedX: number;
	/** Y 方向速度分量 */
	speedY: number;
	/** 当前剩余生命值（毫秒） */
	life: number;
	/** 完整生命值（毫秒），用于计算生命进度 */
	fullLife: number;
	/** 旋转角度（弧度） */
	spinAngle: number;
	/** 旋转速度 */
	spinSpeed: number;
	/** 旋转半径，控制粒子绕中心旋转的距离 */
	spinRadius: number;
	/** 火花发射频率，每隔多少毫秒发射一次火花 */
	sparkFreq: number;
	/** 火花发射速度倍率 */
	sparkSpeed: number;
	/** 火花发射计时器，用于跟踪下次发射时间 */
	sparkTimer: number;
	/** 火花颜色代码 */
	sparkColor: string;
	/** 火花生命值（毫秒） */
	sparkLife: number;
	/** 火花生命值变化系数，控制火花生命值的随机变化范围 */
	sparkLifeVariation: number;
	/** 是否启用闪烁效果 */
	strobe: boolean;
	/** 闪烁频率（可选） */
	strobeFreq?: number;
	/** 闪烁时显示的颜色（可选），为 null 时不显示 */
	strobeColor?: string | null;
	/** 第二颜色（可选），用于颜色过渡效果 */
	secondColor?: string | null;
	/** 颜色过渡时间点（可选），生命值低于此值时开始颜色过渡 */
	transitionTime?: number;
	/** 是否已完成颜色过渡（可选） */
	colorChanged?: boolean;
	/** 粒子死亡时的回调函数（可选），接收自身作为参数 */
	onDeath?: ((star: StarInstance) => void) | null;
	/** 更新帧计数（可选），用于控制更新频率 */
	updateFrame?: number;
}

/**
 * 火花粒子实例接口。
 * 表示由星形粒子发射的短生命周期小火花粒子，
 * 具有基本的物理属性和生命周期。
 */
export interface SparkInstance {
	/** 火花当前 X 坐标 */
	x: number;
	/** 火花当前 Y 坐标 */
	y: number;
	/** 火花上一帧 X 坐标，用于绘制拖尾效果 */
	prevX: number;
	/** 火花上一帧 Y 坐标，用于绘制拖尾效果 */
	prevY: number;
	/** 火花颜色代码 */
	color: string;
	/** X 方向速度分量 */
	speedX: number;
	/** Y 方向速度分量 */
	speedY: number;
	/** 当前剩余生命值（毫秒） */
	life: number;
}

/**
 * 爆裂闪光实例接口。
 * 表示烟花爆炸时产生的短暂闪光效果，在爆炸中心位置显示一个圆形光晕。
 */
export interface BurstFlashInstance {
	/** 闪光中心 X 坐标 */
	x: number;
	/** 闪光中心 Y 坐标 */
	y: number;
	/** 闪光半径 */
	radius: number;
}
