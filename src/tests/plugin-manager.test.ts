/**
 * @module tests/plugin-manager.test
 * @description 插件管理器单元测试。
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PluginManager } from '../simulation/plugins/plugin-manager';
import type { FireworkPlugin } from '../simulation/plugins/types';

describe('PluginManager', () => {
	let manager: PluginManager;

	beforeEach(() => {
		manager = new PluginManager();
	});

	describe('register', () => {
		it('应成功注册一个插件', () => {
			const plugin: FireworkPlugin = {
				id: 'test-plugin',
				description: '测试插件',
				shells: [
					{
						name: 'TestShell',
						factory: (size = 1) => ({
							shellSize: size,
							spreadSize: 300,
							starLife: 900,
							color: '#fff',
							glitter: '',
						}),
					},
				],
			};

			manager.register(plugin);
			expect(manager.has('test-plugin')).toBe(true);
			expect(manager.size).toBe(1);
		});

		it('应在注册重复 ID 时抛出错误', () => {
			const plugin: FireworkPlugin = {
				id: 'duplicate-plugin',
				shells: [],
			};

			manager.register(plugin);
			expect(() => manager.register(plugin)).toThrow('already registered');
		});

		it('应调用插件的 onInit 钩子', () => {
			let initCalled = false;
			const plugin: FireworkPlugin = {
				id: 'init-test',
				onInit: () => {
					initCalled = true;
				},
			};

			manager.register(plugin);
			expect(initCalled).toBe(true);
		});

		it('应正确设置插件状态为 initialized', () => {
			const plugin: FireworkPlugin = { id: 'state-test' };
			manager.register(plugin);
			expect(manager.getState('state-test')).toBe('initialized');
		});
	});

	describe('registerAll', () => {
		it('应批量注册多个插件', () => {
			const plugins: FireworkPlugin[] = [
				{ id: 'plugin-1' },
				{ id: 'plugin-2' },
				{ id: 'plugin-3' },
			];

			manager.registerAll(plugins);
			expect(manager.size).toBe(3);
			expect(manager.has('plugin-1')).toBe(true);
			expect(manager.has('plugin-2')).toBe(true);
			expect(manager.has('plugin-3')).toBe(true);
		});
	});

	describe('unregister', () => {
		it('应成功卸载已注册的插件', () => {
			const plugin: FireworkPlugin = { id: 'to-remove' };
			manager.register(plugin);
			expect(manager.has('to-remove')).toBe(true);

			const result = manager.unregister('to-remove');
			expect(result).toBe(true);
			expect(manager.has('to-remove')).toBe(false);
		});

		it('应调用插件的 onDestroy 钩子', () => {
			let destroyCalled = false;
			const plugin: FireworkPlugin = {
				id: 'destroy-test',
				onDestroy: () => {
					destroyCalled = true;
				},
			};

			manager.register(plugin);
			manager.unregister('destroy-test');
			expect(destroyCalled).toBe(true);
		});

		it('卸载不存在的插件应返回 false', () => {
			expect(manager.unregister('non-existent')).toBe(false);
		});
	});

	describe('getPlugin', () => {
		it('应返回指定插件的信息', () => {
			const plugin: FireworkPlugin = { id: 'info-test', description: '信息测试' };
			manager.register(plugin);

			const info = manager.getPlugin('info-test');
			expect(info).toBeDefined();
			expect(info!.plugin.id).toBe('info-test');
			expect(info!.plugin.description).toBe('信息测试');
			expect(info!.state).toBe('initialized');
			expect(info!.registeredAt).toBeGreaterThan(0);
		});

		it('不存在的插件应返回 undefined', () => {
			expect(manager.getPlugin('non-existent')).toBeUndefined();
		});
	});

	describe('getAllPlugins / getPluginIds', () => {
		it('应返回所有插件信息', () => {
			manager.registerAll([{ id: 'p1' }, { id: 'p2' }]);

			const all = manager.getAllPlugins();
			expect(all.length).toBe(2);
			expect(all.map((i) => i.plugin.id)).toContain('p1');
			expect(all.map((i) => i.plugin.id)).toContain('p2');
		});

		it('应返回所有插件 ID', () => {
			manager.registerAll([{ id: 'id-1' }, { id: 'id-2' }]);

			const ids = manager.getPluginIds();
			expect(ids).toEqual(['id-1', 'id-2']);
		});
	});

	describe('getState', () => {
		it('未注册的插件应返回 unregistered', () => {
			expect(manager.getState('non-existent')).toBe('unregistered');
		});
	});
});
