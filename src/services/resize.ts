/**
 * @module services/resize-service
 * @description 窗口缩放服务。管理舞台容器尺寸计算、Canvas 缩放
 * 以及模拟空间逻辑尺寸的更新，解耦 game-loop 与 UI 模块。
 */

import { MAX_WIDTH, MAX_HEIGHT } from '@/core/constants';
import { setStageDimensions } from '@/core/state';
import { getStages } from '@/core/stages';
import { scaleFactorSelector } from '@/store/selectors';

/** 舞台容器 DOM 元素引用，由 initResizeService 时设置 */
let _stageContainerEl: HTMLElement | null = null;

/**
 * 获取舞台容器 DOM 元素。
 */
export function getStageContainer(): HTMLElement | null {
	return _stageContainerEl;
}

/**
 * 设置舞台容器 DOM 元素引用。
 */
export function setStageContainer(el: HTMLElement): void {
	_stageContainerEl = el;
}

/**
 * 处理窗口缩放事件。根据窗口尺寸和最大尺寸限制计算舞台容器大小，
 * 调整所有渲染阶段的画布尺寸，并根据缩放因子设置模拟空间的逻辑尺寸。
 */
export function handleResize(): void {
	const w = window.innerWidth;
	const h = window.innerHeight;
	const containerW = Math.min(w, MAX_WIDTH);
	const containerH = w <= 420 ? h : Math.min(h, MAX_HEIGHT);
	if (_stageContainerEl) {
		_stageContainerEl.style.width = containerW + 'px';
		_stageContainerEl.style.height = containerH + 'px';
	}
	getStages().forEach((stage) => stage.resize(containerW, containerH));
	const scaleFactor = scaleFactorSelector();
	setStageDimensions(containerW / scaleFactor, containerH / scaleFactor);
}

/**
 * 绑定窗口缩放事件监听器。
 */
export function bindResizeListener(): void {
	window.addEventListener('resize', handleResize);
}
