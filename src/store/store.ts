/**
 * @module store
 * @description 应用状态管理模块。提供集中式状态存储，支持状态订阅、持久化和版本化数据迁移。
 * 使用观察者模式实现状态变更通知，通过 localStorage 实现配置持久化。
 */

import { fscreen } from '@/core/fscreen';
import {
	IS_HEADER,
	IS_DESKTOP,
	IS_HIGH_END_DEVICE,
	QUALITY_HIGH,
	QUALITY_NORMAL,
	SKY_LIGHT_NORMAL,
	getDefaultScaleFactor,
} from '@/core/constants';

/**
 * 应用配置接口，定义了所有可由用户调整的配置项。
 * @interface StoreConfig
 * @property {string} quality - 画质等级（低/中/高）
 * @property {string} shell - 烟花类型名称
 * @property {string} size - 烟花尺寸
 * @property {boolean} autoLaunch - 是否自动发射烟花
 * @property {boolean} finale - 是否启用终幕模式
 * @property {string} skyLighting - 天空光照等级
 * @property {boolean} hideControls - 是否隐藏控制面板
 * @property {boolean} longExposure - 是否启用长曝光效果
 * @property {number} scaleFactor - 缩放因子
 * @property {boolean} textFirework - 是否启用文字烟花
 * @property {boolean} textRandomColor - 文字是否使用随机颜色
 * @property {number} textDisplayCount - 每次显示的文字字符数量
 */
interface StoreConfig {
	quality: string;
	shell: string;
	size: string;
	autoLaunch: boolean;
	finale: boolean;
	skyLighting: string;
	hideControls: boolean;
	hideToast: boolean;
	longExposure: boolean;
	scaleFactor: number;
	textFirework: boolean;
	textRandomColor: boolean;
	textDisplayCount: number;
	textRandomPosition: boolean;
	textRandomPositionShuffle: boolean;
	textSingleCluster: boolean;
	launchSequence: string;
	hideCursor: boolean;
	autoHideCursor: boolean;
}

/**
 * 应用状态接口，包含运行时状态和用户配置。
 * @interface StoreState
 * @property {boolean} paused - 是否暂停
 * @property {boolean} soundEnabled - 是否启用声音
 * @property {boolean} settingOpen - 菜单是否打开
 * @property {string | null} openHelpTopic - 当前打开的帮助主题键名，无则为 null
 * @property {boolean} fullscreen - 是否处于全屏模式
 * @property {StoreConfig} config - 用户配置对象
 */
interface StoreState {
	paused: boolean;
	soundEnabled: boolean;
	settingOpen: boolean;
	openHelpTopic: string | null;
	fullscreen: boolean;
	config: StoreConfig;
}

/**
 * 持久化数据模式 v1.7，保存所有用户可调整的配置项。
 * @interface StoreSchema
 * @property {'1.7'} schemaVersion - 数据模式版本号
 * @property {object} data - 持久化的配置数据
 */
interface StoreSchema {
	schemaVersion: '1.7';
	data: Pick<
		StoreConfig,
		| 'quality'
		| 'size'
		| 'skyLighting'
		| 'scaleFactor'
		| 'launchSequence'
		| 'shell'
		| 'hideControls'
		| 'hideToast'
		| 'longExposure'
		| 'textFirework'
		| 'textRandomColor'
		| 'textDisplayCount'
		| 'textRandomPosition'
		| 'textRandomPositionShuffle'
		| 'textSingleCluster'
		| 'autoLaunch'
		| 'hideCursor'
		| 'autoHideCursor'
	>;
}

/**
 * 状态存储接口，定义了状态管理的核心方法。
 * @interface Store
 * @property {Set<(state: StoreState, prevState: StoreState) => void>} _listeners - 状态变更监听器集合
 * @property {(prevState: StoreState) => void} _dispatch - 通知所有监听器状态已变更
 * @property {StoreState} state - 当前应用状态
 * @property {(nextState: Partial<StoreState>) => void} setState - 更新状态并通知监听器和持久化
 * @property {(listener: (state: StoreState, prevState: StoreState) => void) => () => void} subscribe - 订阅状态变更，返回取消订阅的函数
 * @property {() => void} load - 从 localStorage 加载持久化的配置数据
 * @property {() => void} persist - 将当前配置持久化到 localStorage
 */
interface Store {
	_listeners: Set<(state: StoreState, prevState: StoreState) => void>;
	_dispatch(prevState: StoreState): void;
	state: StoreState;
	setState(nextState: Partial<StoreState>): void;
	subscribe(listener: (state: StoreState, prevState: StoreState) => void): () => void;
	load(): void;
	persist(): void;
}

/**
 * 检测当前是否处于全屏模式。
 * @returns {boolean} 如果当前有全屏元素则返回 true，否则返回 false
 */
function isFullscreen(): boolean {
	return !!fscreen.fullscreenElement;
}

/**
 * 获取默认配置对象。
 * @returns {StoreConfig} 默认配置对象
 */
function getDefaultConfig(): StoreConfig {
	return {
		quality: String(IS_HIGH_END_DEVICE ? QUALITY_HIGH : QUALITY_NORMAL),
		shell: 'Random',
		size: IS_DESKTOP ? '3' : IS_HEADER ? '1.2' : '2',
		autoLaunch: true,
		finale: false,
		skyLighting: SKY_LIGHT_NORMAL + '',
		hideControls: IS_HEADER,
		hideToast: false,
		longExposure: false,
		scaleFactor: getDefaultScaleFactor(),
		textFirework: false,
		textRandomColor: false,
		textDisplayCount: 6,
		textRandomPosition: false,
		textRandomPositionShuffle: false,
		textSingleCluster: false,
		launchSequence: 'Random',
		hideCursor: false,
		autoHideCursor: false,
	};
}

/**
 * 持久化配置键名列表，与 StoreSchema.data 的 Pick 类型保持同步。
 * 新增配置项时只需在此列表和 StoreSchema 的 Pick 类型中添加，无需修改 persist() 方法。
 */
const PERSIST_CONFIG_KEYS: (keyof StoreSchema['data'])[] = [
	'quality',
	'size',
	'skyLighting',
	'scaleFactor',
	'launchSequence',
	'shell',
	'hideControls',
	'hideToast',
	'longExposure',
	'textFirework',
	'textRandomColor',
	'textDisplayCount',
	'textRandomPosition',
	'textRandomPositionShuffle',
	'textSingleCluster',
	'autoLaunch',
	'hideCursor',
	'autoHideCursor',
];

/**
 * 应用状态存储单例对象。
 * 管理应用的全部运行时状态和用户配置，提供状态变更通知和持久化能力。
 * 初始化时根据设备类型设置默认配置，非头部嵌入模式下自动加载持久化数据。
 * @type {Store}
 */
const store: Store = {
	/** @type {Set<(state: StoreState, prevState: StoreState) => void>} 状态变更监听器集合 */
	_listeners: new Set<(state: StoreState, prevState: StoreState) => void>(),

	/**
	 * 通知所有已注册的监听器状态已发生变更。
	 * @param {StoreState} prevState - 变更前的状态快照
	 */
	_dispatch(prevState) {
		this._listeners.forEach((listener) => listener(this.state, prevState));
	},

	/** @type {StoreState} 当前应用状态 */
	state: {
		paused: true,
		soundEnabled: false,
		settingOpen: false,
		openHelpTopic: null,
		fullscreen: isFullscreen(),
		config: getDefaultConfig(),
	},

	/**
	 * 更新应用状态。将新状态与当前状态合并，然后通知所有监听器并持久化配置。
	 * @param {Partial<StoreState>} nextState - 需要更新的状态片段
	 */
	setState(nextState) {
		const prevState = this.state;
		this.state = Object.assign({}, this.state, nextState);
		this._dispatch(prevState);
		this.persist();
	},

	/**
	 * 注册状态变更监听器。每次调用 setState 后，所有监听器都会被调用。
	 * @param {(state: StoreState, prevState: StoreState) => void} listener - 状态变更回调函数，接收新状态和旧状态
	 * @returns {() => void} 取消订阅的函数，调用后该监听器将被移除
	 */
	subscribe(listener) {
		this._listeners.add(listener);
		return () => {
			this._listeners.delete(listener);
		};
	},

	/**
	 * 从 localStorage 加载持久化的配置数据。
	 * 仅支持 v1.7 数据模式，旧版数据将被清除。
	 */
	load() {
		const serializedData = localStorage.getItem('cm_fireworks_data');
		if (!serializedData) return;

		try {
			const parsed = JSON.parse(serializedData);
			if (typeof parsed !== 'object' || parsed === null) {
				throw new Error('Invalid data format');
			}
			const { schemaVersion, data } = parsed as StoreSchema;
			if (schemaVersion !== '1.7') {
				localStorage.removeItem('cm_fireworks_data');
				return;
			}
			Object.assign(this.state.config, data);
			console.log(`Loaded config (schema version ${schemaVersion})`);
		} catch (e) {
			console.log('Recovered from error parsing saved config:');
			console.error(e);
			localStorage.removeItem('cm_fireworks_data');
		}
	},

	/**
	 * 将当前配置持久化到 localStorage。
	 * 自动从 PERSIST_CONFIG_KEYS 提取需要持久化的字段，避免手动逐字段列出。
	 */
	persist() {
		const config = this.state.config;
		const data: Record<string, unknown> = {};
		for (const key of PERSIST_CONFIG_KEYS) {
			data[key] = config[key];
		}
		localStorage.setItem(
			'cm_fireworks_data',
			JSON.stringify({
				schemaVersion: '1.7',
				data: data as StoreSchema['data'],
			})
		);
	},
};

if (!IS_HEADER) {
	store.load();
}

export { store, getDefaultConfig };

export type { StoreState, StoreConfig };
