/**
 * @module main
 * @description 应用入口模块。负责创建 Vue 应用、初始化游戏循环、
 * 启动烟花模拟以及处理音频预加载。
 */

console.clear();

import { createApp, nextTick } from 'vue';
import { IS_HEADER } from '@/core/constants';
import { togglePause, configDidUpdate } from '@/store/actions';
import { soundManager } from '@/audio/sound-manager';
import { initGameLoop } from '@/game-loop';
import i18n from '@/i18n';
import App from '@/ui/App.vue';
import { store } from '@/store/store';
import { initializePlugins } from '@/simulation/plugins';
import '@/ui/icons';

// 全局 showToast 引用，供非 Vue 模块调用
let _showToast: ((text: string) => void) | null = null;

/**
 * 设置全局 showToast 函数引用。由 Vue App 组件挂载后调用。
 */
export function setShowToastFn(fn: (text: string) => void) {
	_showToast = fn;
}

/**
 * 显示 Toast 提示。供非 Vue 模块（如键盘处理器）调用。
 * 如果 hideToast 配置为 true，则不显示提示（除非 force 为 true）。
 * @param text - 提示文本
 * @param force - 是否强制显示（即使 hideToast 为 true）
 */
export function showToast(text: string, force?: boolean) {
	if (store.state.config.hideToast && !force) return;
	_showToast?.(text);
}

/**
 * 应用初始化函数。执行以下操作：
 * 1. 创建并挂载 Vue 应用
 * 2. 初始化游戏循环
 * 3. 隐藏加载提示（通过 Vue 响应式）
 * 4. 启动烟花模拟
 * 5. 触发配置更新回调
 */
function init() {
	// 初始化插件系统（注册所有烟花类型和发射序列）
	initializePlugins();

	const app = createApp(App);
	app.use(i18n);
	const appEl = document.getElementById('app')!;
	const vm = app.mount(appEl);

	// 暴露 showToast 供外部模块使用
	setShowToastFn((vm as any).showToast);

	// 先渲染舞台（包含 canvas），再初始化游戏循环
	(vm as any).setReady();
	nextTick(() => {
		initGameLoop(vm as any);
		togglePause(false);
		configDidUpdate();
	});
}

// 头部嵌入模式下直接初始化，普通模式下先预加载音频再初始化
if (IS_HEADER) {
	init();
} else {
	// 初始化插件系统（注册所有烟花类型和发射序列）
	initializePlugins();

	// 先挂载 Vue 应用（显示 LoadingInit 组件），再更新状态并预加载音频
	const app = createApp(App);
	app.use(i18n);
	const appEl = document.getElementById('app')!;
	const vm = app.mount(appEl);
	setShowToastFn((vm as any).showToast);
	(vm as any).setLoadingStatus('loading.lightFuse');

	setTimeout(() => {
		soundManager.preload().then(
			() => {
				(vm as any).requestReady();
				(vm as any).onReady(() => {
					initGameLoop(vm as any);
					togglePause(false);
					configDidUpdate();
				});
			},
			(reason) => {
				(vm as any).requestReady();
				(vm as any).onReady(() => {
					initGameLoop(vm as any);
					togglePause(false);
					configDidUpdate();
				});
				return Promise.reject(reason);
			}
		);
	}, 0);
}
