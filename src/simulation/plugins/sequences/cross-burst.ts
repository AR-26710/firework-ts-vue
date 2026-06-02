import type { FireworkPlugin } from '../types';
import { shellSizeSelector, shellNameSelector } from '@/store/selectors';
import { Shell } from '../../shells';
import { getShellFactory } from '../../shell-registry';
import { randomFastShell } from '../../shell-configs';
import { fitShellPositionInBoundsH } from '../../shell-utils';

function seqCrossBurst(): number {
	const largeSize = shellSizeSelector();
	const smallSize = Math.max(0, largeSize - 1);

	function launchShell(x: number, height: number, useLarge: boolean) {
		const isRandom = shellNameSelector() === 'Random';
		const shellType = isRandom ? randomFastShell() : getShellFactory(shellNameSelector())!;
		const shell = new Shell(shellType(useLarge ? largeSize : smallSize));
		shell.launch(fitShellPositionInBoundsH(x), height);
	}

	launchShell(0.5, 0.7, true);

	const sideDelay = 300 + Math.random() * 200;
	setTimeout(() => {
		launchShell(0.5, 0.2, false);
	}, sideDelay);

	setTimeout(() => {
		launchShell(0.25, 0.45, false);
	}, sideDelay + 100);

	setTimeout(() => {
		launchShell(0.75, 0.45, false);
	}, sideDelay + 100);

	return 3500;
}

const crossBurstPlugin: FireworkPlugin = {
	id: 'sequence-cross-burst',
	description: '十字爆发烟花序列',
	sequences: [
		{
			name: 'Cross Burst',
			execute: seqCrossBurst,
			randomWeight: 0.15,
		},
	],
};

export { seqCrossBurst };
export default crossBurstPlugin;
