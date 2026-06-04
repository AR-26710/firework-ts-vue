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
 * 创建并挂载 Vue 应用，返回应用实例。
 * @returns Vue 应用实例
 */
function createAndMountApp(): AppInstance {
	initializePlugins();
	const app = createApp(App);
	app.use(i18n);
	const appEl = document.getElementById('app')!;
	return app.mount(appEl) as unknown as AppInstance;
}

/**
 * 启动游戏循环并触发初始状态更新。
 * @param vm - Vue 应用实例
 */
function startApp(vm: AppInstance) {
	initGameLoop(vm);
	togglePause(false);
	configDidUpdate();
}

// 头部嵌入模式下直接初始化，普通模式下先预加载音频再初始化
if (IS_HEADER) {
	const vm = createAndMountApp();
	registerToastFn(vm.showToast);
	vm.setReady();
	nextTick(() => startApp(vm));
} else {
	const vm = createAndMountApp();
	registerToastFn(vm.showToast);
	vm.setLoadingStatus('loading.lightFuse');

	setTimeout(() => {
		const onReady = () => startApp(vm);
		soundManager.preload().then(
			() => {
				vm.requestReady();
				vm.onReady(onReady);
			},
			(reason) => {
				vm.requestReady();
				vm.onReady(onReady);
				return Promise.reject(reason);
			}
		);
	}, 0);
}
