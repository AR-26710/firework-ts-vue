/**
 * @module tests/shell-registry.test
 * @description 烟花类型注册表单元测试。
 */

import { describe, it, expect } from 'vitest';
import {
	registerShell,
	registerShells,
	getShellNames,
	getShellTypes,
	getShellFactory,
	getFastShellBlacklist,
} from '../simulation/shell-registry';

describe('ShellRegistry', () => {
	describe('registerShell', () => {
		it('应成功注册一个烟花类型', () => {
			const uniqueName = `TestShell_${Date.now()}`;
			registerShell({
				name: uniqueName,
				factory: (size = 1) => ({
					shellSize: size,
					spreadSize: 300,
					starLife: 900,
					color: '#fff',
					glitter: '',
				}),
			});

			expect(getShellNames()).toContain(uniqueName);
		});

		it('应在注册重复名称时抛出错误', () => {
			const uniqueName = `DuplicateShell_${Date.now()}`;
			registerShell({
				name: uniqueName,
				factory: () => ({
					shellSize: 1,
					spreadSize: 300,
					starLife: 900,
					color: '#fff',
					glitter: '',
				}),
			});

			expect(() => {
				registerShell({
					name: uniqueName,
					factory: () => ({
						shellSize: 1,
						spreadSize: 300,
						starLife: 900,
						color: '#fff',
						glitter: '',
					}),
				});
			}).toThrow('already registered');
		});
	});

	describe('registerShells', () => {
		it('应批量注册多个烟花类型', () => {
			const prefix = `Batch_${Date.now()}_`;
			registerShells([
				{
					name: `${prefix}1`,
					factory: () => ({
						shellSize: 1,
						spreadSize: 300,
						starLife: 900,
						color: '#fff',
						glitter: '',
					}),
				},
				{
					name: `${prefix}2`,
					factory: () => ({
						shellSize: 1,
						spreadSize: 300,
						starLife: 900,
						color: '#fff',
						glitter: '',
					}),
				},
			]);

			const names = getShellNames();
			expect(names).toContain(`${prefix}1`);
			expect(names).toContain(`${prefix}2`);
		});
	});

	describe('getShellFactory', () => {
		it('应返回指定名称的工厂函数', () => {
			const uniqueName = `FactoryShell_${Date.now()}`;
			registerShell({
				name: uniqueName,
				factory: (size = 1) => ({
					shellSize: size,
					spreadSize: 300,
					starLife: 900,
					color: '#fff',
					glitter: '',
				}),
			});

			const factory = getShellFactory(uniqueName);
			expect(factory).toBeDefined();
			expect(typeof factory).toBe('function');

			const config = factory!(2);
			expect(config.shellSize).toBe(2);
		});

		it('不存在的名称应返回 undefined', () => {
			expect(getShellFactory('NonExistent')).toBeUndefined();
		});
	});

	describe('getShellTypes', () => {
		it('应返回所有已注册类型的工厂映射', () => {
			const types = getShellTypes();
			expect(typeof types).toBe('object');
			expect(Object.keys(types).length).toBeGreaterThan(0);
		});
	});

	describe('getFastShellBlacklist', () => {
		it('应返回快速烟花黑名单数组', () => {
			const blacklist = getFastShellBlacklist();
			expect(Array.isArray(blacklist)).toBe(true);
		});

		it('应包含标记为 fastBlacklisted 的类型', () => {
			const uniqueName = `Blacklisted_${Date.now()}`;
			registerShell({
				name: uniqueName,
				factory: () => ({
					shellSize: 1,
					spreadSize: 300,
					starLife: 900,
					color: '#fff',
					glitter: '',
				}),
				fastBlacklisted: true,
			});

			const blacklist = getFastShellBlacklist();
			expect(blacklist).toContain(uniqueName);
		});
	});
});
