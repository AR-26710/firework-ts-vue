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
import { registerToastFn } from '@/services/toast';
import i18n from '@/i18n';
import App from '@/ui/App.vue';
import { initializePlugins } from '@/simulation/plugins';
import type { AppInstance } from '@/ui/app-instance';
import '@/ui/icons';

/**
 * 应用初始化函数。执行以下操作：
 * 1. 创建并挂载 Vue 应用
 * 2. 初始化游戏循环
 * 3. 隐藏加载提示（通过 Vue 响应式）
 * 4. 启动烟花模拟
 * 5. 触发配置更新回调
 */
function init() {
	initializePlugins();

	const app = createApp(App);
	app.use(i18n);
	const appEl = document.getElementById('app')!;
	const vm = app.mount(appEl) as unknown as AppInstance;

	registerToastFn(vm.showToast);

	// 先渲染舞台（包含 canvas），再初始化游戏循环
	vm.setReady();
	nextTick(() => {
		initGameLoop(vm);
		togglePause(false);
		configDidUpdate();
	});
}

// 头部嵌入模式下直接初始化，普通模式下先预加载音频再初始化
if (IS_HEADER) {
	init();
} else {
	initializePlugins();

	const app = createApp(App);
	app.use(i18n);
	const appEl = document.getElementById('app')!;
	const vm = app.mount(appEl) as unknown as AppInstance;
	registerToastFn(vm.showToast);
	vm.setLoadingStatus('loading.lightFuse');

	setTimeout(() => {
		soundManager.preload().then(
			() => {
				vm.requestReady();
				vm.onReady(() => {
					initGameLoop(vm);
					togglePause(false);
					configDidUpdate();
				});
			},
			(reason) => {
				vm.requestReady();
				vm.onReady(() => {
					initGameLoop(vm);
					togglePause(false);
					configDidUpdate();
				});
				return Promise.reject(reason);
			}
		);
	}, 0);
}
