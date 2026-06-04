/**
 * @module services/toast-service
 * @description Toast 通知服务。提供全局 Toast 消息显示能力，
 * 解耦 Vue 组件与核心逻辑模块之间的通知依赖。
 *
 * 设计思路：核心模块（如键盘快捷键处理器）需要显示 Toast 通知，
 * 但不应直接依赖 Vue 组件。ToastService 作为中间层，由 Vue App
 * 组件挂载时注册回调函数，核心模块通过此服务发送通知。
 */

import { store } from '@/store/store';

/** Toast 显示回调函数类型 */
type ToastFn = (text: string) => void;

/** 当前注册的 Toast 回调函数 */
let _toastFn: ToastFn | null = null;

/**
 * 注册 Toast 显示回调函数。由 Vue App 组件在挂载时调用。
 */
export function registerToastFn(fn: ToastFn): void {
	_toastFn = fn;
}

/**
 * 显示 Toast 提示消息。
 * 如果 hideToast 配置为 true，则不显示提示（除非 force 为 true）。
 *
 * @param text - 提示文本
 * @param force - 是否强制显示（即使 hideToast 为 true）
 */
export function showToast(text: string, force?: boolean): void {
	if (store.state.config.hideToast && !force) return;
	_toastFn?.(text);
}
