import { Stage } from './stage';

/**
 * 舞台（Stage）实例模块
 *
 * 延迟创建 Canvas 舞台实例，确保 DOM 元素已就绪。
 * 通过 initStages() 初始化后才能使用 trailsStage、mainStage 和 stages。
 */

/** 拖尾画布舞台实例 */
let trailsStage: Stage | null = null;
/** 主画布舞台实例 */
let mainStage: Stage | null = null;
/** 所有舞台实例的集合数组 */
let stages: Stage[] = [];

/**
 * 初始化舞台实例。在 Vue 挂载后调用，确保 canvas 元素已存在于 DOM 中。
 */
function initStages() {
	trailsStage = new Stage('trails-canvas');
	mainStage = new Stage('main-canvas');
	stages = [trailsStage, mainStage];
}

/**
 * 获取拖尾画布舞台实例。需在 initStages() 之后调用。
 */
function getTrailsStage(): Stage {
	return trailsStage!;
}

/**
 * 获取主画布舞台实例。需在 initStages() 之后调用。
 */
function getMainStage(): Stage {
	return mainStage!;
}

/**
 * 获取所有舞台实例数组。需在 initStages() 之后调用。
 */
function getStages(): Stage[] {
	return stages;
}

export { initStages, getTrailsStage, getMainStage, getStages };
