/**
 * @module store/actions
 * @description 状态操作模块。提供修改应用状态的 action 函数，包括暂停/继续、声音切换、
 * 菜单切换、全屏切换和配置更新等操作。同时处理声音状态变更的副作用。
 */

import { fscreen } from '@/core/fscreen';
import { store, getDefaultConfig } from './store';
import { setQuality } from '@/core/state';
import { qualitySelector, canPlaySoundSelector } from './selectors';
import type { StoreConfig, StoreState } from './store';
import { soundManager } from '@/audio/sound-manager';

/**
 * 检测浏览器是否支持全屏 API。
 */
function fullscreenEnabled(): boolean {
	return fscreen.fullscreenEnabled;
}

/**
 * 检测当前是否处于全屏模式。
 */
function isFullscreen(): boolean {
	return !!fscreen.fullscreenElement;
}

/**
 * 切换全屏模式。
 */
function toggleFullscreen() {
	if (fullscreenEnabled()) {
		if (isFullscreen()) {
			fscreen.exitFullscreen();
		} else {
			fscreen.requestFullscreen(document.documentElement);
		}
	}
}

// 监听全屏状态变化事件
fscreen.addEventListener('fullscreenchange', () => {
	store.setState({ fullscreen: isFullscreen() });
});

/**
 * 处理 store 状态变更的副作用。当声音播放能力发生变化时，
 * 相应地恢复或暂停声音管理器中的所有音频。
 */
function handleStateChange(state: StoreState, prevState: StoreState) {
	const canPlaySound = canPlaySoundSelector(state);
	const canPlaySoundPrev = canPlaySoundSelector(prevState);

	if (canPlaySound !== canPlaySoundPrev) {
		if (canPlaySound) {
			soundManager.resumeAll();
		} else {
			soundManager.pauseAll();
		}
	}
}

store.subscribe(handleStateChange);

/**
 * 切换暂停/继续状态。
 */
function togglePause(toggle?: boolean) {
	const paused = store.state.paused;
	let newValue: boolean;
	if (typeof toggle === 'boolean') {
		newValue = toggle;
	} else {
		newValue = !paused;
	}

	if (paused !== newValue) {
		store.setState({ paused: newValue });
	}
}

/**
 * 切换声音开关状态。
 */
function toggleSound(toggle?: boolean) {
	if (typeof toggle === 'boolean') {
		store.setState({ soundEnabled: toggle });
	} else {
		store.setState({ soundEnabled: !store.state.soundEnabled });
	}
}

/**
 * 切换菜单开关状态。
 */
function toggleSetting(toggle?: boolean) {
	if (typeof toggle === 'boolean') {
		store.setState({ settingOpen: toggle });
	} else {
		store.setState({ settingOpen: !store.state.settingOpen });
	}
}

/**
 * 更新应用配置。将新配置与当前配置合并后更新 store 状态，并触发配置更新后处理。
 */
function updateConfig(nextConfig?: Partial<StoreConfig>) {
	if (nextConfig) {
		store.setState({
			config: Object.assign({}, store.state.config, nextConfig),
		});
	}
	configDidUpdate();
}

/**
 * 配置更新后的回调处理。
 */
function configDidUpdate() {
	setQuality(qualitySelector());
}

/**
 * 重置所有配置为默认值。
 */
function resetConfig() {
	store.setState({
		config: getDefaultConfig(),
	});
	configDidUpdate();
}

export {
	togglePause,
	toggleSound,
	toggleSetting,
	toggleFullscreen,
	updateConfig,
	resetConfig,
	configDidUpdate,
	fullscreenEnabled,
	isFullscreen,
};
