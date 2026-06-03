/**
 * @module keyboard-handler
 * @description 键盘事件处理模块，负责监听并响应各种键盘快捷键操作。
 * 快捷键配置集中在 shortcuts.ts 注册表中管理。
 */

import { getShortcutByKey } from './shortcuts';
import { store } from '@/store/store';

/**
 * 键盘按键事件处理函数。
 */
function handleKeydown(event: KeyboardEvent) {
	if (
		(event.target as HTMLElement).tagName === 'INPUT' ||
		(event.target as HTMLElement).tagName === 'TEXTAREA'
	) {
		return;
	}

	const key = (event.ctrlKey && event.key !== 'Control' ? 'ctrl+' : '') + event.key.toLowerCase();
	const shortcut = getShortcutByKey(key);

	if (!shortcut) return;

	if (store.state.settingOpen && key !== 'o') {
		return;
	}

	if (store.state.openHelpTopic && key !== '/') {
		return;
	}

	if (shortcut.preventDefault) {
		event.preventDefault();
	}

	if (shortcut.ignoreRepeat && event.repeat) {
		return;
	}

	shortcut.action(event);
}

/**
 * 初始化键盘事件监听器。
 */
export function initKeyboardHandler() {
	window.addEventListener('keydown', handleKeydown);
}
