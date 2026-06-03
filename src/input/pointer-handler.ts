/**
 * @module pointer-handler
 * @description 指针事件处理模块，负责监听并响应触摸/鼠标等指针交互操作。
 * 支持暂停切换、声音切换、菜单切换、模拟速度调节以及点击发射烟花等功能。
 */

import { getMainStage } from '@/core/stages';
import { togglePause, toggleSound, toggleSetting } from '@/store/actions';
import { isRunning } from '@/store/selectors';
import { launchShellFromConfig } from '@/simulation/shell-launch';
import { setSimSpeed } from '@/core/state';
import { store } from '@/store/store';
import { handlePointerMoveForCursor, initCursorManager } from '@/input/cursor-manager';

/**
 * 类指针事件接口，抽象了指针事件的核心属性。
 * 用于统一处理来自不同输入源（鼠标、触摸等）的指针事件。
 */
interface PointerEventLike {
	/** 事件类型，如 'pointerstart'、'pointerend'、'pointermove' */
	type: string;
	/** 指针的 X 坐标 */
	x: number;
	/** 指针的 Y 坐标 */
	y: number;
	/** 指针是否在画布区域内 */
	onCanvas?: boolean;
}

/** 当前活跃的指针数量，用于多点触控追踪 */
let _activePointerCount = 0;
/** 是否正在通过指针拖拽更新模拟速度 */
let isUpdatingSpeed = false;

/**
 * 获取当前是否正在通过指针拖拽更新模拟速度。
 * @returns 如果正在更新速度则返回 true，否则返回 false
 */
export function getIsUpdatingSpeed() {
	return isUpdatingSpeed;
}

/**
 * 设置是否正在通过指针拖拽更新模拟速度的状态。
 * @param val - 是否正在更新速度
 */
export function setIsUpdatingSpeed(val: boolean) {
	isUpdatingSpeed = val;
}

/**
 * 根据指针事件的位置更新模拟速度。
 * 当正在拖拽速度条或指针位于画布底部速度条区域时，
 * 根据指针的 X 坐标计算并设置新的模拟速度。
 * @param event - 类指针事件对象
 * @returns 如果事件被用于更新速度则返回 true，否则返回 false
 */
function updateSpeedFromEvent(event: PointerEventLike): boolean {
	const mainStage = getMainStage();
	if (isUpdatingSpeed || event.y >= mainStage.height - 44) {
		const edge = 16;
		const newSpeed = (event.x - edge) / (mainStage.width - edge * 2);
		setSimSpeed(Math.min(Math.max(newSpeed, 0), 1));
		return true;
	}
	return false;
}

export { updateSpeedFromEvent };

/**
 * 处理指针按下事件。
 * 增加活跃指针计数，检测是否点击了顶部控制按钮区域（暂停、声音、菜单），
 * 若未点击按钮则尝试更新速度或发射烟花。
 * @param event - 类指针事件对象
 */
function handlePointerStart(event: PointerEventLike) {
	_activePointerCount++;
	const btnSize = 50;
	const mainStage = getMainStage();

	if (event.y < btnSize) {
		if (store.state.settingOpen || store.state.openHelpTopic === 'shortcuts') {
			if (event.x > mainStage.width - btnSize) {
				if (store.state.settingOpen) {
					toggleSetting();
				} else {
					store.setState({ openHelpTopic: null });
				}
			}
			return;
		}
		if (event.x < btnSize) {
			togglePause();
			return;
		}
		if (event.x > mainStage.width / 2 - btnSize && event.x < mainStage.width / 2 + btnSize) {
			toggleSound();
			return;
		}
		if (event.x > mainStage.width - btnSize * 2 && event.x < mainStage.width - btnSize) {
			store.setState({
				openHelpTopic: store.state.openHelpTopic === 'shortcuts' ? null : 'shortcuts',
			});
			return;
		}
		if (event.x > mainStage.width - btnSize) {
			toggleSetting();
			return;
		}
	}

	if (!isRunning()) return;

	if (store.state.openHelpTopic) return;

	if (updateSpeedFromEvent(event)) {
		isUpdatingSpeed = true;
	} else if (event.onCanvas) {
		launchShellFromConfig(event);
	}
}

/**
 * 处理指针抬起事件。
 * 减少活跃指针计数，并重置速度更新状态。
 * @param _event - 类指针事件对象（未使用）
 */
function handlePointerEnd(_event: PointerEventLike) {
	_activePointerCount--;
	isUpdatingSpeed = false;
}

/**
 * 处理指针移动事件。
 * 当模拟正在运行且处于速度拖拽更新状态时，根据指针位置持续更新模拟速度。
 * @param event - 类指针事件对象
 */
function handlePointerMove(event: PointerEventLike) {
	handlePointerMoveForCursor();

	if (!isRunning()) return;

	if (isUpdatingSpeed) {
		updateSpeedFromEvent(event);
	}
}

/**
 * 初始化指针事件监听器。
 * 将指针按下、抬起和移动事件的处理函数绑定到主画布上，
 * 使应用能够响应用户的触摸和鼠标交互操作。
 */
export function initPointerHandlers() {
	const mainStage = getMainStage();
	mainStage.addEventListener('pointerstart', handlePointerStart);
	mainStage.addEventListener('pointerend', handlePointerEnd);
	mainStage.addEventListener('pointermove', handlePointerMove);
	initCursorManager();
}
