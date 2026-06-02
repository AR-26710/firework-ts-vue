/**
 * @module core/fscreen
 * @description 全屏 API 跨浏览器兼容封装模块。
 * 基于 Fscreen 库（https://github.com/rafrex/fscreen）的手动 UMD 构建，
 * 自动检测浏览器前缀（webkit/moz/ms）并提供统一的全屏 API 接口。
 */

/**
 * 全屏 API 属性键名到索引的映射，用于通过索引访问各浏览器前缀对应的属性名。
 * @type {{ readonly fullscreenEnabled: 0; readonly fullscreenElement: 1; readonly requestFullscreen: 2; readonly exitFullscreen: 3; readonly fullscreenchange: 4; readonly fullscreenerror: 5 }}
 */
const key = {
	fullscreenEnabled: 0,
	fullscreenElement: 1,
	requestFullscreen: 2,
	exitFullscreen: 3,
	fullscreenchange: 4,
	fullscreenerror: 5,
} as const;

/** WebKit 前缀的全屏 API 属性名列表（Safari 旧版本） */
const webkit = [
	'webkitFullscreenEnabled',
	'webkitFullscreenElement',
	'webkitRequestFullscreen',
	'webkitExitFullscreen',
	'webkitfullscreenchange',
	'webkitfullscreenerror',
];

/** Mozilla 前缀的全屏 API 属性名列表（Firefox 旧版本） */
const moz = [
	'mozFullScreenEnabled',
	'mozFullScreenElement',
	'mozRequestFullScreen',
	'mozCancelFullScreen',
	'mozfullscreenchange',
	'mozfullscreenerror',
];

/** Microsoft 前缀的全屏 API 属性名列表（IE/Edge 旧版本） */
const ms = [
	'msFullscreenEnabled',
	'msFullscreenElement',
	'msRequestFullscreen',
	'msExitFullscreen',
	'MSFullscreenChange',
	'MSFullscreenError',
];

/**
 * 文档对象引用，兼容无 window/document 的环境（如 SSR）。
 * @type {Document}
 */
const doc =
	typeof window !== 'undefined' && typeof window.document !== 'undefined'
		? window.document
		: ({} as Document);

/**
 * 检测当前浏览器使用的全屏 API 前缀。
 * 依次检测标准 API、WebKit 前缀、Mozilla 前缀和 Microsoft 前缀，
 * 返回匹配的属性名数组。如果都不支持则返回空数组。
 * @type {string[]}
 */
const vendor =
	('fullscreenEnabled' in doc && Object.keys(key)) ||
	(webkit[0] in doc && webkit) ||
	(moz[0] in doc && moz) ||
	(ms[0] in doc && ms) ||
	([] as string[]);

/**
 * 全屏 API 兼容封装对象。提供跨浏览器的统一全屏操作接口，
 * 自动适配不同浏览器前缀。
 * @namespace fscreen
 */
export const fscreen = {
	/**
	 * 请求将指定元素切换为全屏显示。
	 * @param {Element} element - 要全屏显示的 DOM 元素
	 * @returns {Promise<void>} 全屏请求的 Promise
	 */
	requestFullscreen(element: Element) {
		return vendor.length ? (element as any)[vendor[key.requestFullscreen]]() : Promise.resolve();
	},
	/**
	 * 获取指定元素的请求全屏函数引用，用于事件绑定等场景。
	 * @param {Element} element - 目标 DOM 元素
	 * @returns {Function} 请求全屏的函数
	 */
	requestFullscreenFunction(element: Element) {
		return vendor.length
			? (element as any)[vendor[key.requestFullscreen]]
			: () => Promise.resolve();
	},
	/**
	 * 退出全屏模式。
	 * @type {() => Promise<void>}
	 */
	get exitFullscreen() {
		return vendor.length
			? ((doc as any)[vendor[key.exitFullscreen]].bind(doc) as () => Promise<void>)
			: () => Promise.resolve();
	},
	/**
	 * 添加全屏相关事件监听器（fullscreenchange 或 fullscreenerror）。
	 * @param {string} type - 事件类型名称
	 * @param {EventListener} handler - 事件处理函数
	 * @param {boolean | AddEventListenerOptions} [options] - 事件监听选项
	 */
	addEventListener(
		type: string,
		handler: EventListener,
		options?: boolean | AddEventListenerOptions
	) {
		return vendor.length
			? doc.addEventListener(
					vendor[key[type as keyof typeof key] as any] as string,
					handler,
					options
				)
			: undefined;
	},
	/**
	 * 移除全屏相关事件监听器。
	 * @param {string} type - 事件类型名称
	 * @param {EventListener} handler - 要移除的事件处理函数
	 */
	removeEventListener(type: string, handler: EventListener) {
		return vendor.length
			? doc.removeEventListener(vendor[key[type as keyof typeof key] as any] as string, handler)
			: undefined;
	},
	/**
	 * 检测浏览器是否支持全屏 API。
	 * @type {boolean}
	 */
	get fullscreenEnabled() {
		return vendor.length ? Boolean((doc as any)[vendor[key.fullscreenEnabled]]) : false;
	},
	/** @type {boolean} 空设置器，不可写入 */
	set fullscreenEnabled(_val: boolean) {},
	/**
	 * 获取当前全屏显示的元素。
	 * @type {Element | null}
	 */
	get fullscreenElement() {
		return vendor.length ? ((doc as any)[vendor[key.fullscreenElement]] as Element | null) : null;
	},
	/** @type {Element | null} 空设置器，不可写入 */
	set fullscreenElement(_val: Element | null) {},
	/**
	 * 获取全屏变化事件的处理函数。
	 * @type {((this: Document, ev: Event) => any) | null}
	 */
	get onfullscreenchange() {
		return vendor.length
			? ((doc as any)[('on' + vendor[key.fullscreenchange]).toLowerCase()] as
					| ((this: Document, ev: Event) => any)
					| null)
			: null;
	},
	/**
	 * 设置全屏变化事件的处理函数。
	 * @param {((this: Document, ev: Event) => any) | null} handler - 事件处理函数
	 */
	set onfullscreenchange(handler: ((this: Document, ev: Event) => any) | null) {
		if (vendor.length) (doc as any)[('on' + vendor[key.fullscreenchange]).toLowerCase()] = handler;
	},
	/**
	 * 获取全屏错误事件的处理函数。
	 * @type {((this: Document, ev: Event) => any) | null}
	 */
	get onfullscreenerror() {
		return vendor.length
			? ((doc as any)[('on' + vendor[key.fullscreenerror]).toLowerCase()] as
					| ((this: Document, ev: Event) => any)
					| null)
			: null;
	},
	/**
	 * 设置全屏错误事件的处理函数。
	 * @param {((this: Document, ev: Event) => any) | null} handler - 事件处理函数
	 */
	set onfullscreenerror(handler: ((this: Document, ev: Event) => any) | null) {
		if (vendor.length) (doc as any)[('on' + vendor[key.fullscreenerror]).toLowerCase()] = handler;
	},
};
