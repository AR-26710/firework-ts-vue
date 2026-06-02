/**
 * @module simulation/plugins/types
 * @description 烟花插件系统类型定义。定义插件接口规范，
 * 包括烟花类型插件和发射序列插件的接口。
 */

import type { ShellConfig } from '../shell-utils';

/**
 * 烟花类型插件项。描述一个可注册的烟花类型。
 */
interface ShellPluginEntry {
	/** 烟花弹类型名称（英文标识，如 'Crysanthemum'） */
	name: string;
	/** 烟花弹配置工厂函数 */
	factory: (size?: number) => ShellConfig;
	/** 是否为快速烟花弹黑名单类型（持续时间过长，不适合快速连续发射） */
	fastBlacklisted?: boolean;
}

/**
 * 发射序列插件项。描述一个可注册的发射序列。
 */
interface SequencePluginEntry {
	/** 序列名称（英文标识，如 'Triple'） */
	name: string;
	/** 序列执行函数，返回下一次序列调用的延迟时间（毫秒） */
	execute: () => number;
	/**
	 * 随机模式下该序列的权重（0~1）。
	 * 调度器按权重累加顺序依次判断，值越小越先被判断。
	 * 不参与随机模式的序列可省略。
	 */
	randomWeight?: number;
	/**
	 * 随机模式下的前置条件。返回 true 时该序列才可能被随机选中。
	 * 未设置时默认始终满足条件。
	 */
	randomCondition?: () => boolean;
	/**
	 * 冷却时间（毫秒）。两次调用该序列之间的最小间隔。
	 * 未设置时表示无冷却限制。
	 */
	cooldown?: number;
}

/**
 * 烟花插件接口。一个插件可以包含烟花类型定义、发射序列定义，或两者兼有。
 *
 * @example
 * ```ts
 * // 定义一个仅包含烟花类型的插件
 * const myShellPlugin: FireworkPlugin = {
 *   id: 'shell-my-type',
 *   description: '我的自定义烟花类型',
 *   shells: [{
 *     name: 'MyType',
 *     factory: (size = 1) => ({ shellSize: size, ... }),
 *     fastBlacklisted: false
 *   }]
 * };
 *
 * // 定义一个仅包含发射序列的插件
 * const mySeqPlugin: FireworkPlugin = {
 *   id: 'sequence-my-seq',
 *   description: '我的自定义发射序列',
 *   sequences: [{
 *     name: 'MySequence',
 *     execute: () => { ... return 2000; },
 *     randomWeight: 0.15,
 *     cooldown: 10000
 *   }]
 * };
 * ```
 */
interface FireworkPlugin {
	/** 插件唯一标识，建议使用 'shell-xxx' 或 'sequence-xxx' 前缀 */
	id: string;
	/** 插件描述 */
	description?: string;
	/** 插件版本 */
	version?: string;
	/** 烟花类型定义列表 */
	shells?: ShellPluginEntry[];
	/** 发射序列定义列表 */
	sequences?: SequencePluginEntry[];
	/**
	 * 插件初始化钩子。在插件注册完成后调用，可用于执行一次性初始化逻辑。
	 * 可选实现。
	 */
	onInit?: () => void;
	/**
	 * 插件销毁钩子。在插件卸载前调用，可用于清理资源。
	 * 可选实现。
	 */
	onDestroy?: () => void;
}

/**
 * 插件状态枚举。
 */
type PluginState = 'unregistered' | 'registered' | 'initialized' | 'destroyed';

/**
 * 插件注册信息。记录插件的注册状态和元数据。
 */
interface PluginInfo {
	/** 插件实例 */
	plugin: FireworkPlugin;
	/** 插件当前状态 */
	state: PluginState;
	/** 注册时间戳 */
	registeredAt: number;
}

export type { FireworkPlugin, ShellPluginEntry, SequencePluginEntry, PluginState, PluginInfo };
