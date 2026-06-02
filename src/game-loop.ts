/**
 * @module game-loop
 * @description 游戏循环模块。负责初始化画布尺寸、窗口缩放处理、
 * 输入事件处理器注册以及主循环帧更新绑定。
 */

import { MAX_WIDTH, MAX_HEIGHT } from '@/core/constants';
import { setStageDimensions } from '@/core/state';
import { initStages, getMainStage, getStages } from '@/core/stages';
import { scaleFactorSelector } from '@/store/selectors';
import { initPointerHandlers } from '@/input/pointer-handler';
import { initKeyboardHandler } from '@/input/keyboard-handler';
import { update } from '@/physics/updater';

/** 舞台容器 DOM 元素引用，由 initGameLoop 时设置 */
let stageContainerEl: HTMLElement | null = null;

/**
 * 获取舞台容器 DOM 元素。
 */
export function getStageContainer(): HTMLElement | null {
	return stageContainerEl;
}

/**
 * 处理窗口缩放事件。根据窗口尺寸和最大尺寸限制计算舞台容器大小，
 * 调整所有渲染阶段的画布尺寸，并根据缩放因子设置模拟空间的逻辑尺寸。
 */
function handleResize() {
	const w = window.innerWidth;
	const h = window.innerHeight;
	const containerW = Math.min(w, MAX_WIDTH);
	const containerH = w <= 420 ? h : Math.min(h, MAX_HEIGHT);
	if (stageContainerEl) {
		stageContainerEl.style.width = containerW + 'px';
		stageContainerEl.style.height = containerH + 'px';
	}
	getStages().forEach((stage) => stage.resize(containerW, containerH));
	const scaleFactor = scaleFactorSelector();
	setStageDimensions(containerW / scaleFactor, containerH / scaleFactor);
}

/**
 * 初始化游戏循环。执行初始尺寸计算、绑定窗口缩放事件、
 * 注册指针和键盘输入处理器，并将物理更新函数绑定到主舞台的帧回调。
 * @param vm - Vue App 组件实例，用于获取 DOM 引用
 */
export function initGameLoop(vm?: any) {
	// 初始化舞台（创建 canvas 实例）
	initStages();

	// 从 Vue 组件获取 DOM 引用
	if (vm?.canvasContainer) {
		stageContainerEl = vm.canvasContainer.parentElement;
	} else {
		stageContainerEl = document.querySelector('.stage-container');
	}

	handleResize();
	window.addEventListener('resize', handleResize);
	initPointerHandlers();
	initKeyboardHandler();
	getMainStage().addEventListener('ticker', update as any);
}

export { handleResize };
