import type { FireworkPlugin } from '../types';
import { isHeader } from '@/core/constants';
import type { ShellConfig } from '../../shell-utils';
import { getShellNames, getShellTypes, getFastShellBlacklist } from '../../shell-registry';
import { shellNameSelector } from '@/store/selectors';

function randomShellName(): string {
	const names = getShellNames();
	return Math.random() < 0.5 ? 'Crysanthemum' : names[(Math.random() * (names.length - 1) + 1) | 0];
}

function randomFastShell(): (size: number) => ShellConfig {
	const shellTypes = getShellTypes();
	const blacklist = getFastShellBlacklist();
	const isRandom = shellNameSelector() === 'Random';
	let shellName: string = isRandom ? randomShellName() : shellNameSelector();
	if (isRandom) {
		while (blacklist.includes(shellName)) {
			shellName = randomShellName();
		}
	}
	return shellTypes[shellName];
}

const randomShell = (size: number): ShellConfig => {
	if (isHeader()) return randomFastShell()(size);
	const shellTypes = getShellTypes();
	return shellTypes[randomShellName()](size);
};

export { randomShell };

export default {
	id: 'shell-random',
	description: '随机烟花类型（元类型）',
	shells: [{ name: 'Random', factory: (size?: number) => randomShell(size!) }],
} satisfies FireworkPlugin;
