/**
 * @module shortcuts
 * @description 集中式快捷键注册表。定义所有快捷键的按键、描述和操作，
 * 供 keyboard-handler 和 HelpModal 共同使用，避免重复定义。
 */

import { store } from '@/store/store';
import {
	togglePause,
	toggleSound,
	toggleSetting,
	toggleFullscreen,
	updateConfig,
} from '@/store/actions';
import { setSimSpeed, simSpeed } from '@/core/state';
import { handleResize } from '@/game-loop';
import { getShellNames } from '@/simulation/shell-registry';
import { getSequenceNames } from '@/simulation/sequences/sequence-registry';
import type { LaunchSequenceName } from '@/simulation/sequences/types';
import { showToast } from '@/main';
import i18n from '@/i18n';

/** 速度条透明度响应式引用，用于控制速度条 UI 的显示与隐藏 */
const speedBarOpacityRef = { value: 0 };

/**
 * 获取速度条透明度的响应式引用对象。
 */
export function getSpeedBarOpacityRef() {
	return speedBarOpacityRef;
}

/**
 * 切换烟花壳类型。
 */
function switchShellType(direction: number) {
	const shellNames = getShellNames();
	const currentShell = store.state.config.shell;
	const currentIndex = shellNames.indexOf(currentShell);
	const newIndex = (currentIndex + direction + shellNames.length) % shellNames.length;
	const newShell = shellNames[newIndex];
	updateConfig({ shell: newShell });
	showToast(i18n.global.t(`shellLabels.${newShell}`) || newShell);
}

/**
 * 切换发射序列。
 */
function switchLaunchSequence(direction: number) {
	const launchSequenceNames = getSequenceNames();
	const current = store.state.config.launchSequence as LaunchSequenceName;
	const currentIndex = launchSequenceNames.indexOf(current);
	const newIndex =
		(currentIndex + direction + launchSequenceNames.length) % launchSequenceNames.length;
	const newSequence = launchSequenceNames[newIndex];
	const updates: Record<string, unknown> = { launchSequence: newSequence };
	if (store.state.config.finale) {
		updates.finale = false;
	}
	updateConfig(updates);
	showToast(i18n.global.t(`launchSequenceLabels.${newSequence}`) || newSequence);
}

const shellSizeOptions = ['3"', '4"', '6"', '8"', '12"', '16"'];
const scaleFactorOptions = [0.5, 0.62, 0.75, 0.9, 1.0, 1.5, 2.0];

function adjustShellSize(direction: number) {
	const currentSize = parseInt(store.state.config.size, 10);
	const newSize = (currentSize + direction + shellSizeOptions.length) % shellSizeOptions.length;
	updateConfig({ size: String(newSize) });
	showToast(i18n.global.t('toast.shellSize', { size: shellSizeOptions[newSize] }));
}

function adjustScaleFactor(direction: number) {
	const currentScale = store.state.config.scaleFactor;
	const currentIndex = scaleFactorOptions.findIndex((opt) => Math.abs(opt - currentScale) < 0.01);
	const newIndex =
		(currentIndex + direction + scaleFactorOptions.length) % scaleFactorOptions.length;
	const newScale = scaleFactorOptions[newIndex];
	updateConfig({ scaleFactor: newScale });
	handleResize();
	showToast(i18n.global.t('toast.scaleFactor', { scale: Math.round(newScale * 100) }));
}

/** 快捷键配置项 */
export interface ShortcutDefinition {
	/** 按键列表（event.key 小写），多个键绑定同一操作 */
	keys: string[];
	/** 帮助面板中显示的按键标签，如 "Space / P"、"← / →" */
	label: string;
	/** i18n 描述键，对应 help.shortcuts 下的键名 */
	descriptionKey: string;
	/** 按键触发时的操作 */
	action: (event: KeyboardEvent) => void;
	/** 是否阻止默认行为，默认 false */
	preventDefault?: boolean;
	/** 是否忽略按键重复（长按），默认 false */
	ignoreRepeat?: boolean;
	/** 分类键名，对应 help.shortcuts.categories 下的键名 */
	category: string;
}

/** 快捷键注册表，按顺序排列（帮助面板展示顺序） */
const shortcuts: ShortcutDefinition[] = [
	{
		keys: [' ', 'p'],
		label: 'Space / P',
		descriptionKey: 'pauseResume',
		category: 'playback',
		preventDefault: true,
		action() {
			togglePause();
			showToast(
				store.state.paused ? i18n.global.t('toast.paused') : i18n.global.t('toast.resumed')
			);
		},
	},
	{
		keys: ['s'],
		label: 'S',
		descriptionKey: 'toggleSound',
		category: 'playback',
		action() {
			toggleSound();
			showToast(
				store.state.soundEnabled ? i18n.global.t('toast.soundOn') : i18n.global.t('toast.soundOff')
			);
		},
	},
	{
		keys: ['f'],
		label: 'F',
		descriptionKey: 'toggleFullscreen',
		category: 'playback',
		action() {
			const willBeFullscreen = !store.state.fullscreen;
			toggleFullscreen();
			showToast(
				willBeFullscreen
					? i18n.global.t('toast.fullscreenOn')
					: i18n.global.t('toast.fullscreenOff')
			);
		},
	},
	{
		keys: ['a'],
		label: 'A',
		descriptionKey: 'toggleAutoLaunch',
		category: 'launch',
		action() {
			updateConfig({ autoLaunch: !store.state.config.autoLaunch });
			showToast(
				store.state.config.autoLaunch
					? i18n.global.t('toast.autoLaunchOn')
					: i18n.global.t('toast.autoLaunchOff')
			);
		},
	},
	{
		keys: ['w'],
		label: 'W',
		descriptionKey: 'toggleFinaleMode',
		category: 'launch',
		action() {
			if (!store.state.config.autoLaunch) {
				showToast(i18n.global.t('toast.dependencyAutoLaunch'));
				return;
			}
			updateConfig({ finale: !store.state.config.finale });
			showToast(
				store.state.config.finale
					? i18n.global.t('toast.finaleModeOn')
					: i18n.global.t('toast.finaleModeOff')
			);
		},
	},
	{
		keys: ['arrowleft', 'arrowright'],
		label: '← / →',
		descriptionKey: 'adjustLaunchSequence',
		category: 'launch',
		preventDefault: true,
		ignoreRepeat: true,
		action(event) {
			if (!store.state.config.autoLaunch) {
				showToast(i18n.global.t('toast.dependencyAutoLaunch'));
				return;
			}
			if (store.state.config.finale) {
				showToast(i18n.global.t('toast.dependencyNoFinale'));
				return;
			}
			const direction = event.key === 'ArrowLeft' ? -1 : 1;
			switchLaunchSequence(direction);
		},
	},
	{
		keys: ['arrowup', 'arrowdown'],
		label: '↑ / ↓',
		descriptionKey: 'switchShellType',
		category: 'visual',
		preventDefault: true,
		ignoreRepeat: true,
		action(event) {
			const direction = event.key === 'ArrowUp' ? -1 : 1;
			switchShellType(direction);
		},
	},
	{
		keys: ['l'],
		label: 'L',
		descriptionKey: 'toggleLongExposure',
		category: 'visual',
		action() {
			updateConfig({ longExposure: !store.state.config.longExposure });
			showToast(
				store.state.config.longExposure
					? i18n.global.t('toast.longExposureOn')
					: i18n.global.t('toast.longExposureOff')
			);
		},
	},
	{
		keys: ['h'],
		label: 'H',
		descriptionKey: 'toggleHideControls',
		category: 'visual',
		action() {
			updateConfig({ hideControls: !store.state.config.hideControls });
			showToast(
				store.state.config.hideControls
					? i18n.global.t('toast.hideControlsOn')
					: i18n.global.t('toast.hideControlsOff')
			);
		},
	},
	{
		keys: ['t'],
		label: 'T',
		descriptionKey: 'toggleHideToast',
		category: 'visual',
		action() {
			updateConfig({ hideToast: !store.state.config.hideToast });
			showToast(
				store.state.config.hideToast
					? i18n.global.t('toast.hideToastOn')
					: i18n.global.t('toast.hideToastOff'),
				true
			);
		},
	},
	{
		keys: ['=', '+', '-', '_'],
		label: '+ / -',
		descriptionKey: 'adjustSpeed',
		category: 'visual',
		action(event) {
			const key = event.key;
			const direction = key === '+' || key === '=' ? 1 : -1;
			const newSpeed =
				direction === 1 ? Math.min(1, simSpeed + 0.05) : Math.max(0, simSpeed - 0.05);
			setSimSpeed(newSpeed);
			speedBarOpacityRef.value = 1;
			showToast(i18n.global.t('toast.speed', { speed: Math.round(simSpeed * 100) }));
		},
	},
	{
		keys: ['[', ']'],
		label: '[ / ]',
		descriptionKey: 'adjustShellSize',
		category: 'visual',
		preventDefault: true,
		ignoreRepeat: true,
		action(event) {
			const direction = event.key === '[' ? -1 : 1;
			adjustShellSize(direction);
		},
	},
	{
		keys: [',', '.'],
		label: ', / .',
		descriptionKey: 'adjustScaleFactor',
		category: 'visual',
		preventDefault: true,
		ignoreRepeat: true,
		action(event) {
			const direction = event.key === ',' ? -1 : 1;
			adjustScaleFactor(direction);
		},
	},
	{
		keys: ['e'],
		label: 'E',
		descriptionKey: 'toggleTextFirework',
		category: 'text',
		action() {
			updateConfig({ textFirework: !store.state.config.textFirework });
			showToast(
				store.state.config.textFirework
					? i18n.global.t('toast.textFireworkOn')
					: i18n.global.t('toast.textFireworkOff')
			);
		},
	},
	{
		keys: ['r'],
		label: 'R',
		descriptionKey: 'toggleTextRandomColor',
		category: 'text',
		action() {
			if (!store.state.config.textFirework) {
				showToast(i18n.global.t('toast.dependencyTextFirework'));
				return;
			}
			updateConfig({ textRandomColor: !store.state.config.textRandomColor });
			showToast(
				store.state.config.textRandomColor
					? i18n.global.t('toast.textRandomColorOn')
					: i18n.global.t('toast.textRandomColorOff')
			);
		},
	},
	{
		keys: ['g'],
		label: 'G',
		descriptionKey: 'toggleTextRandomPosition',
		category: 'text',
		action() {
			if (!store.state.config.textFirework) {
				showToast(i18n.global.t('toast.dependencyTextFirework'));
				return;
			}
			updateConfig({ textRandomPosition: !store.state.config.textRandomPosition });
			showToast(
				store.state.config.textRandomPosition
					? i18n.global.t('toast.textRandomPositionOn')
					: i18n.global.t('toast.textRandomPositionOff')
			);
		},
	},
	{
		keys: ['d'],
		label: 'D',
		descriptionKey: 'toggleTextRandomPositionShuffle',
		category: 'text',
		action() {
			if (!store.state.config.textFirework || !store.state.config.textRandomPosition) {
				showToast(i18n.global.t('toast.dependencyTextFireworkAndRandomPosition'));
				return;
			}
			updateConfig({ textRandomPositionShuffle: !store.state.config.textRandomPositionShuffle });
			showToast(
				store.state.config.textRandomPositionShuffle
					? i18n.global.t('toast.textRandomPositionShuffleOn')
					: i18n.global.t('toast.textRandomPositionShuffleOff')
			);
		},
	},
	{
		keys: ['c'],
		label: 'C',
		descriptionKey: 'toggleTextSingleCluster',
		category: 'text',
		action() {
			if (!store.state.config.textFirework) {
				showToast(i18n.global.t('toast.dependencyTextFirework'));
				return;
			}
			updateConfig({ textSingleCluster: !store.state.config.textSingleCluster });
			showToast(
				store.state.config.textSingleCluster
					? i18n.global.t('toast.textSingleClusterOn')
					: i18n.global.t('toast.textSingleClusterOff')
			);
		},
	},
	{
		keys: ['o'],
		label: 'O',
		descriptionKey: 'toggleSetting',
		category: 'interface',
		action() {
			toggleSetting();
		},
	},
	{
		keys: ['/'],
		label: '/',
		descriptionKey: 'showShortcuts',
		category: 'interface',
		action() {
			if (store.state.openHelpTopic) {
				store.setState({ openHelpTopic: null });
			} else {
				store.setState({ openHelpTopic: 'shortcuts' });
			}
		},
	},
];

/** 按键到快捷键配置的映射，用于快速查找 */
const keyMap = new Map<string, ShortcutDefinition>();

// 构建按键映射
shortcuts.forEach((shortcut) => {
	shortcut.keys.forEach((key) => {
		keyMap.set(key, shortcut);
	});
});

/**
 * 根据按键获取对应的快捷键配置。
 */
export function getShortcutByKey(key: string): ShortcutDefinition | undefined {
	return keyMap.get(key);
}

/**
 * 获取用于帮助面板展示的快捷键列表（去重合并同 label 的条目）。
 */
export function getShortcutsForDisplay(): {
	label: string;
	descriptionKey: string;
	category: string;
}[] {
	const seen = new Set<string>();
	const result: { label: string; descriptionKey: string; category: string }[] = [];
	for (const s of shortcuts) {
		if (!seen.has(s.label)) {
			seen.add(s.label);
			result.push({ label: s.label, descriptionKey: s.descriptionKey, category: s.category });
		}
	}
	return result;
}

/** 分类显示顺序 */
export const shortcutCategoryOrder = ['playback', 'launch', 'visual', 'text', 'interface'];
