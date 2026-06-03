/**
 * @module cursor-manager
 * @description 鼠标光标隐藏管理模块。支持手动隐藏和自动隐藏两种模式。
 * 手动隐藏：通过快捷键或设置面板直接切换光标显示/隐藏。
 * 自动隐藏：当鼠标在画布上静止超过指定时间后自动隐藏光标，移动时恢复显示。
 */

import { store } from '@/store/store';
import { getMainStage } from '@/core/stages';

/** 自动隐藏的延迟时间（毫秒） */
const AUTO_HIDE_DELAY = 3000;

/** 自动隐藏的定时器 ID */
let autoHideTimer: ReturnType<typeof setTimeout> | null = null;

/** 当前光标是否已被隐藏 */
let cursorHidden = false;

/**
 * 获取当前光标是否已隐藏。
 */
export function isCursorHidden(): boolean {
	return cursorHidden;
}

/**
 * 设置画布的光标样式。
 * @param hidden - 是否隐藏光标
 */
function setCursorHidden(hidden: boolean) {
	const mainStage = getMainStage();
	if (!mainStage) return;

	cursorHidden = hidden;
	mainStage.canvas.style.cursor = hidden ? 'none' : '';
}

/**
 * 根据当前 store 配置应用光标隐藏状态。
 * 供设置面板使用（v-model 已更新 config，只需应用视觉效果）。
 */
export function applyCursorHideState() {
	const hideCursor = store.state.config.hideCursor;
	if (hideCursor) {
		clearAutoHideTimer();
		setCursorHidden(true);
	} else {
		setCursorHidden(false);
		if (store.state.config.autoHideCursor) {
			startAutoHideTimer();
		}
	}
}

/**
 * 手动切换光标隐藏状态。
 * 供快捷键使用，同时更新 store 配置并应用视觉效果。
 * 启用手动隐藏时，自动关闭自动隐藏（互斥）。
 */
export function toggleCursorHide() {
	const newHide = !store.state.config.hideCursor;
	store.setState({
		config: Object.assign({}, store.state.config, {
			hideCursor: newHide,
			autoHideCursor: newHide ? false : store.state.config.autoHideCursor,
		}),
	});
	applyCursorHideState();
}

/**
 * 切换自动隐藏光标状态。
 * 启用自动隐藏时，自动关闭手动隐藏（互斥）。
 */
export function toggleAutoHideCursor() {
	const newAutoHide = !store.state.config.autoHideCursor;
	store.setState({
		config: Object.assign({}, store.state.config, {
			autoHideCursor: newAutoHide,
			hideCursor: newAutoHide ? false : store.state.config.hideCursor,
		}),
	});
	applyCursorHideState();
}

/**
 * 启动自动隐藏定时器。
 * 在指定延迟后，如果光标仍在画布上，则自动隐藏光标。
 */
function startAutoHideTimer() {
	clearAutoHideTimer();
	autoHideTimer = setTimeout(() => {
		if (store.state.config.autoHideCursor && !store.state.config.hideCursor) {
			setCursorHidden(true);
		}
	}, AUTO_HIDE_DELAY);
}

/**
 * 清除自动隐藏定时器。
 */
function clearAutoHideTimer() {
	if (autoHideTimer !== null) {
		clearTimeout(autoHideTimer);
		autoHideTimer = null;
	}
}

/**
 * 处理指针移动事件，用于自动隐藏光标。
 * 当检测到指针移动时，恢复光标显示并重新启动自动隐藏定时器。
 */
export function handlePointerMoveForCursor() {
	// 手动隐藏模式下，指针移动不恢复光标
	if (store.state.config.hideCursor) return;

	// 自动隐藏模式下，移动时恢复光标并重启定时器
	if (store.state.config.autoHideCursor) {
		if (cursorHidden) {
			setCursorHidden(false);
		}
		startAutoHideTimer();
	}
}

/**
 * 初始化光标管理器。
 * 根据当前配置设置初始光标状态，并在自动隐藏模式下启动定时器。
 */
export function initCursorManager() {
	if (store.state.config.hideCursor) {
		setCursorHidden(true);
	} else if (store.state.config.autoHideCursor) {
		startAutoHideTimer();
	}
}

/**
 * 清理光标管理器资源。
 */
export function cleanupCursorManager() {
	clearAutoHideTimer();
	setCursorHidden(false);
}
