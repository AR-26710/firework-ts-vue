/**
 * @module game-loop
 * @description 游戏循环模块。负责初始化画布、绑定输入事件处理器
 * 以及将物理更新函数注册到主舞台的帧回调中。
 */

import { initStages, getMainStage } from '@/core/stages';
import { handleResize, setStageContainer, bindResizeListener } from '@/services/resize';
import { initPointerHandlers } from '@/input/pointer-handler';
import { initKeyboardHandler } from '@/input/keyboard-handler';
import { update } from '@/physics/updater';
import type { AppInstance } from '@/ui/app-instance';

/**
 * 初始化游戏循环。执行初始尺寸计算、绑定窗口缩放事件、
 * 注册指针和键盘输入处理器，并将物理更新函数绑定到主舞台的帧回调。
 *
 * @param vm - Vue App 组件实例，用于获取 DOM 引用
 */
export function initGameLoop(vm?: AppInstance) {
	// 初始化舞台（创建 canvas 实例）
	initStages();

	// 从 Vue 组件获取 DOM 引用
	if (vm?.canvasContainer?.parentElement) {
		setStageContainer(vm.canvasContainer.parentElement);
	} else {
		setStageContainer(document.querySelector('.stage-container') as HTMLElement);
	}

	handleResize();
	bindResizeListener();
	initPointerHandlers();
	initKeyboardHandler();
	getMainStage().addEventListener('ticker', update as any);
}

export { handleResize };
