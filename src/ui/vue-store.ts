/**
 * @module ui/vue-store
 * @description Vue 响应式状态集成模块。将自定义 store 与 Vue 响应式系统桥接，
 * 使 Vue 组件能够通过 reactive 代理访问和监听 store 状态变更。
 */

import { reactive } from 'vue';
import { store } from '@/store/store';
import {
	togglePause,
	toggleSound,
	toggleSetting,
	toggleFullscreen,
	updateConfig,
	resetConfig,
} from '@/store/actions';
import type { StoreState } from '@/store/store';

/**
 * Vue 响应式状态代理。将 store.state 的变更同步到 Vue reactive 对象中，
 * 使 Vue 组件能够自动响应状态变化并重新渲染。
 */
const reactiveState = reactive<StoreState>({ ...store.state }) as StoreState;

// 订阅 store 状态变更，同步到 Vue reactive 对象
store.subscribe((state) => {
	Object.assign(reactiveState, state);
});

/**
 * 使用 Vue 响应式状态的组合式函数。
 * 返回一个 reactive 代理对象，当 store 状态变更时自动触发 Vue 组件更新。
 */
export function useStore(): StoreState {
	return reactiveState;
}

/**
 * 创建 store action 的组合式函数。
 * 返回所有 store 操作函数，供 Vue 组件直接调用。
 */
export function useActions() {
	return {
		togglePause,
		toggleSound,
		toggleSetting,
		toggleFullscreen,
		updateConfig,
		resetConfig,
		setState: store.setState.bind(store),
	};
}

export { reactiveState };
