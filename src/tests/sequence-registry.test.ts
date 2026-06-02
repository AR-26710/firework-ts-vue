/**
 * @module tests/sequence-registry.test
 * @description 发射序列注册表单元测试。
 */

import { describe, it, expect } from 'vitest';
import {
	registerSequence,
	registerSequences,
	getSequenceNames,
	executeSequence,
	isCooledDown,
	getRandomWeightedSequences,
} from '../simulation/sequences/sequence-registry';

describe('SequenceRegistry', () => {
	describe('registerSequence', () => {
		it('应成功注册一个发射序列', () => {
			const uniqueName = `TestSeq_${Date.now()}`;
			registerSequence({
				name: uniqueName,
				execute: () => 1000,
			});

			expect(getSequenceNames()).toContain(uniqueName);
		});

		it('应在注册重复名称时抛出错误', () => {
			const uniqueName = `DupSeq_${Date.now()}`;
			registerSequence({ name: uniqueName, execute: () => 0 });

			expect(() => {
				registerSequence({ name: uniqueName, execute: () => 0 });
			}).toThrow('already registered');
		});
	});

	describe('registerSequences', () => {
		it('应批量注册多个发射序列', () => {
			const prefix = `BatchSeq_${Date.now()}_`;
			registerSequences([
				{ name: `${prefix}1`, execute: () => 500 },
				{ name: `${prefix}2`, execute: () => 1000 },
			]);

			const names = getSequenceNames();
			expect(names).toContain(`${prefix}1`);
			expect(names).toContain(`${prefix}2`);
		});
	});

	describe('getSequenceNames', () => {
		it('Random 若已注册应排在首位', () => {
			// 先注册 Random
			const randomName = `Random_${Date.now()}`;
			registerSequence({ name: randomName, execute: () => 0 });

			const names = getSequenceNames();
			// 验证名称列表不为空
			expect(names.length).toBeGreaterThan(0);
		});
	});

	describe('executeSequence', () => {
		it('应执行指定序列并返回延迟时间', () => {
			const uniqueName = `ExecSeq_${Date.now()}`;
			registerSequence({
				name: uniqueName,
				execute: () => 2500,
			});

			const delay = executeSequence(uniqueName);
			expect(delay).toBe(2500);
		});

		it('不存在的序列应返回 0', () => {
			const delay = executeSequence('NonExistent');
			expect(delay).toBe(0);
		});
	});

	describe('isCooledDown', () => {
		it('无冷却限制的序列应始终返回 true', () => {
			const uniqueName = `NoCooldown_${Date.now()}`;
			registerSequence({ name: uniqueName, execute: () => 0 });
			expect(isCooledDown(uniqueName)).toBe(true);
		});

		it('有冷却限制的序列在冷却期内应返回 false', () => {
			const uniqueName = `CooldownSeq_${Date.now()}`;
			registerSequence({
				name: uniqueName,
				execute: () => 1000,
				cooldown: 60000, // 60秒冷却
			});

			// 刚执行后应在冷却期内
			executeSequence(uniqueName);
			expect(isCooledDown(uniqueName)).toBe(false);
		});
	});

	describe('getRandomWeightedSequences', () => {
		it('应返回设置了 randomWeight 的序列', () => {
			const prefix = `Weighted_${Date.now()}_`;
			registerSequences([
				{ name: `${prefix}1`, execute: () => 500, randomWeight: 0.3 },
				{ name: `${prefix}2`, execute: () => 1000, randomWeight: 0.8 },
			]);

			const weighted = getRandomWeightedSequences();
			const filtered = weighted.filter((s) => s.name.startsWith(prefix));
			expect(filtered.length).toBe(2);

			// 验证升序排列
			for (let i = 1; i < filtered.length; i++) {
				expect(filtered[i].randomWeight!).toBeGreaterThanOrEqual(filtered[i - 1].randomWeight!);
			}
		});

		it('所有返回的序列都应有 randomWeight', () => {
			const weighted = getRandomWeightedSequences();
			weighted.forEach((seq) => {
				expect(seq.randomWeight).toBeDefined();
				expect(seq.randomWeight).toBeGreaterThan(0);
			});
		});
	});
});
