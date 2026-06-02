/**
 * @module store/selectors
 * @description 状态选择器模块。提供从 store 状态中派生计算特定值的函数，
 * 避免在业务逻辑中直接访问 store.state 的深层属性，提高代码可维护性。
 */

import { store } from './store';
import type { StoreState } from './store';

/**
 * 判断烟花模拟是否正在运行。运行条件为未暂停且菜单未打开。
 * @param {StoreState} [state=store.state] - 可选的状态对象，默认使用当前 store 状态
 * @returns {boolean} 如果模拟正在运行则返回 true
 */
const isRunning = (state: StoreState = store.state) => !state.paused && !state.settingOpen;

/**
 * 获取声音是否启用的状态。
 * @param {StoreState} [state=store.state] - 可选的状态对象，默认使用当前 store 状态
 * @returns {boolean} 如果声音已启用则返回 true
 */
const soundEnabledSelector = (state: StoreState = store.state) => state.soundEnabled;

/**
 * 判断当前是否可以播放声音。需要同时满足运行中且声音已启用两个条件。
 * @param {StoreState} [state=store.state] - 可选的状态对象，默认使用当前 store 状态
 * @returns {boolean} 如果可以播放声音则返回 true
 */
const canPlaySoundSelector = (state: StoreState = store.state) =>
	isRunning(state) && soundEnabledSelector(state);

/**
 * 获取当前画质等级的数值。
 * @returns {number} 画质等级数值
 */
const qualitySelector = () => +store.state.config.quality;

/**
 * 获取当前烟花类型名称。
 * @returns {string} 烟花类型名称字符串
 */
const shellNameSelector = () => store.state.config.shell;

/**
 * 获取当前烟花尺寸的数值。
 * @returns {number} 烟花尺寸数值
 */
const shellSizeSelector = () => +store.state.config.size;

/**
 * 获取是否启用终幕模式。
 * @returns {boolean} 如果启用终幕模式则返回 true
 */
const finaleSelector = () => store.state.config.finale;

/**
 * 获取当前天空光照等级的数值。
 * @returns {number} 天空光照等级数值
 */
const skyLightingSelector = () => +store.state.config.skyLighting;

/**
 * 获取当前缩放因子。
 * @returns {number} 缩放因子数值
 */
const scaleFactorSelector = () => store.state.config.scaleFactor;

/**
 * 获取是否启用文字烟花功能。
 * @returns {boolean} 如果启用文字烟花则返回 true
 */
const textFireworkSelector = () => store.state.config.textFirework;

/**
 * 获取文字是否使用随机颜色。
 * @returns {boolean} 如果文字使用随机颜色则返回 true
 */
const textRandomColorSelector = () => store.state.config.textRandomColor;

/**
 * 获取每次显示的文字字符数量。
 * @returns {number} 每次显示的字符数量
 */
const textDisplayCountSelector = () => store.state.config.textDisplayCount;

/**
 * 获取文字烟花是否使用随机位置。
 * @returns {boolean} 如果文字使用随机位置则返回 true
 */
const textRandomPositionSelector = () => store.state.config.textRandomPosition;

/**
 * 获取文字随机位置模式下是否打乱发射顺序。
 * @returns {boolean} 如果打乱发射顺序则返回 true
 */
const textRandomPositionShuffleSelector = () => store.state.config.textRandomPositionShuffle;

/**
 * 获取文字烟花是否启用单簇显示所有文字模式。
 * @returns {boolean} 如果启用单簇显示则返回 true
 */
const textSingleClusterSelector = () => store.state.config.textSingleCluster;

/**
 * 获取当前发射序列名称。
 * @returns {string} 发射序列名称字符串
 */
const launchSequenceSelector = () => store.state.config.launchSequence;

export {
	isRunning,
	soundEnabledSelector,
	canPlaySoundSelector,
	qualitySelector,
	shellNameSelector,
	shellSizeSelector,
	finaleSelector,
	skyLightingSelector,
	scaleFactorSelector,
	textFireworkSelector,
	textRandomColorSelector,
	textDisplayCountSelector,
	textRandomPositionSelector,
	textRandomPositionShuffleSelector,
	textSingleClusterSelector,
	launchSequenceSelector,
};
