import type { FireworkPlugin } from '../types';
import { isDesktop } from '@/core/constants';
import { shellSizeSelector, shellNameSelector } from '@/store/selectors';
import { Shell } from '../../shells';
import { getShellFactory } from '../../shell-registry';
import { randomFastShell } from '../../shell-configs';
import { fitShellPositionInBoundsH } from '../../shell-utils';

function seqWave(): number {
	const count = isDesktop() ? 7 : 4;
	const largeSize = shellSizeSelector();
	const smallSize = Math.max(0, largeSize - 1.5);
	const direction = Math.random() < 0.5 ? 1 : -1;

	function launchShell(index: number) {
		const isRandom = shellNameSelector() === 'Random';
		const isEdge = index === 0 || index === count - 1;
		const shellType = isRandom ? randomFastShell() : getShellFactory(shellNameSelector())!;
		const shell = new Shell(shellType(isEdge ? smallSize : largeSize));
		const progress = index / (count - 1);
		const x = direction === 1 ? 0.15 + progress * 0.7 : 0.85 - progress * 0.7;
		const heightBase = 0.5 + Math.sin(progress * Math.PI) * 0.25;
		shell.launch(fitShellPositionInBoundsH(x), heightBase);
	}

	for (let i = 0; i < count; i++) {
		const delay = i * 250 + Math.random() * 80;
		if (delay === 0) {
			launchShell(i);
		} else {
			setTimeout(() => launchShell(i), delay);
		}
	}

	return 2400 + count * 300;
}

const wavePlugin: FireworkPlugin = {
	id: 'sequence-wave',
	description: '波浪烟花序列',
	sequences: [
		{
			name: 'Wave',
			execute: seqWave,
			randomWeight: 0.12,
		},
	],
};

export { seqWave };
export default wavePlugin;
