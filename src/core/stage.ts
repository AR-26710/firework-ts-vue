// New Features
// ------------------
// - Proper multitouch support!

// Breaking changes
// ------------------
// - No longer uses preventDefault() in touch handler.
// - <canvas> elements have `touchAction: auto` style applied.

// Inlined Stage.js dependency: Ticker.js

/**
 * Ticker.js
 * -----------
 * requestAnimationFrame helper. Provides elapsed time between frames and a lag compensation multiplier to callbacks.
 *
 * Author: Caleb Miller
 *         caleb@caleb-miller.com
 */

/**
 * Stage.js
 * -----------
 * Super simple "stage" abstraction for canvas. Combined with Ticker.js, it helps simplify:
 *   - Preparing a canvas for drawing.
 *   - High resolution rendering.
 *   - Resizing the canvas.
 *   - Pointer events (mouse and touch).
 *   - Frame callbacks with useful timing data and calculated lag.
 *
 * This is no replacement for robust canvas drawing libraries; it's designed to be as lightweight as possible and defers
 * full rendering burden to user.
 *
 * Author: Caleb Miller
 *         caleb@caleb-miller.com
 */

/**
 * @module Stage
 * @description 舞台（Stage）模块，提供 Canvas 画布的封装与管理。
 * 包含帧调度器（Ticker）、指针事件数据处理、舞台事件监听机制，
 * 以及对高 DPI 屏幕的适配和窗口/触摸事件的统一处理。
 */

// Inlined Stage dependency: Ticker

/**
 * Ticker 回调函数类型。
 * @callback TickerCallback
 * @param {number} frameTime - 当前帧的耗时（毫秒），已限制在 17~68ms 范围内。
 * @param {number} lag - 帧时间与理想帧时间（16.6667ms）的比值，用于帧补偿计算。
 */
type TickerCallback = (frameTime: number, lag: number) => void;

/**
 * 帧调度器（Ticker），基于 requestAnimationFrame 实现的内部帧循环模块。
 * 负责在每一帧调用所有已注册的监听回调，并传递帧时间和帧补偿比值。
 * 帧时间被限制在 17~68ms 范围内，以避免极端值导致动画异常。
 */
const Ticker = (function TickerFactory() {
	'use strict';

	/**
	 * Ticker 对象，对外仅暴露 addListener 方法。
	 * @type {{ addListener: (callback: TickerCallback) => void }}
	 */
	const Ticker = {} as {
		addListener: (callback: TickerCallback) => void;
	};

	/** 是否已启动帧循环 */
	let started = false;
	/** 上一帧的时间戳 */
	let lastTimestamp = 0;
	/** 已注册的帧回调列表 */
	const listeners: TickerCallback[] = [];

	/** 请求下一帧 */
	function queueFrame() {
		requestAnimationFrame(frameHandler);
	}

	/**
	 * 帧处理函数，计算帧时间并通知所有监听器。
	 * @param {number} timestamp - 由 requestAnimationFrame 提供的当前时间戳。
	 */
	function frameHandler(timestamp: number) {
		let frameTime = timestamp - lastTimestamp;
		lastTimestamp = timestamp;
		if (frameTime < 0) {
			frameTime = 17;
		} else if (frameTime > 68) {
			frameTime = 68;
		}

		listeners.forEach((listener) => listener.call(window, frameTime, frameTime / 16.6667));
		queueFrame();
	}

	/**
	 * 添加帧回调监听器。首次添加时自动启动帧循环。
	 * @param {TickerCallback} callback - 帧回调函数。
	 * @throws {Error} 当 callback 不是函数时抛出错误。
	 */
	Ticker.addListener = function addListener(callback) {
		if (typeof callback !== 'function')
			throw new Error('Ticker.addListener() requires a function reference passed for a callback.');
		listeners.push(callback);
		if (!started) {
			started = true;
			queueFrame();
		}
	};

	return Ticker;
})();

/**
 * 指针事件数据接口，描述舞台上的指针事件信息。
 * @interface PointerEventData
 */
interface PointerEventData {
	/** 事件类型，如 'start'、'move'、'end' */
	type: string;
	/** 指针在画布上的 X 坐标（逻辑像素） */
	x: number;
	/** 指针在画布上的 Y 坐标（逻辑像素） */
	y: number;
	/** 指针是否在画布范围内 */
	onCanvas?: boolean;
}

/**
 * 舞台事件监听器集合接口，存储各类事件的回调函数列表及指针状态。
 * @interface StageListeners
 */
interface StageListeners {
	/** 画布尺寸变化事件的回调列表 */
	resize: (() => void)[];
	/** 指针按下（开始）事件的回调列表 */
	pointerstart: ((evt: PointerEventData) => void)[];
	/** 指针移动事件的回调列表 */
	pointermove: ((evt: PointerEventData) => void)[];
	/** 指针抬起（结束）事件的回调列表 */
	pointerend: ((evt: PointerEventData) => void)[];
	/** 最近一次指针位置记录，用于触摸结束事件时获取最终坐标 */
	lastPointerPos: { x: number; y: number };
}

/**
 * 舞台类，封装 HTML5 Canvas 画布，提供统一的绘图上下文、
 * 事件系统（指针事件、resize 事件、帧更新事件）以及高 DPI 适配。
 *
 * 每个 Stage 实例对应一个 Canvas 元素，并自动注册到全局的 Stage.stages 列表中，
 * 以便接收全局的鼠标和触摸事件分发。
 *
 * @class Stage
 */
export class Stage {
	/** 关联的 Canvas DOM 元素 */
	canvas: HTMLCanvasElement;
	/** Canvas 2D 渲染上下文 */
	ctx: CanvasRenderingContext2D;
	/** 动画速度倍率，默认为 1 */
	speed: number;
	/** 设备像素比（devicePixelRatio），用于高 DPI 适配 */
	dpr: number;
	/** 画布的逻辑宽度（CSS 像素） */
	width: number;
	/** 画布的逻辑高度（CSS 像素） */
	height: number;
	/** 画布的物理宽度（实际像素），等于 width * dpr */
	naturalWidth: number;
	/** 画布的物理高度（实际像素），等于 height * dpr */
	naturalHeight: number;
	/** 事件监听器集合，存储各类事件的回调函数及指针状态 */
	_listeners: StageListeners;

	/** 所有 Stage 实例的列表，用于全局事件分发 */
	static stages: Stage[] = [];
	/** 是否禁用高 DPI 适配，设为 true 时 dpr 固定为 1 */
	static disableHighDPI: boolean = false;

	/**
	 * 创建 Stage 实例。
	 * 根据传入的 Canvas 元素或元素 ID 初始化画布，自动适配高 DPI，
	 * 并将实例注册到全局 Stage.stages 列表中。
	 *
	 * @param {string | HTMLCanvasElement} canvas - Canvas 元素或其 DOM ID。
	 * 当传入字符串时，会通过 document.getElementById 查找对应的 Canvas 元素。
	 */
	constructor(canvas: string | HTMLCanvasElement) {
		if (typeof canvas === 'string') canvas = document.getElementById(canvas)! as HTMLCanvasElement;

		this.canvas = canvas;
		this.ctx = canvas.getContext('2d')!;

		this.canvas.style.touchAction = 'none';

		this.speed = 1;

		this.dpr = Stage.disableHighDPI
			? 1
			: (window.devicePixelRatio || 1) / ((this.ctx as any).backingStorePixelRatio || 1);

		this.width = canvas.width;
		this.height = canvas.height;
		this.naturalWidth = this.width * this.dpr;
		this.naturalHeight = this.height * this.dpr;

		if (this.width !== this.naturalWidth) {
			this.canvas.width = this.naturalWidth;
			this.canvas.height = this.naturalHeight;
			this.canvas.style.width = this.width + 'px';
			this.canvas.style.height = this.height + 'px';
		}

		Stage.stages.push(this);

		this._listeners = {
			resize: [],
			pointerstart: [],
			pointermove: [],
			pointerend: [],
			lastPointerPos: { x: 0, y: 0 },
		};
	}

	/**
	 * 添加事件监听器。
	 * 支持的事件类型包括：'ticker'（帧更新事件）、'resize'（画布尺寸变化事件）、
	 * 'pointerstart'（指针按下事件）、'pointermove'（指针移动事件）、'pointerend'（指针抬起事件）。
	 *
	 * @param {string} event - 事件名称。
	 * @param {Function} handler - 事件回调函数。'ticker' 事件接收 (frameTime, lag) 参数，
	 * 指针事件接收 PointerEventData 参数，resize 事件无参数。
	 * @throws {Error} 当事件名称无效时抛出错误。
	 */
	addEventListener(event: string, handler: (evt?: any) => void) {
		try {
			if (event === 'ticker') {
				Ticker.addListener(handler);
			} else {
				(this._listeners as any)[event].push(handler);
			}
		} catch {
			throw new Error('Invalid Event');
		}
	}

	/**
	 * 分发（触发）指定事件，通知所有已注册的该事件监听器。
	 *
	 * @param {string} event - 事件名称，如 'resize'、'pointerstart'、'pointermove'、'pointerend'。
	 * @param {any} [val] - 传递给监听器的事件数据。
	 * @throws {Error} 当事件名称无效（无对应监听器列表）时抛出错误。
	 */
	dispatchEvent(event: string, val?: any) {
		const listeners = (this._listeners as any)[event];
		if (listeners) {
			listeners.forEach((listener: Function) => listener.call(this, val));
		} else {
			throw new Error('Invalid Event');
		}
	}

	/**
	 * 调整画布尺寸，更新逻辑和物理尺寸，并触发 'resize' 事件。
	 *
	 * @param {number} w - 新的逻辑宽度（CSS 像素）。
	 * @param {number} h - 新的逻辑高度（CSS 像素）。
	 */
	resize(w: number, h: number) {
		this.width = w;
		this.height = h;
		this.naturalWidth = w * this.dpr;
		this.naturalHeight = h * this.dpr;
		this.canvas.width = this.naturalWidth;
		this.canvas.height = this.naturalHeight;
		this.canvas.style.width = w + 'px';
		this.canvas.style.height = h + 'px';

		this.dispatchEvent('resize');
	}

	/**
	 * 将窗口坐标转换为画布坐标。
	 * 根据画布的 boundingClientRect 和实际像素尺寸进行换算，
	 * 返回的坐标为画布物理像素坐标。
	 *
	 * @param {HTMLCanvasElement} canvas - 目标 Canvas 元素。
	 * @param {number} x - 窗口中的 X 坐标（clientX）。
	 * @param {number} y - 窗口中的 Y 坐标（clientY）。
	 * @returns {{ x: number; y: number }} 转换后的画布物理像素坐标。
	 */
	static windowToCanvas(canvas: HTMLCanvasElement, x: number, y: number) {
		const bbox = canvas.getBoundingClientRect();
		return {
			x: (x - bbox.left) * (canvas.width / bbox.width),
			y: (y - bbox.top) * (canvas.height / bbox.height),
		};
	}

	/**
	 * 构造并分发指针事件。
	 * 根据传入的类型和坐标创建 PointerEventData 对象，
	 * 自动判断指针是否在画布范围内，然后通过 dispatchEvent 分发对应的指针事件。
	 *
	 * @param {string} type - 指针事件类型，如 'start'、'move'、'end'。
	 * @param {number} x - 指针在画布上的 X 坐标（逻辑像素）。
	 * @param {number} y - 指针在画布上的 Y 坐标（逻辑像素）。
	 */
	pointerEvent(type: string, x: number, y: number) {
		const evt: PointerEventData = {
			type: type,
			x: x,
			y: y,
		};

		evt.onCanvas = x >= 0 && x <= this.width && y >= 0 && y <= this.height;

		this.dispatchEvent('pointer' + type, evt);
	}

	/** 上次触摸事件的时间戳，用于在鼠标处理器中过滤触摸事件后的误触发 */
	private static lastTouchTimestamp = 0;

	/**
	 * 全局鼠标事件处理器。
	 * 将鼠标事件转换为指针事件并分发到所有 Stage 实例。
	 * 在触摸事件发生后 500ms 内会忽略鼠标事件，以避免触摸设备上的重复触发。
	 * 同时会忽略来自 '.text-input-bar' 元素内的事件。
	 *
	 * @param {MouseEvent} evt - 原生鼠标事件。
	 */
	static mouseHandler(evt: MouseEvent) {
		if (Date.now() - Stage.lastTouchTimestamp < 500) {
			return;
		}

		if (
			evt.target instanceof Element &&
			evt.target.closest('.text-input-bar, .controls, .setting')
		) {
			return;
		}

		let type = 'start';
		if (evt.type === 'mousemove') {
			type = 'move';
		} else if (evt.type === 'mouseup') {
			type = 'end';
		}

		Stage.stages.forEach((stage) => {
			const pos = Stage.windowToCanvas(stage.canvas, evt.clientX, evt.clientY);
			stage.pointerEvent(type, pos.x / stage.dpr, pos.y / stage.dpr);
		});
	}

	/**
	 * 全局触摸事件处理器。
	 * 将触摸事件转换为指针事件并分发到所有 Stage 实例。
	 * 对于 'touchstart' 事件，会额外触发一次 'pointermove' 事件以更新指针位置。
	 * 对于 'touchend' 事件，使用最近记录的指针位置（因为触摸结束时 changedTouches 无有效坐标）。
	 * 同时会忽略来自 '.text-input-bar' 元素内的事件。
	 *
	 * @param {TouchEvent} evt - 原生触摸事件。
	 */
	static touchHandler(evt: TouchEvent) {
		Stage.lastTouchTimestamp = Date.now();

		if (
			evt.target instanceof Element &&
			evt.target.closest('.text-input-bar, .controls, .setting')
		) {
			return;
		}

		let type = 'start';
		if (evt.type === 'touchmove') {
			type = 'move';
		} else if (evt.type === 'touchend') {
			type = 'end';
		}

		Stage.stages.forEach((stage) => {
			for (const touch of Array.from(evt.changedTouches)) {
				let pos: { x: number; y: number };
				if (type !== 'end') {
					pos = Stage.windowToCanvas(stage.canvas, touch.clientX, touch.clientY);
					stage._listeners.lastPointerPos = pos;
					if (type === 'start') stage.pointerEvent('move', pos.x / stage.dpr, pos.y / stage.dpr);
				} else {
					pos = stage._listeners.lastPointerPos;
				}
				stage.pointerEvent(type, pos.x / stage.dpr, pos.y / stage.dpr);
			}
		});
	}
}

document.addEventListener('mousedown', Stage.mouseHandler);
document.addEventListener('mousemove', Stage.mouseHandler);
document.addEventListener('mouseup', Stage.mouseHandler);
document.addEventListener('touchstart', Stage.touchHandler);
document.addEventListener('touchmove', Stage.touchHandler);
document.addEventListener('touchend', Stage.touchHandler);
