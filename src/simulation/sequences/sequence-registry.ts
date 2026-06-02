/**
 * @module simulation/sequences/sequence-registry
 * @description 发射序列注册表。提供声明式注册发射序列的机制，
 * 新增发射序列只需调用 registerSequence 即可，无需修改 dispatcher 等模块。
 */

/**
 * 发射序列注册项。
 */
interface SequenceRegistryEntry {
	/** 序列名称（英文标识，如 'Triple'） */
	name: string;
	/** 序列执行函数，返回下一次序列调用的延迟时间（毫秒） */
	execute: () => number;
	/**
	 * 随机模式下该序列的权重（0~1）。
	 * 调度器按权重累加顺序依次判断，值越小越先被判断。
	 * 例如：0.08 表示 8% 概率命中。
	 * 不参与随机模式的序列（如 'Random'、'Single'）可省略。
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
 * 内部存储：序列注册项映射表。
 */
const entries = new Map<string, SequenceRegistryEntry>();

/**
 * 冷却状态记录。键名为序列名称，值为上次调用的时间戳。
 */
const lastCalledMap = new Map<string, number>();

/**
 * 注册一个发射序列。
 * 注册后该序列会自动出现在 UI 选项和调度器中。
 *
 * @param entry - 序列注册项
 * @throws 如果名称已注册则抛出错误
 *
 * @example
 * ```ts
 * registerSequence({
 *   name: 'MySequence',
 *   execute: () => { ... return 2000; },
 *   randomWeight: 0.15,
 *   cooldown: 10000
 * });
 * ```
 */
function registerSequence(entry: SequenceRegistryEntry): void {
	if (entries.has(entry.name)) {
		throw new Error(`Sequence "${entry.name}" is already registered.`);
	}
	entries.set(entry.name, entry);
	if (entry.cooldown) {
		lastCalledMap.set(entry.name, 0);
	}
}

/**
 * 批量注册发射序列。
 *
 * @param entries - 序列注册项数组
 */
function registerSequences(list: SequenceRegistryEntry[]): void {
	list.forEach(registerSequence);
}

/**
 * 获取所有已注册的发射序列名称列表。
 * 'Random' 始终排在首位，其余按注册顺序排列。
 *
 * @returns 序列名称数组（readonly）
 */
function getSequenceNames(): readonly string[] {
	const names = Array.from(entries.keys());
	// 'Random' 始终排在首位
	const randomIdx = names.indexOf('Random');
	if (randomIdx > 0) {
		names.splice(randomIdx, 1);
		names.unshift('Random');
	}
	return names;
}

/**
 * 执行指定名称的发射序列。
 *
 * @param name - 序列名称
 * @returns 下一次序列调用的延迟时间（毫秒），若序列未找到则返回 0
 */
function executeSequence(name: string): number {
	const entry = entries.get(name);
	if (!entry) {
		console.warn(`Sequence "${name}" not found.`);
		return 0;
	}
	if (entry.cooldown) {
		lastCalledMap.set(name, Date.now());
	}
	return entry.execute();
}

/**
 * 检查指定序列是否已通过冷却时间。
 *
 * @param name - 序列名称
 * @returns 若冷却已过或无冷却限制返回 true，否则返回 false
 */
function isCooledDown(name: string): boolean {
	const entry = entries.get(name);
	if (!entry || !entry.cooldown) return true;
	const lastCalled = lastCalledMap.get(name) ?? 0;
	return Date.now() - lastCalled > entry.cooldown;
}

/**
 * 获取所有参与随机模式的序列注册项，按 randomWeight 升序排列。
 * 仅包含设置了 randomWeight 的序列。
 *
 * @returns 排序后的序列注册项数组
 */
function getRandomWeightedSequences(): SequenceRegistryEntry[] {
	const result: SequenceRegistryEntry[] = [];
	entries.forEach((entry) => {
		if (entry.randomWeight !== undefined) {
			result.push(entry);
		}
	});
	return result.sort((a, b) => (a.randomWeight ?? 0) - (b.randomWeight ?? 0));
}

export {
	registerSequence,
	registerSequences,
	getSequenceNames,
	executeSequence,
	isCooledDown,
	getRandomWeightedSequences,
};

export type { SequenceRegistryEntry };
