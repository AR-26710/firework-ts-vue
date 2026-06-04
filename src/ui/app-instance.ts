/**
 * @module ui/app-instance
 * @description App 组件暴露给外部模块的公共接口类型定义。
 * 用于在 main.ts 中安全地访问 App 组件实例，避免 `(vm as any)` 类型绕过。
 */

import type { ComponentPublicInstance } from 'vue';

/**
 * App 根组件对外暴露的公共接口。
 * 通过 defineExpose 暴露，供 main.ts 等非 Vue 模块调用。
 */
export interface AppInstance extends ComponentPublicInstance {
	/** 直接设置 ready 为 true（用于 header 模式跳过加载动画） */
	setReady: () => void;

	/** 显示 Toast 通知消息 */
	showToast: (text: string) => void;

	/** Canvas 容器 DOM 元素引用，供 game-loop 获取舞台容器 */
	canvasContainer: HTMLElement | null;

	/** 设置加载状态文本 */
	setLoadingStatus: (status: string) => void;

	/** 请求加载动画完成（触发加载完成流程） */
	requestReady: () => void;

	/** 注册就绪回调，当 ready 状态变为 true 时调用 */
	onReady: (cb: () => void) => void;
}
