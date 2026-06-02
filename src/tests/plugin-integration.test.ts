/**
 * @module tests/plugin-integration.test
 * @description 插件系统集成测试。验证插件系统的端到端功能。
 * 使用 jsdom 环境模拟浏览器 API。
 */

// @vitest-environment jsdom

import { describe, it, expect, beforeAll } from 'vitest';
import { pluginManager, initializePlugins } from '../simulation/plugins';
import {
	getShellNames,
	getShellFactory,
	getFastShellBlacklist,
} from '../simulation/shell-registry';
import { getSequenceNames, executeSequence } from '../simulation/sequences/sequence-registry';
import type { FireworkPlugin } from '../simulation/plugins/types';

describe('Plugin System Integration', () => {
	beforeAll(() => {
		// 初始化插件系统
		initializePlugins();
	});

	describe('内置烟花类型插件', () => {
		it('应注册所有 12 种内置烟花类型', () => {
			const names = getShellNames();
			expect(names).toContain('Random');
			expect(names).toContain('Crackle');
			expect(names).toContain('Crossette');
			expect(names).toContain('Crysanthemum');
			expect(names).toContain('Falling Leaves');
			expect(names).toContain('Floral');
			expect(names).toContain('Ghost');
			expect(names).toContain('Horse Tail');
			expect(names).toContain('Palm');
			expect(names).toContain('Ring');
			expect(names).toContain('Strobe');
			expect(names).toContain('Willow');
			expect(names.length).toBe(12);
		});

		it('Random 应排在首位', () => {
			const names = getShellNames();
			expect(names[0]).toBe('Random');
		});

		it('每种烟花类型都应有可用的工厂函数', () => {
			const names = getShellNames();
			for (const name of names) {
				const factory = getShellFactory(name);
				expect(factory).toBeDefined();
				expect(typeof factory).toBe('function');

				// 工厂函数应能生成有效的 ShellConfig
				const config = factory!(1);
				expect(config).toBeDefined();
				expect(config.shellSize).toBe(1);
				expect(config.spreadSize).toBeGreaterThan(0);
				expect(config.starLife).toBeGreaterThan(0);
			}
		});

		it('快速烟花黑名单应包含 Falling Leaves、Floral 和 Willow', () => {
			const blacklist = getFastShellBlacklist();
			expect(blacklist).toContain('Falling Leaves');
			expect(blacklist).toContain('Floral');
			expect(blacklist).toContain('Willow');
		});
	});

	describe('内置发射序列插件', () => {
		it('应注册所有 6 种内置发射序列', () => {
			const names = getSequenceNames();
			expect(names).toContain('Random');
			expect(names).toContain('Single');
			expect(names).toContain('Double');
			expect(names).toContain('Triple');
			expect(names).toContain('Pyramid');
			expect(names).toContain('Small Barrage');
			expect(names.length).toBe(6);
		});

		it('Random 序列应排在首位', () => {
			const names = getSequenceNames();
			expect(names[0]).toBe('Random');
		});
	});

	describe('插件管理器', () => {
		it('应包含所有已注册的插件', () => {
			// 12 个烟花类型插件 + 6 个序列插件 = 18 个
			expect(pluginManager.size).toBe(18);
		});

		it('所有插件状态应为 initialized', () => {
			const allPlugins = pluginManager.getAllPlugins();
			allPlugins.forEach((info) => {
				expect(info.state).toBe('initialized');
			});
		});
	});

	describe('动态注册新插件', () => {
		it('应能动态注册新的烟花类型插件', () => {
			const newPlugin: FireworkPlugin = {
				id: 'shell-custom-test',
				description: '自定义测试烟花',
				shells: [
					{
						name: 'CustomTest',
						factory: (size = 1) => ({
							shellSize: size,
							spreadSize: 400 + size * 100,
							starLife: 1000 + size * 200,
							color: '#ff0000',
							glitter: 'light',
							glitterColor: '#ffffff',
						}),
						fastBlacklisted: false,
					},
				],
			};

			pluginManager.register(newPlugin);

			expect(getShellNames()).toContain('CustomTest');
			const factory = getShellFactory('CustomTest');
			expect(factory).toBeDefined();

			const config = factory!(2);
			expect(config.shellSize).toBe(2);
			expect(config.spreadSize).toBe(600);

			// 清理
			pluginManager.unregister('shell-custom-test');
		});

		it('应能动态注册新的发射序列插件', () => {
			const newPlugin: FireworkPlugin = {
				id: 'sequence-custom-test',
				description: '自定义测试序列',
				sequences: [
					{
						name: 'CustomSequence',
						execute: () => 3000,
						randomWeight: 0.5,
					},
				],
			};

			pluginManager.register(newPlugin);

			expect(getSequenceNames()).toContain('CustomSequence');
			const delay = executeSequence('CustomSequence');
			expect(delay).toBe(3000);

			// 清理
			pluginManager.unregister('sequence-custom-test');
		});

		it('应能注册同时包含烟花和序列的插件', () => {
			const comboPlugin: FireworkPlugin = {
				id: 'combo-test',
				description: '组合测试插件',
				shells: [
					{
						name: 'ComboShell',
						factory: (size = 1) => ({
							shellSize: size,
							spreadSize: 350,
							starLife: 800,
							color: '#00ff00',
							glitter: 'medium',
						}),
					},
				],
				sequences: [
					{
						name: 'ComboSequence',
						execute: () => 2000,
					},
				],
			};

			pluginManager.register(comboPlugin);

			expect(getShellNames()).toContain('ComboShell');
			expect(getSequenceNames()).toContain('ComboSequence');

			// 清理
			pluginManager.unregister('combo-test');
		});
	});
});
